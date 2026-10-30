
import { useState } from "react";

import {
    ArrowBigDown,
    ArrowBigUp,
    Bookmark,
    CalendarDays,
    ChevronRight,
    LoaderCircle,
    MapPin,
    MessageCircle,
} from "lucide-react";

import IssueCommentsModal from "./IssueCommentsModal";
import "./issueCard.css";

const DEFAULT_ISSUE_IMAGE = "/images/default-issue.jpeg";

function IssueCard({
    issue,
    onVote,
    voting = false,
    onView,
    onToggleSave,
    isSaved = false,
    saving = false,
    commentCount: commentCountProp,
    onCommentCountChange,
}) {
    const [imageSrc, setImageSrc] = useState(
        issue?.images?.[0]?.url ||
            issue?.image ||
            DEFAULT_ISSUE_IMAGE
    );

    const [imageFailed, setImageFailed] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);

    const location =
        typeof issue?.location === "string"
            ? issue.location
            : issue?.location?.address ||
              issue?.location?.name ||
              "Location not provided";

    const userVote = issue?.userVote || "none";
    const upvotes = Number(issue?.upvotes || 0);
    const downvotes = Number(issue?.downvotes || 0);

    const commentCount =
        typeof commentCountProp === "number"
            ? commentCountProp
            : typeof issue?.commentCount === "number"
              ? issue.commentCount
              : typeof issue?.commentsCount === "number"
                ? issue.commentsCount
                : Array.isArray(issue?.comments)
                  ? issue.comments.length
                  : 0;

    const author =
        issue?.createdBy?.name ||
        issue?.user?.name ||
        "Community Member";

    const formatDate = (date) => {
        if (!date) return "Recently";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Recently";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatus = () => {
        const value = String(issue?.status || "Submitted").toLowerCase();

        if (value.includes("resolved") || value.includes("completed")) {
            return "Resolved";
        }

        if (value.includes("progress")) {
            return "In Progress";
        }

        if (value.includes("review")) {
            return "Under Review";
        }

        return "Submitted";
    };

    const status = getStatus();

    const handleVote = (vote) => {
        if (voting || !onVote || !issue?._id) return;
        onVote(issue._id, vote);
    };

    const handleSave = (event) => {
        event.stopPropagation();

        if (saving || !onToggleSave || !issue?._id) return;
        onToggleSave(issue._id);
    };

    const handleView = () => {
        if (onView) onView(issue);
    };

    const handleImageError = () => {
        if (!imageFailed) {
            setImageFailed(true);
            setImageSrc(DEFAULT_ISSUE_IMAGE);
        }
    };

    return (
        <>
            <article className="issue-card">
                <div className="issue-card-image">
                    <img
                        src={imageSrc}
                        alt={issue?.title || "Community issue"}
                        loading="lazy"
                        onError={handleImageError}
                    />

                    {imageFailed && (
                        <span className="image-fallback-label">
                            Community Issue
                        </span>
                    )}

                    <div className="issue-image-overlay" />

                    <span
                        className={`issue-status ${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                    >
                        <span />
                        {status}
                    </span>

                    <span className="issue-category">
                        {issue?.category || "Other"}
                    </span>

                    <button
                        type="button"
                        className={`issue-save ${
                            isSaved ? "saved" : ""
                        } ${saving ? "saving" : ""}`}
                        onClick={handleSave}
                        disabled={saving || !onToggleSave}
                        aria-label={
                            saving
                                ? "Updating saved issue"
                                : isSaved
                                  ? "Remove from saved issues"
                                  : "Save issue"
                        }
                        aria-pressed={isSaved}
                        title={
                            saving
                                ? "Updating..."
                                : isSaved
                                  ? "Remove from Saved Issues"
                                  : "Save issue"
                        }
                    >
                        {saving ? (
                            <LoaderCircle
                                size={17}
                                className="vote-loader"
                            />
                        ) : (
                            <Bookmark
                                size={17}
                                fill={isSaved ? "currentColor" : "none"}
                            />
                        )}
                    </button>
                </div>

                <div className="issue-card-body">
                    <div className="issue-meta-row">
                        <span>
                            <CalendarDays size={13} />
                            {formatDate(issue?.createdAt)}
                        </span>

                        <span className="issue-location">
                            <MapPin size={13} />
                            <span>{location}</span>
                        </span>
                    </div>

                    <h3 className="issue-title">
                        {issue?.title || "Untitled Issue"}
                    </h3>

                    <p className="issue-description">
                        {issue?.description || "No description available."}
                    </p>

                    <div className="issue-author">
                        <span className="author-avatar">
                            {author.charAt(0).toUpperCase()}
                        </span>

                        <span className="issue-author-label">
                            Reported by
                            <strong>{author}</strong>
                        </span>
                    </div>

                    <div className="issue-card-divider" />

                    <div className="issue-card-actions">
                        <div className="vote-group">
                            <button
                                type="button"
                                className={`vote-button upvote ${
                                    userVote === "up" ? "selected" : ""
                                }`}
                                onClick={() => handleVote("up")}
                                disabled={voting}
                                aria-pressed={userVote === "up"}
                                aria-label={`Upvote, ${upvotes} votes`}
                                title="Upvote"
                            >
                                {voting ? (
                                    <LoaderCircle
                                        size={17}
                                        className="vote-loader"
                                    />
                                ) : (
                                    <ArrowBigUp
                                        size={18}
                                        fill={
                                            userVote === "up"
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />
                                )}
                                <span>{upvotes}</span>
                            </button>

                            <button
                                type="button"
                                className={`vote-button downvote ${
                                    userVote === "down" ? "selected" : ""
                                }`}
                                onClick={() => handleVote("down")}
                                disabled={voting}
                                aria-pressed={userVote === "down"}
                                aria-label={`Downvote, ${downvotes} votes`}
                                title="Downvote"
                            >
                                {voting ? (
                                    <LoaderCircle
                                        size={17}
                                        className="vote-loader"
                                    />
                                ) : (
                                    <ArrowBigDown
                                        size={18}
                                        fill={
                                            userVote === "down"
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />
                                )}
                                <span>{downvotes}</span>
                            </button>

                            <button
                                type="button"
                                className="comment-button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setCommentsOpen(true);
                                }}
                                title="Open comments"
                                aria-label={`Open comments, ${commentCount} comments`}
                            >
                                <MessageCircle size={16} />
                                <span>{commentCount}</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            className="view-discussion-button"
                            onClick={handleView}
                        >
                            <span>View Details</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </article>

            {commentsOpen && (
                <IssueCommentsModal
                    issue={issue}
                    onClose={() => setCommentsOpen(false)}
                    onCommentCountChange={onCommentCountChange}
                />
            )}
        </>
    );
}

export default IssueCard;
