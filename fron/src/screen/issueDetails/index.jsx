
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    AlertCircle,
    Bookmark,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FileText,
    Image as ImageIcon,
    MapPin,
    MessageCircle,
    Pencil,
    Send,
    ShieldCheck,
    ThumbsDown,
    ThumbsUp,
    UserRound,
    Trash2,
    X,
} from "lucide-react";

import {
    getPublicIssues,
    getIssueComments,
    createIssueComment,
    updateIssueComment,
    deleteIssueComment,
} from "../../services/issueService";

import "./issueDetails.css";

const DEFAULT_IMAGE = "/images/default-issue.jpeg";

/* Under Review is intentionally removed from this page's timeline. */
const STATUS_STAGES = [
    {
        label: "Submitted",
        description: "The issue has been reported.",
    },
    {
        label: "In Progress",
        description: "Work is underway to resolve the issue.",
    },
    {
        label: "Resolved",
        description: "The issue has been resolved.",
    },
];

const getIssueArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.issues)) return response.issues;
    if (Array.isArray(response?.data?.issues)) return response.data.issues;
    if (Array.isArray(response?.data)) return response.data;

    return [];
};

const normalizeStatus = (status) => {
    const value = String(status || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

    if (["resolved", "completed", "complete", "closed", "fixed"].includes(value)) {
        return "Resolved";
    }

    if (
        ["in progress", "inprogress", "working", "processing"].includes(value)
    ) {
        return "In Progress";
    }

    /*
     * Under Review is displayed as Submitted on this page,
     * so the removed stage does not appear in the timeline or status badge.
     */
    return "Submitted";
};

const getStatusIndex = (status) => {
    const normalized = normalizeStatus(status);

    return STATUS_STAGES.findIndex(
        (stage) => stage.label === normalized
    );
};

const getStatusClass = (status) => {
    return normalizeStatus(status).toLowerCase().replace(/\s+/g, "-");
};

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const getImages = (issue) => {
    const value = issue?.images || issue?.photos || issue?.image || issue?.photo;

    const imageList = Array.isArray(value)
        ? value
        : value
          ? [value]
          : [];

    const images = imageList
        .map((item) => {
            if (typeof item === "string") return item.trim();

            if (item && typeof item === "object") {
                return (
                    item.url ||
                    item.secure_url ||
                    item.imageUrl ||
                    item.src ||
                    ""
                );
            }

            return "";
        })
        .filter(Boolean);

    return images.length ? [...new Set(images)] : [DEFAULT_IMAGE];
};

const getLocation = (issue) => {
    if (typeof issue?.location === "string") {
        return issue.location || "Location not provided";
    }

    if (issue?.location && typeof issue.location === "object") {
        return (
            issue.location.address ||
            issue.location.name ||
            issue.location.label ||
            "Location not provided"
        );
    }

    return "Location not provided";
};

const getReporterName = (issue) => {
    const reporter =
        issue?.createdBy ||
        issue?.reportedBy ||
        issue?.user ||
        issue?.author;

    if (typeof reporter === "string") return "Community Member";

    return (
        reporter?.name ||
        reporter?.fullName ||
        reporter?.username ||
        "Community Member"
    );
};

const getInitials = (name) => {
    return String(name || "CM")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
};

const getVoteCount = (issue, type) => {
    const value = type === "up" ? issue?.upvotes : issue?.downvotes;

    if (Array.isArray(value)) return value.length;
    if (typeof value === "number") return value;

    return 0;
};

const getTimeline = (status) => {
    const currentIndex = Math.max(0, getStatusIndex(status));

    return STATUS_STAGES.map((stage, index) => ({
        ...stage,
        completed: index <= currentIndex,
        current: index === currentIndex,
    }));
};

/* Read the logged-in user's ID safely. */
const getCurrentUserId = () => {
    try {
        const raw =
            localStorage.getItem("voicehub_user") ||
            sessionStorage.getItem("voicehub_user");

        if (!raw) return null;

        const user = JSON.parse(raw);

        return user?._id || user?.id || null;
    } catch {
        return null;
    }
};

function IssueDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* Image preview */
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    /* Comments */
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [commentActionId, setCommentActionId] = useState(null);

    const currentUserId = getCurrentUserId();

    /* Load issue details. */
    useEffect(() => {
        let cancelled = false;

        const loadIssue = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getPublicIssues();
                const issues = getIssueArray(response);

                const found = issues.find(
                    (item) => String(item?._id || item?.id) === String(id)
                );

                if (cancelled) return;

                if (!found) {
                    setIssue(null);
                    setError("This issue could not be found or is no longer public.");
                } else {
                    setIssue(found);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load issue details.");
                    setIssue(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadIssue();

        return () => {
            cancelled = true;
        };
    }, [id]);

    /*
     * Load comments separately.
     * Comments are not fetched together with every issue.
     */
    useEffect(() => {
        let cancelled = false;

        const loadComments = async () => {
            try {
                setCommentsLoading(true);
                setCommentsError("");

                const response = await getIssueComments(id);

                if (!cancelled) {
                    setComments(
                        Array.isArray(response?.comments)
                            ? response.comments
                            : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setCommentsError(
                        err.message || "Unable to load comments."
                    );
                }
            } finally {
                if (!cancelled) setCommentsLoading(false);
            }
        };

        if (id) loadComments();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const images = useMemo(() => getImages(issue), [issue]);

    const currentStatus = normalizeStatus(issue?.status);

    const timeline = useMemo(
        () => getTimeline(currentStatus),
        [currentStatus]
    );

    const reporterName = getReporterName(issue);
    const upvotes = getVoteCount(issue, "up");
    const downvotes = getVoteCount(issue, "down");

    const title = issue?.title || "Untitled issue";
    const description =
        issue?.description || "No description has been provided.";
    const category = issue?.category || "Other";
    const createdDate = issue?.createdAt || issue?.created_at;

    /* Image preview controls */
    const openImage = (index) => {
        setLightboxIndex(index);
        setSelectedImage(images[index] || DEFAULT_IMAGE);
    };

    const closeImage = () => setSelectedImage(null);

    const showPreviousImage = () => {
        const nextIndex =
            (lightboxIndex - 1 + images.length) % images.length;

        setLightboxIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
    };

    const showNextImage = () => {
        const nextIndex = (lightboxIndex + 1) % images.length;

        setLightboxIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
    };

    useEffect(() => {
        if (!selectedImage) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") closeImage();
            if (event.key === "ArrowLeft") showPreviousImage();
            if (event.key === "ArrowRight") showNextImage();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage, lightboxIndex, images]);

    /* Add a new comment. */
    const handleAddComment = async (event) => {
        event.preventDefault();

        if (!commentText.trim()) {
            setCommentsError("Please write a comment first.");
            return;
        }

        try {
            setCommentSubmitting(true);
            setCommentsError("");

            const response = await createIssueComment(id, commentText.trim());

            if (response?.comment) {
                setComments((previous) => [
                    response.comment,
                    ...previous,
                ]);
            }

            setCommentText("");
        } catch (err) {
            setCommentsError(
                err.message || "Failed to add comment. Please try again."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    /* Edit your own comment. */
    const handleEditComment = async (commentId) => {
        if (!editingCommentText.trim()) {
            setCommentsError("Comment cannot be empty.");
            return;
        }

        try {
            setCommentActionId(commentId);
            setCommentsError("");

            const response = await updateIssueComment(
                commentId,
                editingCommentText.trim()
            );

            if (response?.comment) {
                setComments((previous) =>
                    previous.map((comment) =>
                        String(comment._id) === String(commentId)
                            ? response.comment
                            : comment
                    )
                );
            }

            setEditingCommentId(null);
            setEditingCommentText("");
        } catch (err) {
            setCommentsError(
                err.message || "Failed to update comment."
            );
        } finally {
            setCommentActionId(null);
        }
    };

    /* Delete your own comment. */
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            setCommentActionId(commentId);
            setCommentsError("");

            await deleteIssueComment(commentId);

            setComments((previous) =>
                previous.filter(
                    (comment) => String(comment._id) !== String(commentId)
                )
            );
        } catch (err) {
            setCommentsError(
                err.message || "Failed to delete comment."
            );
        } finally {
            setCommentActionId(null);
        }
    };

    if (loading) {
        return (
            <div className="issue-details-page">
                <div className="issue-details-loading">
                    <div className="issue-details-spinner" />
                    <h3>Loading issue details...</h3>
                    <p>Please wait while we fetch the issue information.</p>
                </div>
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="issue-details-page">
                <div className="issue-details-error">
                    <AlertTriangle size={30} />
                    <h2>Issue not available</h2>
                    <p>{error || "The requested issue could not be found."}</p>

                    <button
                        type="button"
                        className="issue-details-primary-button"
                        onClick={() => navigate("/explore")}
                    >
                        <ArrowLeft size={17} />
                        Back to Explore
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="issue-details-page">
            <div className="issue-details-container">
                {/* Top navigation */}
                <div className="issue-details-topbar">
                    <button
                        type="button"
                        className="issue-details-back-button"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <div className="issue-details-breadcrumb">
                        <button
                            type="button"
                            onClick={() => navigate("/explore")}
                        >
                            Explore Issues
                        </button>
                        <ChevronRight size={15} />
                        <span>Issue Details</span>
                    </div>
                </div>

                {/* Issue heading */}
                <section className="issue-details-heading">
                    <div className="issue-details-heading-main">
                        <div className="issue-details-badges">
                            <span className="issue-details-category">
                                {category}
                            </span>
                        </div>

                        <h1>{title}</h1>

                        <div className="issue-details-meta">
                            <span>
                                <MapPin size={16} />
                                {getLocation(issue)}
                            </span>
                            <span>
                                <CalendarDays size={16} />
                                {formatDate(createdDate)}
                            </span>
                            <span>
                                <UserRound size={16} />
                                Reported by {reporterName}
                            </span>
                        </div>
                    </div>

                    <div className="issue-details-heading-actions">
                        <span
                            className={`issue-details-status-badge ${getStatusClass(
                                currentStatus
                            )}`}
                        >
                            <span className="issue-details-status-dot" />
                            {currentStatus}
                        </span>
                    </div>
                </section>

                <div className="details-main-grid">
                    <main className="issue-details-main-column">
                        {/* Photos */}
                        <section className="issue-details-card issue-details-gallery-card">
                            <div className="issue-details-section-heading">
                                <div>
                                    <h2>Issue Photos</h2>
                                    <p>Photos shared with this report</p>
                                </div>

                                <span className="issue-details-image-count">
                                    <ImageIcon size={15} />
                                    {images.length}{" "}
                                    {images.length === 1 ? "photo" : "photos"}
                                </span>
                            </div>

                            <div
                                className={`issue-details-photo-grid ${
                                    images.length === 1
                                        ? "single-photo"
                                        : images.length === 2
                                          ? "two-photos"
                                          : "multiple-photos"
                                }`}
                            >
                                {images.map((image, index) => (
                                    <button
                                        type="button"
                                        className={`issue-details-photo ${
                                            index === 0 ? "main-photo" : ""
                                        }`}
                                        key={`${image}-${index}`}
                                        onClick={() => openImage(index)}
                                        aria-label={`View photo ${index + 1}`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${title} photo ${index + 1}`}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = DEFAULT_IMAGE;
                                            }}
                                        />

                                        <span className="issue-details-photo-overlay">
                                            <Eye size={19} />
                                            View photo
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Description */}
                        <section className="issue-details-card">
                            <div className="issue-details-section-heading">
                                <div>
                                    <h2>Issue Description</h2>
                                    <p>Details provided by the reporter</p>
                                </div>
                                <FileText
                                    className="issue-details-heading-icon"
                                    size={21}
                                />
                            </div>

                            <div className="issue-details-description">
                                {description}
                            </div>

                            <div className="issue-details-location-box">
                                <div className="issue-details-location-icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <span>Reported location</span>
                                    <strong>{getLocation(issue)}</strong>
                                </div>
                            </div>
                        </section>

                        {/* Community votes */}
                        <section className="issue-details-card">
                            <div className="issue-details-section-heading">
                                <div>
                                    <h2>Community Response</h2>
                                    <p>Community engagement with this issue</p>
                                </div>
                                <MessageCircle
                                    className="issue-details-heading-icon"
                                    size={21}
                                />
                            </div>

                            <div className="issue-details-vote-grid">
                                <div className="issue-details-vote-card upvotes">
                                    <div className="issue-details-vote-icon">
                                        <ThumbsUp size={21} />
                                    </div>
                                    <div>
                                        <strong>{upvotes}</strong>
                                        <span>Upvotes</span>
                                    </div>
                                </div>

                                <div className="issue-details-vote-card downvotes">
                                    <div className="issue-details-vote-icon">
                                        <ThumbsDown size={21} />
                                    </div>
                                    <div>
                                        <strong>{downvotes}</strong>
                                        <span>Downvotes</span>
                                    </div>
                                </div>

                                <div className="issue-details-vote-card total-votes">
                                    <div className="issue-details-vote-icon">
                                        <MessageCircle size={21} />
                                    </div>
                                    <div>
                                        <strong>{upvotes + downvotes}</strong>
                                        <span>Total votes</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* REAL COMMENTS */}
                        <section className="issue-details-card issue-comments-card">
                            <div className="issue-comments-heading">
                                <div>
                                    <h2>
                                        <MessageCircle size={21} />
                                        Community Comments
                                    </h2>
                                    <p>
                                        Share updates and discuss this issue.
                                    </p>
                                </div>

                                <span className="issue-comments-count">
                                    {comments.length}
                                </span>
                            </div>

                            <form
                                className="issue-comment-form"
                                onSubmit={handleAddComment}
                            >
                                <textarea
                                    value={commentText}
                                    onChange={(event) =>
                                        setCommentText(event.target.value)
                                    }
                                    placeholder="Write a comment..."
                                    maxLength={1000}
                                    rows={3}
                                    disabled={commentSubmitting}
                                />

                                <div className="issue-comment-form-footer">
                                    <span>{commentText.length}/1000</span>

                                    <button
                                        type="submit"
                                        disabled={
                                            commentSubmitting ||
                                            !commentText.trim()
                                        }
                                    >
                                        <Send size={16} />
                                        {commentSubmitting
                                            ? "Posting..."
                                            : "Post comment"}
                                    </button>
                                </div>
                            </form>

                            {commentsError && (
                                <p className="issue-comment-error">
                                    {commentsError}
                                </p>
                            )}

                            {commentsLoading ? (
                                <p className="issue-comments-message">
                                    Loading comments...
                                </p>
                            ) : comments.length === 0 ? (
                                <div className="issue-comments-empty">
                                    <MessageCircle size={28} />
                                    <strong>No comments yet</strong>
                                    <p>
                                        Be the first to share an update about
                                        this issue.
                                    </p>
                                </div>
                            ) : (
                                <div className="issue-comments-list">
                                    {comments.map((comment) => {
                                        const author = comment.userId;

                                        const authorName =
                                            typeof author === "object"
                                                ? author?.name ||
                                                  "Community Member"
                                                : "Community Member";

                                        const authorId =
                                            typeof author === "object"
                                                ? author?._id
                                                : author;

                                        const isOwner =
                                            currentUserId &&
                                            authorId &&
                                            String(currentUserId) ===
                                                String(authorId);

                                        const isEditing =
                                            String(editingCommentId) ===
                                            String(comment._id);

                                        return (
                                            <article
                                                className="issue-comment"
                                                key={comment._id}
                                            >
                                                <div className="issue-comment-avatar">
                                                    {getInitials(authorName)}
                                                </div>

                                                <div className="issue-comment-body">
                                                    <div className="issue-comment-meta">
                                                        <strong>
                                                            {authorName}
                                                        </strong>
                                                        <span>
                                                            {formatDate(
                                                                comment.createdAt
                                                            )}
                                                            {comment.updatedAt &&
                                                                comment.createdAt !==
                                                                    comment.updatedAt &&
                                                                " · Edited"}
                                                        </span>
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="issue-comment-edit">
                                                            <textarea
                                                                value={
                                                                    editingCommentText
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setEditingCommentText(
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                maxLength={1000}
                                                                rows={3}
                                                            />

                                                            <div>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        commentActionId ===
                                                                        comment._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleEditComment(
                                                                            comment._id
                                                                        )
                                                                    }
                                                                >
                                                                    {commentActionId ===
                                                                    comment._id
                                                                        ? "Saving..."
                                                                        : "Save changes"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCommentId(
                                                                            null
                                                                        );
                                                                        setEditingCommentText(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    <X size={15} />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="issue-comment-text">
                                                            {comment.text}
                                                        </p>
                                                    )}

                                                    {isOwner && !isEditing && (
                                                        <div className="issue-comment-actions">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCommentId(
                                                                        comment._id
                                                                    );
                                                                    setEditingCommentText(
                                                                        comment.text
                                                                    );
                                                                    setCommentsError(
                                                                        ""
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    commentActionId ===
                                                                    comment._id
                                                                }
                                                                onClick={() =>
                                                                    handleDeleteComment(
                                                                        comment._id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 size={14} />
                                                                {commentActionId ===
                                                                comment._id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </main>

                    {/* Sidebar */}
                    <aside className="issue-details-sidebar">
                        <section className="issue-details-card issue-details-progress-card">
                            <div className="issue-details-section-heading">
                                <div>
                                    <h2>Resolution Progress</h2>
                                    <p>Current status of this issue</p>
                                </div>
                                <ShieldCheck
                                    className="issue-details-heading-icon"
                                    size={21}
                                />
                            </div>

                            <div className="issue-details-current-status">
                                <span
                                    className={`issue-details-status-symbol ${getStatusClass(
                                        currentStatus
                                    )}`}
                                >
                                    {currentStatus === "Resolved" ? (
                                        <CheckCircle2 size={21} />
                                    ) : currentStatus === "In Progress" ? (
                                        <Clock3 size={21} />
                                    ) : (
                                        <FileText size={21} />
                                    )}
                                </span>

                                <div>
                                    <span>Current status</span>
                                    <strong>{currentStatus}</strong>
                                </div>
                            </div>

                            <div className="issue-details-timeline">
                                {timeline.map((stage, index) => (
                                    <div
                                        className={`issue-details-timeline-item ${
                                            stage.completed ? "completed" : ""
                                        } ${stage.current ? "current" : ""}`}
                                        key={stage.label}
                                    >
                                        <div className="issue-details-timeline-marker-column">
                                            <div className="issue-details-timeline-marker">
                                                {stage.completed ? (
                                                    <Check size={15} />
                                                ) : (
                                                    <span>{index + 1}</span>
                                                )}
                                            </div>

                                            {index < timeline.length - 1 && (
                                                <div
                                                    className={`issue-details-timeline-line ${
                                                        stage.completed
                                                            ? "completed"
                                                            : ""
                                                    }`}
                                                />
                                            )}
                                        </div>

                                        <div className="issue-details-timeline-content">
                                            <strong>{stage.label}</strong>
                                            <p>{stage.description}</p>

                                            {stage.current && (
                                                <span className="issue-details-current-label">
                                                    Current stage
                                                </span>
                                            )}

                                            {stage.completed &&
                                                !stage.current && (
                                                    <span className="issue-details-completed-label">
                                                        Completed
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {currentStatus === "Resolved" && (
                                <div className="issue-details-resolved-message">
                                    <CheckCircle2 size={18} />
                                    <div>
                                        <strong>Issue resolved</strong>
                                        <p>
                                            All resolution stages have been
                                            completed.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="issue-details-card issue-details-reporter-card">
                            <div className="issue-details-section-heading">
                                <div>
                                    <h2>Reported By</h2>
                                    <p>Community member details</p>
                                </div>
                            </div>

                            <div className="issue-details-reporter">
                                <div className="issue-details-avatar">
                                    {getInitials(reporterName)}
                                </div>
                                <div className="issue-details-reporter-info">
                                    <strong>{reporterName}</strong>
                                    <span>Community member</span>
                                </div>
                            </div>

                            <div className="issue-details-reporter-date">
                                <CalendarDays size={16} />
                                <div>
                                    <span>Reported on</span>
                                    <strong>{formatDateTime(createdDate)}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="issue-details-help-card">
                            <div className="issue-details-help-icon">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3>Community impact</h3>
                                <p>
                                    Reporting local problems helps the
                                    community track concerns and their
                                    resolution.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/explore")}
                                >
                                    Explore other issues
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>

                <div className="issue-details-bottom-navigation">
                    <button
                        type="button"
                        className="issue-details-back-button"
                        onClick={() => navigate("/explore")}
                    >
                        <ChevronLeft size={17} />
                        Back to all issues
                    </button>

                    <span>
                        Issue ID:{" "}
                        {String(issue._id || issue.id || "").slice(-8)}
                    </span>
                </div>
            </div>

            {/* Image lightbox */}
            {selectedImage && (
                <div
                    className="issue-details-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Issue photo preview"
                    onClick={closeImage}
                >
                    <button
                        type="button"
                        className="issue-details-lightbox-close"
                        onClick={closeImage}
                        aria-label="Close preview"
                    >
                        <X size={25} />
                    </button>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="issue-details-lightbox-arrow previous"
                            onClick={(event) => {
                                event.stopPropagation();
                                showPreviousImage();
                            }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={30} />
                        </button>
                    )}

                    <div
                        className="issue-details-lightbox-content"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt={`${title} enlarged`}
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = DEFAULT_IMAGE;
                            }}
                        />

                        <div className="issue-details-lightbox-caption">
                            <span>{title}</span>
                            <span>
                                {lightboxIndex + 1} / {images.length}
                            </span>
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button
                            type="button"
                            className="issue-details-lightbox-arrow next"
                            onClick={(event) => {
                                event.stopPropagation();
                                showNextImage();
                            }}
                            aria-label="Next image"
                        >
                            <ChevronRight size={30} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default IssueDetails;
