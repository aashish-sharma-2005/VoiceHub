import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Clock3,
  MessageCircle,
  Bookmark,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";

import { getMyIssues } from "../../services/issueService";

import "./myIssue.css";

function MyIssue() {
  const token = useSelector((state) => state.login?.token);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyIssues();

      setIssues(data.issues || []);
    } catch (error) {
      console.error("Fetch my issues error:", error);

      setError(
        error.message || "Unable to load your reported issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyIssues();
    } else {
      setLoading(false);
      setError("Authentication required. Please login again.");
    }
  }, [token]);

  const formatTimeAgo = (date) => {
    if (!date) {
      return "Recently";
    }

    const created = new Date(date);
    const now = new Date();

    const difference = Math.floor(
      (now - created) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    const minutes = Math.floor(difference / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    return created.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (!status) {
      return "status-reviewing";
    }

    const value = status.toLowerCase();

    if (value.includes("resolved")) {
      return "status-resolved";
    }

    if (
      value.includes("progress") ||
      value.includes("working")
    ) {
      return "status-progress";
    }

    if (
      value.includes("review") ||
      value.includes("submitted")
    ) {
      return "status-reviewing";
    }

    return "status-reviewing";
  };

  const getStatusIcon = (status) => {
    if (!status) {
      return <Clock3 size={14} />;
    }

    const value = status.toLowerCase();

    if (value.includes("resolved")) {
      return <CheckCircle2 size={14} />;
    }

    if (value.includes("progress")) {
      return <Clock3 size={14} />;
    }

    return <AlertCircle size={14} />;
  };

  const getModerationIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 size={14} />;

      case "Dismissed":
        return <XCircle size={14} />;

      default:
        return <Clock3 size={14} />;
    }
  };

  const getModerationClass = (status) => {
    switch (status) {
      case "Approved":
        return "moderation-approved";

      case "Dismissed":
        return "moderation-dismissed";

      default:
        return "moderation-pending";
    }
  };

  const getCommentsCount = (issue) => {
    if (typeof issue.comments === "number") {
      return issue.comments;
    }

    if (Array.isArray(issue.comments)) {
      return issue.comments.length;
    }

    if (typeof issue.commentCount === "number") {
      return issue.commentCount;
    }

    return 0;
  };

  return (
    <div className="my-issues-page">

      {/* TOP HEADER */}

      <div className="my-issues-topbar">

        <div className="my-issues-breadcrumb">
          <span>Community Voice</span>
          <span className="breadcrumb-arrow">›</span>
          <strong>My Reported Issues</strong>
          <span className="breadcrumb-arrow">›</span>
          <span>Metro Region</span>
        </div>

        <div className="my-issues-actions">

          <div className="view-toggle">

            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={15} />
              Grid
            </button>

            <button
              type="button"
              className={view === "compact" ? "active" : ""}
              onClick={() => setView("compact")}
            >
              <List size={15} />
              Compact
            </button>

          </div>

          <button
            type="button"
            className="report-issue-button"
          >
            <Plus size={16} />
            Report Issue
          </button>

        </div>

      </div>

      {/* PAGE TITLE */}

      <div className="my-issues-heading">

        <div>
          <h1>My Reported Issues</h1>

          <p>
            Track and manage complaints logged under your profile.
          </p>
        </div>

        <button
          type="button"
          className="new-issue-button"
        >
          <Plus size={17} />
          New Issue
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="my-issues-state">

          <div className="loading-spinner"></div>

          <h3>Loading your issues...</h3>

          <p>
            Please wait while we fetch your reported issues.
          </p>

        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="my-issues-state error-state">

          <div className="state-icon">
            <AlertCircle size={28} />
          </div>

          <h3>Unable to load your issues</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchMyIssues}
            className="retry-button"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        issues.length === 0 && (
          <div className="my-issues-state">

            <div className="state-icon">
              <ClipboardList size={30} />
            </div>

            <h3>No issues reported yet</h3>

            <p>
              You haven't reported any community issues yet.
            </p>

            <button
              type="button"
              className="new-issue-button empty-new-button"
            >
              <Plus size={16} />
              Report Your First Issue
            </button>

          </div>
        )}

      {/* ISSUES */}

      {!loading &&
        !error &&
        issues.length > 0 && (

          <div
            className={`my-issues-list ${
              view === "compact"
                ? "compact-view"
                : ""
            }`}
          >

            {issues.map((issue) => (

              <article
                className="my-issue-card"
                key={issue._id}
              >

                {/* IMAGE */}

                <div className="my-issue-image">

                  <img
                    src={
                      issue.images &&
                      issue.images.length > 0
                        ? issue.images[0].url
                        : "/images/default-issue.jpeg"
                    }
                    alt={issue.title || "Issue"}
                  />

                  {/* STATUS */}

                  <div
                    className={`issue-status-badge ${getStatusClass(
                      issue.status
                    )}`}
                  >
                    {getStatusIcon(issue.status)}
                    {issue.status || "Under Review"}
                  </div>

                  {/* CATEGORY */}

                  <div className="issue-category-badge">
                    {issue.category || "General"}
                  </div>

                </div>

                {/* CONTENT */}

                <div className="my-issue-content">

                  {/* META */}

                  <div className="my-issue-meta">

                    <span>
                      <Clock3 size={14} />
                      {formatTimeAgo(issue.createdAt)}
                    </span>

                    <span className="meta-dot">•</span>

                    <span className="location-text">
                      <MapPin size={14} />
                      {issue.location || "Metro Region"}
                    </span>

                  </div>

                  {/* TITLE */}

                  <h2>
                    {issue.title || "Untitled Issue"}
                  </h2>

                  {/* DESCRIPTION */}

                  <p className="my-issue-description">
                    {issue.description ||
                      "No description provided for this issue."}
                  </p>

                  {/* MODERATION */}

                  {issue.moderationStatus &&
                    issue.moderationStatus !== "Approved" && (

                      <div
                        className={`my-issue-moderation ${getModerationClass(
                          issue.moderationStatus
                        )}`}
                      >
                        {getModerationIcon(
                          issue.moderationStatus
                        )}

                        {issue.moderationStatus}
                      </div>

                    )}

                  {/* FOOTER */}

                  <div className="my-issue-footer">

                    <div className="issue-user">

                      <div className="issue-user-avatar">
                        {issue.user?.name?.charAt(0) ||
                          "U"}
                      </div>

                      <span>
                        {issue.user?.name ||
                          issue.reportedBy?.name ||
                          "You"}
                      </span>

                    </div>

                    <div className="issue-card-actions">

                      <span className="issue-action-count">
                        <ThumbsUpIcon />
                        {issue.upvotes ?? 0}
                      </span>

                      <span className="issue-action-count">
                        <MessageCircle size={15} />
                        {getCommentsCount(issue)}
                      </span>

                      <button
                        type="button"
                        className="icon-action"
                        title="Save issue"
                      >
                        <Bookmark size={16} />
                      </button>

                      <button
                        type="button"
                        className="icon-action"
                        title="Share issue"
                      >
                        <Share2 size={16} />
                      </button>

                    </div>

                  </div>

                  {/* DISMISS REASON */}

                  {issue.moderationStatus ===
                    "Dismissed" &&
                    issue.dismissReason && (

                      <div className="dismiss-reason">

                        <strong>
                          Dismissal reason:
                        </strong>

                        <span>
                          {issue.dismissReason}
                        </span>

                      </div>

                    )}

                </div>

              </article>

            ))}

          </div>

        )}

    </div>
  );
}

function ThumbsUpIcon() {
  return <span className="thumb-up-icon">↑</span>;
}

export default MyIssue;