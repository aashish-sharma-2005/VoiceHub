
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bookmark,
    MapPin,
    Trash2,
    RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    getSavedIssues,
    removeSavedIssue,
} from "../../services/issueService";

import "./savedIssue.css";

function SavedIssues() {
    const navigate = useNavigate();

    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const fetchSavedIssues = async () => {
        try {
            setLoading(true);

            const response = await getSavedIssues();
            setIssues(response.issues || []);
        } catch (error) {
            toast.error(
                error.message || "Failed to load saved issues"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedIssues();
    }, []);

    // Open issue details when the card is clicked.
    const handleViewDetails = (issueId) => {
        if (!issueId) {
            toast.error("Issue details are unavailable");
            return;
        }

        navigate(`/issue/${issueId}`);
    };

    // Remove an issue without opening its details page.
    const handleRemove = async (issueId) => {
        try {
            setRemovingId(issueId);

            await removeSavedIssue(issueId);

            setIssues((previousIssues) =>
                previousIssues.filter(
                    (issue) => issue._id !== issueId
                )
            );

            toast.success("Issue removed from saved issues");
        } catch (error) {
            toast.error(
                error.message || "Could not remove issue"
            );
        } finally {
            setRemovingId(null);
        }
    };

    // Support both string URLs and image objects.
    const getIssueImage = (issue) => {
        if (!Array.isArray(issue.images) || issue.images.length === 0) {
            return "/images/default-issue.jpeg";
        }

        const firstImage = issue.images[0];

        return typeof firstImage === "string"
            ? firstImage
            : firstImage?.url || "/images/default-issue.jpeg";
    };

    if (loading) {
        return (
            <div className="saved-page">
                <div className="saved-message">
                    <RefreshCw size={20} className="saved-loading-icon" />
                    <p>Loading saved issues...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-page">
            {/* Page Header */}
            <div className="saved-header">
                <div>
                    <h1>Saved Issues</h1>
                    <p>
                        Keep track of community issues you want to follow.
                    </p>
                </div>

                <button
                    className="saved-refresh"
                    onClick={fetchSavedIssues}
                    type="button"
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Saved Issues Count */}
            <div className="saved-count">
                <Bookmark size={19} />
                <span>
                    {issues.length} saved{" "}
                    {issues.length === 1 ? "issue" : "issues"}
                </span>
            </div>

            {/* Empty State */}
            {issues.length === 0 ? (
                <div className="saved-empty">
                    <div className="saved-empty-icon">
                        <Bookmark size={38} />
                    </div>

                    <h2>No saved issues yet</h2>

                    <p>
                        Visit Explore and save an issue to find it here later.
                    </p>

                    <button
                        className="saved-refresh"
                        type="button"
                        onClick={() => navigate("/explore")}
                    >
                        Explore Issues
                    </button>
                </div>
            ) : (
                /* Saved Issues Grid */
                <div className="saved-grid">
                    {issues.map((issue) => (
                        <article
                            className="saved-card"
                            key={issue._id}
                            onClick={() => handleViewDetails(issue._id)}
                            role="link"
                            tabIndex={0}
                            aria-label={`View details for ${
                                issue.title || "community issue"
                            }`}
                            onKeyDown={(event) => {
                                if (
                                    event.target === event.currentTarget &&
                                    (event.key === "Enter" ||
                                        event.key === " ")
                                ) {
                                    event.preventDefault();
                                    handleViewDetails(issue._id);
                                }
                            }}
                        >
                            {/* Issue Image */}
                            <img
                                className="saved-image"
                                src={getIssueImage(issue)}
                                alt={issue.title || "Community issue"}
                                loading="lazy"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        "/images/default-issue.jpeg";
                                }}
                            />

                            {/* Issue Information */}
                            <div className="saved-card-content">
                                <span className="saved-category">
                                    {issue.category || "Other"}
                                </span>

                                <h2>
                                    {issue.title || "Untitled issue"}
                                </h2>

                                <p className="saved-description">
                                    {issue.description ||
                                        "No description available."}
                                </p>

                                <div className="saved-location">
                                    <MapPin size={15} />
                                    <span>
                                        {issue.location ||
                                            "Location not provided"}
                                    </span>
                                </div>

                                {/* Status and Remove Action */}
                                <div className="saved-card-footer">
                                    <span className="saved-status">
                                        {issue.status || "Submitted"}
                                    </span>

                                    <button
                                        className="saved-remove"
                                        type="button"
                                        disabled={removingId === issue._id}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleRemove(issue._id);
                                        }}
                                        onKeyDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                    >
                                        <Trash2 size={15} />

                                        {removingId === issue._id
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedIssues;
