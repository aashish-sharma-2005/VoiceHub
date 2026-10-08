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
XCircle,
Eye,
X,
AlertCircle,
} from "lucide-react";

import { getManageIssues } from "../../services/issueService";

import "./dismissedIssue.css";

function DismissedIssues() {
const [issues, setIssues] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [selectedIssue, setSelectedIssue] = useState(null);

/* =========================
FETCH DISMISSED ISSUES
========================= */

const fetchDismissedIssues = async () => {
try {
setLoading(true);
setError("");

  const data = await getManageIssues();

  const allIssues = data.issues || [];

  const dismissedIssues = allIssues.filter(
    (issue) => issue.moderationStatus === "Dismissed"
  );

  setIssues(dismissedIssues);
} catch (error) {
  console.error(
    "Fetch dismissed issues error:",
    error
  );

  setError(
    error.message || "Unable to load dismissed issues."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchDismissedIssues();
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
  issue.createdBy?.name?.toLowerCase().includes(searchText) ||
  issue.dismissReason?.toLowerCase().includes(searchText)
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

return ( <div className="dismissed-issues-page">

  {/* HEADER */}

  <div className="dismissed-page-header">

    <div className="dismissed-header-content">

      <div className="dismissed-header-icon">
        <XCircle size={25} />
      </div>

      <div>
        <div className="dismissed-breadcrumb">
          Community Voice
          <span>›</span>
          Moderation
          <span>›</span>
          Dismissed Issues
        </div>

        <h1>Dismissed Issues</h1>

        <p>
          Review reports that were dismissed during moderation.
        </p>
      </div>

    </div>

    <button
      type="button"
      className="dismissed-refresh-button"
      onClick={fetchDismissedIssues}
      disabled={loading}
    >
      <RefreshCw
        size={16}
        className={loading ? "dismissed-refresh-spin" : ""}
      />
      Refresh
    </button>

  </div>

  {/* TOOLBAR */}

  {!loading && !error && (
    <div className="dismissed-toolbar">

      <div className="dismissed-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search dismissed issues..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

      </div>

      <div className="dismissed-count">
        <strong>{filteredIssues.length}</strong>
        <span>
          {filteredIssues.length === 1 ? "Issue" : "Issues"}
        </span>
      </div>

    </div>
  )}

  {/* LOADING */}

  {loading && (
    <div className="dismissed-state">

      <RefreshCw
        size={30}
        className="dismissed-loading-icon"
      />

      <h3>Loading dismissed issues...</h3>

      <p>
        Fetching reports that were dismissed.
      </p>

    </div>
  )}

  {/* ERROR */}

  {!loading && error && (
    <div className="dismissed-state error">

      <div className="dismissed-state-icon">
        <AlertCircle size={28} />
      </div>

      <h3>Unable to load dismissed issues</h3>

      <p>{error}</p>

      <button
        type="button"
        className="dismissed-retry-button"
        onClick={fetchDismissedIssues}
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
      <div className="dismissed-state">

        <div className="dismissed-state-icon">
          <XCircle size={28} />
        </div>

        <h3>
          {search
            ? "No matching issues"
            : "No dismissed issues"}
        </h3>

        <p>
          {search
            ? "Try changing your search."
            : "No issues have been dismissed yet."}
        </p>

      </div>
    )}

  {/* ISSUE LIST */}

  {!loading &&
    !error &&
    filteredIssues.length > 0 && (
      <div className="dismissed-issues-list">

        {filteredIssues.map((issue) => (
          <article
            className="dismissed-issue-card"
            key={issue._id}
          >

            {/* IMAGE */}

            <div className="dismissed-image-wrapper">

              <img
                src={getIssueImage(issue)}
                alt={issue.title || "Dismissed issue"}
                onError={(event) => {
                  event.currentTarget.src =
                    "/images/default-issue.jpeg";
                }}
              />

              <span className="dismissed-status-badge">
                <XCircle size={13} />
                Dismissed
              </span>

            </div>

            {/* CONTENT */}

            <div className="dismissed-issue-content">

              <div className="dismissed-card-top">

                <span className="dismissed-category">
                  {issue.category || "Other"}
                </span>

                <span className="dismissed-date">
                  <CalendarDays size={13} />
                  {formatDate(issue.createdAt)}
                </span>

              </div>

              <h2>
                {issue.title || "Untitled Issue"}
              </h2>

              <p className="dismissed-description">
                {issue.description ||
                  "No description provided."}
              </p>

              <div className="dismissed-meta">

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

              <div className="dismissed-reason">

                <AlertCircle size={15} />

                <div>
                  <small>Dismissal Reason</small>

                  <span>
                    {issue.dismissReason ||
                      issue.moderationReason ||
                      "No reason provided."}
                  </span>
                </div>

              </div>

              <div className="dismissed-stats">

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

              <div className="dismissed-actions">

                <button
                  type="button"
                  className="dismissed-view-button"
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
      className="dismissed-modal-overlay"
      onClick={closeModal}
    >

      <div
        className="dismissed-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          className="dismissed-modal-close"
          onClick={closeModal}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="dismissed-modal-image">

          <img
            src={getIssueImage(selectedIssue)}
            alt={
              selectedIssue.title ||
              "Dismissed issue"
            }
            onError={(event) => {
              event.currentTarget.src =
                "/images/default-issue.jpeg";
            }}
          />

          <span>
            <XCircle size={15} />
            Dismissed
          </span>

        </div>

        <div className="dismissed-modal-content">

          <div className="dismissed-modal-category">
            {selectedIssue.category || "Other"}
          </div>

          <h2>
            {selectedIssue.title ||
              "Untitled Issue"}
          </h2>

          <div className="dismissed-modal-meta">

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

          <div className="dismissed-modal-description">

            <h3>Description</h3>

            <p>
              {selectedIssue.description ||
                "No description provided."}
            </p>

          </div>

          <div className="dismissed-modal-reason">

            <div className="dismissed-reason-icon">
              <AlertCircle size={18} />
            </div>

            <div>
              <strong>Dismissal Reason</strong>

              <p>
                {selectedIssue.dismissReason ||
                  selectedIssue.moderationReason ||
                  "No reason provided."}
              </p>
            </div>

          </div>

          <div className="dismissed-modal-stats">

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

export default DismissedIssues;
