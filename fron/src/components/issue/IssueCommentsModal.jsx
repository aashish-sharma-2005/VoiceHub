
import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    LoaderCircle,
    MessageCircle,
    Send,
    Trash2,
    X,
    Pencil,
    Check,
    MoreVertical,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    getIssueComments,
    createIssueComment,
    updateIssueComment,
    deleteIssueComment,
} from "../../services/issueService";

import "./IssueCommentsModal.css";

const EDIT_WINDOW_MS = 15 * 60 * 1000;

function canEditComment(comment) {
    if (!comment?.createdAt) return false;

    const createdAt = new Date(comment.createdAt).getTime();

    if (Number.isNaN(createdAt)) return false;

    const elapsed = Date.now() - createdAt;

    return elapsed >= 0 && elapsed <= EDIT_WINDOW_MS;
}

function getStoredUser() {
    try {
        const stored =
            localStorage.getItem("voicehub_user") ||
            sessionStorage.getItem("voicehub_user");

        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function getCommentUserId(comment) {
    const user = comment?.userId || comment?.user;

    if (typeof user === "string") return user;

    return user?._id || user?.id || "";
}

function getCommentAuthor(comment) {
    const user = comment?.userId || comment?.user;

    return typeof user === "object" && user?.name
        ? user.name
        : "Community Member";
}

function formatCommentDate(date) {
    if (!date) return "Recently";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Recently";

    return parsed.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function IssueCommentsModal({
    issue,
    onClose,
    onCommentCountChange,
}) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);

    // Keep the latest callback without making loadComments refetch on every render.
    const countChangeRef = useRef(onCommentCountChange);

    useEffect(() => {
        countChangeRef.current = onCommentCountChange;
    }, [onCommentCountChange]);

    const token =
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token");

    const currentUser = getStoredUser();

    const currentUserId = String(
        currentUser?._id || currentUser?.id || currentUser?.userId || ""
    );

    const loadComments = useCallback(async () => {
        if (!issue?._id) return;

        setLoading(true);
        setError("");

        try {
            const result = await getIssueComments(issue._id);

            if (result?.success === false) {
                throw new Error(
                    result.message || "Unable to load comments."
                );
            }

            const loadedComments = Array.isArray(result?.comments)
                ? result.comments
                : Array.isArray(result?.data?.comments)
                  ? result.data.comments
                  : Array.isArray(result)
                    ? result
                    : [];

            setComments(loadedComments);
            countChangeRef.current?.(loadedComments.length);
        } catch (err) {
            setError(err.message || "Unable to load comments.");
        } finally {
            setLoading(false);
        }
    }, [issue?._id]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (openMenuId) {
                    setOpenMenuId(null);
                } else if (!submitting) {
                    onClose();
                }
            }
        };

        const handleOutsideClick = (event) => {
            if (!event.target.closest(".vh-comment-menu-wrap")) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [onClose, openMenuId, submitting]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmed = text.trim();

        if (!trimmed || submitting) return;

        if (!token) {
            toast.info("Please log in to add a comment.");
            return;
        }

        setSubmitting(true);

        try {
            const result = await createIssueComment(issue._id, trimmed);

            if (result?.success === false) {
                throw new Error(
                    result.message || "Could not add comment."
                );
            }

            if (result?.comment) {
                const updatedComments = [result.comment, ...comments];

                setComments(updatedComments);
                countChangeRef.current?.(updatedComments.length);
            } else {
                await loadComments();
            }

            setText("");
            toast.success("Comment added.");
        } catch (err) {
            toast.error(err.message || "Could not add comment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEdit = (comment) => {
        setOpenMenuId(null);

        if (!canEditComment(comment)) {
            toast.info(
                "Comments can only be edited within 15 minutes of posting."
            );
            return;
        }

        setEditingId(comment._id);
        setEditText(comment.text || "");
    };

    const handleEdit = async (comment) => {
        const trimmed = editText.trim();

        if (!trimmed || busyId) return;

        if (!canEditComment(comment)) {
            setEditingId(null);
            setEditText("");

            toast.info(
                "The 15-minute editing period has expired. You can still delete your comment."
            );
            return;
        }

        setBusyId(comment._id);

        try {
            const result = await updateIssueComment(
                comment._id,
                trimmed
            );

            if (result?.success === false) {
                throw new Error(
                    result.message || "Could not update comment."
                );
            }

            if (result?.comment) {
                setComments((previous) =>
                    previous.map((item) =>
                        item._id === comment._id ? result.comment : item
                    )
                );
            } else {
                await loadComments();
            }

            setEditingId(null);
            setEditText("");
            toast.success("Comment updated.");
        } catch (err) {
            toast.error(err.message || "Could not update comment.");
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (comment) => {
        setOpenMenuId(null);

        if (busyId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        setBusyId(comment._id);

        try {
            const result = await deleteIssueComment(comment._id);

            if (result?.success === false) {
                throw new Error(
                    result.message || "Could not delete comment."
                );
            }

            const updatedComments = comments.filter(
                (item) => item._id !== comment._id
            );

            setComments(updatedComments);
            countChangeRef.current?.(updatedComments.length);

            if (editingId === comment._id) {
                setEditingId(null);
                setEditText("");
            }

            toast.success("Comment deleted.");
        } catch (err) {
            toast.error(err.message || "Could not delete comment.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div
            className="vh-comments-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="vh-comments-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Issue comments"
            >
                <header className="vh-comments-header">
                    <div className="vh-comments-heading">
                        <span className="vh-comments-heading-icon">
                            <MessageCircle size={19} />
                        </span>

                        <div>
                            <h2>Comments</h2>
                            <p>
                                {comments.length}{" "}
                                {comments.length === 1
                                    ? "comment"
                                    : "comments"}{" "}
                                on this issue
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="vh-comments-close"
                        onClick={onClose}
                        aria-label="Close comments"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="vh-comments-issue">
                    <span className="vh-comments-issue-label">
                        DISCUSSION FOR
                    </span>

                    <h3>{issue?.title || "Community Issue"}</h3>

                    <p>
                        {issue?.description ||
                            "Share a helpful thought or update with your community."}
                    </p>
                </div>

                <div className="vh-comments-list">
                    {loading ? (
                        <div className="vh-comments-state">
                            <LoaderCircle className="vh-comments-spinner" />
                            <span>Loading comments...</span>
                        </div>
                    ) : error ? (
                        <div className="vh-comments-state vh-comments-error">
                            <AlertCircle size={22} />
                            <p>{error}</p>
                            <button type="button" onClick={loadComments}>
                                Try again
                            </button>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="vh-comments-state">
                            <span className="vh-comments-empty-icon">
                                <MessageCircle size={24} />
                            </span>
                            <strong>No comments yet</strong>
                            <p>Be the first to join the discussion.</p>
                        </div>
                    ) : (
                        comments.map((comment) => {
                            const author = getCommentAuthor(comment);

                            const isOwner =
                                Boolean(currentUserId) &&
                                String(getCommentUserId(comment)) ===
                                    currentUserId;

                            const canEdit =
                                isOwner && canEditComment(comment);

                            return (
                                <article
                                    className="vh-comment"
                                    key={comment._id}
                                >
                                    <span className="vh-comment-avatar">
                                        {author.charAt(0).toUpperCase()}
                                    </span>

                                    <div className="vh-comment-content">
                                        <div className="vh-comment-topline">
                                            <strong>{author}</strong>

                                            <time>
                                                {formatCommentDate(
                                                    comment.createdAt
                                                )}
                                            </time>

                                            {isOwner &&
                                                editingId !== comment._id && (
                                                    <div className="vh-comment-menu-wrap">
                                                        <button
                                                            type="button"
                                                            className="vh-comment-menu-trigger"
                                                            aria-label="Comment options"
                                                            aria-expanded={
                                                                openMenuId ===
                                                                comment._id
                                                            }
                                                            onClick={() =>
                                                                setOpenMenuId(
                                                                    openMenuId ===
                                                                        comment._id
                                                                        ? null
                                                                        : comment._id
                                                                )
                                                            }
                                                        >
                                                            <MoreVertical
                                                                size={19}
                                                            />
                                                        </button>

                                                        {openMenuId ===
                                                            comment._id && (
                                                            <div className="vh-comment-menu">
                                                                {canEdit && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleStartEdit(
                                                                                comment
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil size={15} />
                                                                        Edit
                                                                    </button>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className="vh-comment-menu-delete"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            comment
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 size={15} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>

                                        {editingId === comment._id ? (
                                            <div className="vh-comment-edit">
                                                <textarea
                                                    value={editText}
                                                    onChange={(event) =>
                                                        setEditText(
                                                            event.target.value
                                                        )
                                                    }
                                                    maxLength={1000}
                                                    rows={3}
                                                    autoFocus
                                                />

                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditText("");
                                                        }}
                                                        disabled={
                                                            busyId === comment._id
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="vh-comment-save-edit"
                                                        onClick={() =>
                                                            handleEdit(comment)
                                                        }
                                                        disabled={
                                                            !editText.trim() ||
                                                            busyId === comment._id
                                                        }
                                                    >
                                                        {busyId === comment._id ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="vh-comments-spinner"
                                                            />
                                                        ) : (
                                                            <Check size={14} />
                                                        )}
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="vh-comment-text">
                                                {comment.text}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <form
                    className="vh-comments-composer"
                    onSubmit={handleSubmit}
                >
                    <span className="vh-comment-avatar vh-composer-avatar">
                        {currentUser?.name
                            ? currentUser.name.charAt(0).toUpperCase()
                            : "Y"}
                    </span>

                    <div className="vh-comments-input-wrap">
                        <textarea
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder={
                                token
                                    ? "Add a comment..."
                                    : "Log in to join the discussion..."
                            }
                            maxLength={1000}
                            rows={2}
                            disabled={!token || submitting}
                        />

                        <div className="vh-comments-composer-bottom">
                            <span>{text.length}/1000</span>

                            <button
                                type="submit"
                                disabled={
                                    !token ||
                                    !text.trim() ||
                                    submitting
                                }
                            >
                                {submitting ? (
                                    <LoaderCircle
                                        size={16}
                                        className="vh-comments-spinner"
                                    />
                                ) : (
                                    <Send size={15} />
                                )}
                                Post
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default IssueCommentsModal;
