import { useEffect, useState } from "react";
import {
Search,
RefreshCw,
MapPin,
UserRound,
CalendarDays,
ThumbsUp,
ThumbsDown,
MessageCircle,
CheckCircle2,
Eye,
X,
} from "lucide-react";

import { getManageIssues } from "../../services/issueService";

import "./approvedIssue.css";

function ApprovedIssues() {
const [issues, setIssues] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [selectedIssue, setSelectedIssue] = useState(null);

/* =========================
FETCH APPROVED ISSUES
========================= */

const fetchApprovedIssues = async () => {
try {
setLoading(true);
setError("");

  const data = await getManageIssues();

  const allIssues = data.issues || [];

  const approvedIssues = allIssues.filter(
    (issue) => issue.moderationStatus === "Approved"
  );

  setIssues(approvedIssues);
} catch (error) {
  console.error("Fetch approved issues error:", error);

  setError(
    error.message || "Unable to load approved issues."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchApprovedIssues();
}, []);

/* =========================
SEARCH
========================= */

const filteredIssues = issues.filter((issue) => {
const searchText = search.toLowerCase().trim();

if (!searchText) {
  return true;
}

return (
  issue.title?.toLowerCase().includes(searchText) ||
  issue.category?.toLowerCase().includes(searchText) ||
  issue.location?.toLowerCase().includes(searchText) ||
  issue.createdBy?.name?.toLowerCase().includes(searchText)
);

});

/* =========================
DATE
========================= */

const formatDate = (date) => {
if (!date) {
return "Unknown date";
}

return new Date(date).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

};

/* =========================
IMAGE
========================= */

const getIssueImage = (issue) => {
if (
issue.images &&
issue.images.length > 0 &&
issue.images[0]?.url
) {
return issue.images[0].url;
}

return "/images/default-issue.jpeg";

};

/* =========================
CLOSE MODAL
========================= */

const closeModal = () => {
setSelectedIssue(null);
};

return ( <div className="approved-issues-page">

```
  {/* HEADER */}

  <div className="approved-page-header">

    <div className="approved-header-content">

      <div className="approved-header-icon">
        <CheckCircle2 size={25} />
      </div>

      <div>
        <div className="approved-breadcrumb">
          Community Voice
          <span>›</span>
          Moderation
          <span>›</span>
          Approved Issues
        </div>

        <h1>Approved Issues</h1>

        <p>
          View community issues that have been approved
          and are publicly visible.
        </p>
      </div>

    </div>

    <button
      type="button"
      className="approved-refresh-button"
      onClick={fetchApprovedIssues}
      disabled={loading}
    >
      <RefreshCw
        size={16}
        className={loading ? "approved-refresh-spin" : ""}
      />
      Refresh
    </button>

  </div>

  {/* TOOLBAR */}

  {!loading && !error && (
    <div className="approved-toolbar">

      <div className="approved-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search approved issues..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

      </div>

      <div className="approved-count">
        <strong>{filteredIssues.length}</strong>
        <span>
          {filteredIssues.length === 1 ? "Issue" : "Issues"}
        </span>
      </div>

    </div>
  )}

  {/* LOADING */}

  {loading && (
    <div className="approved-state">

      <RefreshCw
        size={30}
        className="approved-loading-icon"
      />

      <h3>Loading approved issues...</h3>

      <p>
        Fetching issues that have been approved.
      </p>

    </div>
  )}

  {/* ERROR */}

  {!loading && error && (
    <div className="approved-state error">

      <div className="approved-state-icon">
        <X size={28} />
      </div>

      <h3>Unable to load approved issues</h3>

      <p>{error}</p>

      <button
        type="button"
        className="approved-retry-button"
        onClick={fetchApprovedIssues}
      >
        <RefreshCw size={16} />
        Try Again
      </button>

    </div>
  )}

  {/* EMPTY */}

  {!loading &&
    !error &&
    filteredIssues.length === 0 && (
      <div className="approved-state">

        <div className="approved-state-icon success">
          <CheckCircle2 size={28} />
        </div>

        <h3>
          {search
            ? "No matching issues"
            : "No approved issues"}
        </h3>

        <p>
          {search
            ? "Try changing your search."
            : "No issues have been approved yet."}
        </p>

      </div>
    )}

  {/* ISSUE LIST */}

  {!loading &&
    !error &&
    filteredIssues.length > 0 && (
      <div className="approved-issues-list">

        {filteredIssues.map((issue) => (
          <article
            className="approved-issue-card"
            key={issue._id}
          >

            {/* IMAGE */}

            <div className="approved-image-wrapper">

              <img
                src={getIssueImage(issue)}
                alt={issue.title || "Approved issue"}
                onError={(event) => {
                  event.currentTarget.src =
                    "/images/default-issue.jpeg";
                }}
              />

              <span className="approved-status-badge">
                <CheckCircle2 size={13} />
                Approved
              </span>

            </div>

            {/* CONTENT */}

            <div className="approved-issue-content">

              <div className="approved-card-top">

                <span className="approved-category">
                  {issue.category || "Other"}
                </span>

                <span className="approved-date">
                  <CalendarDays size={13} />
                  {formatDate(issue.createdAt)}
                </span>

              </div>

              <h2>
                {issue.title || "Untitled Issue"}
              </h2>

              <p className="approved-description">
                {issue.description ||
                  "No description provided."}
              </p>

              <div className="approved-meta">

                <span>
                  <MapPin size={15} />
                  {issue.location ||
                    "Location not provided"}
                </span>

                <span>
                  <UserRound size={15} />
                  {issue.createdBy?.name ||
                    "Unknown User"}
                </span>

              </div>

              <div className="approved-stats">

                <span>
                  <ThumbsUp size={15} />
                  {issue.upvotes || 0}
                </span>

                <span>
                  <ThumbsDown size={15} />
                  {issue.downvotes || 0}
                </span>

                <span>
                  <MessageCircle size={15} />
                  Comments
                </span>

              </div>

              <div className="approved-actions">

                <button
                  type="button"
                  className="approved-view-button"
                  onClick={() =>
                    setSelectedIssue(issue)
                  }
                >
                  <Eye size={16} />
                  View Details
                </button>

              </div>

            </div>

          </article>
        ))}

      </div>
    )}

  {/* DETAILS MODAL */}

  {selectedIssue && (
    <div
      className="approved-modal-overlay"
      onClick={closeModal}
    >

      <div
        className="approved-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <button
          type="button"
          className="approved-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="approved-modal-image">

          <img
            src={getIssueImage(selectedIssue)}
            alt={
              selectedIssue.title ||
              "Approved issue"
            }
            onError={(event) => {
              event.currentTarget.src =
                "/images/default-issue.jpeg";
            }}
          />

          <span>
            <CheckCircle2 size={15} />
            Approved
          </span>

        </div>

        <div className="approved-modal-content">

          <div className="approved-modal-category">
            {selectedIssue.category || "Other"}
          </div>

          <h2>
            {selectedIssue.title ||
              "Untitled Issue"}
          </h2>

          <div className="approved-modal-meta">

            <span>
              <MapPin size={15} />
              {selectedIssue.location ||
                "Location not provided"}
            </span>

            <span>
              <UserRound size={15} />
              {selectedIssue.createdBy?.name ||
                "Unknown User"}
            </span>

            <span>
              <CalendarDays size={15} />
              {formatDate(
                selectedIssue.createdAt
              )}
            </span>

          </div>

          <div className="approved-modal-description">

            <h3>Description</h3>

            <p>
              {selectedIssue.description ||
                "No description provided."}
            </p>

          </div>

          <div className="approved-modal-stats">

            <div>
              <ThumbsUp size={17} />
              <strong>
                {selectedIssue.upvotes || 0}
              </strong>
              <span>Upvotes</span>
            </div>

            <div>
              <ThumbsDown size={17} />
              <strong>
                {selectedIssue.downvotes || 0}
              </strong>
              <span>Downvotes</span>
            </div>

            <div>
              <MessageCircle size={17} />
              <strong>
                {selectedIssue.comments?.length || 0}
              </strong>
              <span>Comments</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  )}

</div>

);
}

export default ApprovedIssues;
