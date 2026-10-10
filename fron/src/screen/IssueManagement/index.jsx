
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  getManageIssues,
  approveIssue,
  dismissIssue,
} from "../../services/issueService";

import "./IssueManagement.css";

const FILTERS = ["All", "Pending", "Approved", "Dismissed"];

const getModerationStatus = (issue) => {
  const status = issue?.moderationStatus;

  if (!status) return "Pending";
  if (status.toLowerCase() === "pending") return "Pending";
  if (status.toLowerCase() === "approved") return "Approved";
  if (status.toLowerCase() === "dismissed") return "Dismissed";

  return status;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getReporterName = (issue) => {
  const reporter = issue?.createdBy;

  if (reporter && typeof reporter === "object") {
    return reporter.name || reporter.username || reporter.email || "Community member";
  }

  return "Community member";
};

const getIssueImage = (issue) => {
  if (Array.isArray(issue?.images) && issue.images.length > 0) {
    const firstImage = issue.images[0];
    return typeof firstImage === "string" ? firstImage : firstImage?.url;
  }

  if (Array.isArray(issue?.photos) && issue.photos.length > 0) {
    const firstPhoto = issue.photos[0];
    return typeof firstPhoto === "string" ? firstPhoto : firstPhoto?.url;
  }

  return null;
};

const getId = (issue) => issue?._id || issue?.id;

function IssueManagement() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getManageIssues();

      if (data?.success === false) {
        throw new Error(data.message || "Unable to load issues.");
      }

      setIssues(Array.isArray(data?.issues) ? data.issues : []);
    } catch (err) {
      setError(err.message || "Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const counts = useMemo(() => {
    return issues.reduce(
      (result, issue) => {
        result.total += 1;

        const status = getModerationStatus(issue);

        if (status === "Pending") result.pending += 1;
        if (status === "Approved") result.approved += 1;
        if (status === "Dismissed") result.dismissed += 1;

        return result;
      },
      { total: 0, pending: 0, approved: 0, dismissed: 0 }
    );
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const status = getModerationStatus(issue);

      const matchesFilter = filter === "All" || status === filter;

      const searchableText = [
        issue?.title,
        issue?.description,
        issue?.category,
        issue?.location,
        getReporterName(issue),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [issues, search, filter]);

  const handleApprove = async (issue) => {
    const issueId = getId(issue);
    if (!issueId) {
      setError("This issue does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Approve "${issue.title || "this issue"}"? It can then appear in the public Explore page.`
    );

    if (!confirmed) return;

    setActionId(issueId);
    setError("");
    setSuccess("");

    try {
      await approveIssue(issueId);
      setSuccess("Issue approved successfully.");
      setSelectedIssue(null);
      await fetchIssues(true);
    } catch (err) {
      setError(err.message || "Failed to approve the issue.");
    } finally {
      setActionId(null);
    }
  };

  const handleDismiss = async (issue) => {
    const issueId = getId(issue);
    if (!issueId) {
      setError("This issue does not have a valid ID.");
      return;
    }

    const reason = window.prompt(
      "Enter a reason for dismissing this issue:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      setError("Please enter a reason before dismissing the issue.");
      return;
    }

    setActionId(issueId);
    setError("");
    setSuccess("");

    try {
      await dismissIssue(issueId, reason.trim());
      setSuccess("Issue dismissed successfully.");
      setSelectedIssue(null);
      await fetchIssues(true);
    } catch (err) {
      setError(err.message || "Failed to dismiss the issue.");
    } finally {
      setActionId(null);
    }
  };

  const handleRefresh = () => {
    setSuccess("");
    fetchIssues(true);
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <main className="issue-management">
      <header className="im-header">
        <div className="im-header-copy">
          <div className="im-eyebrow">
            <ShieldCheck size={15} />
            <span>COMMUNITY MODERATION</span>
          </div>

          <h1>Issue Management</h1>
          <p>
            Review community reports, approve valid issues, and keep VoiceHub
            helpful and trustworthy.
          </p>
        </div>

        <button
          type="button"
          className="im-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "im-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="im-stats-grid" aria-label="Issue statistics">
        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-blue">
            <FileText size={21} />
          </div>
          <div className="im-stat-info">
            <span>Total issues</span>
            <strong>{counts.total}</strong>
            <small>All submitted reports</small>
          </div>
        </article>

        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-amber">
            <Clock3 size={21} />
          </div>
          <div className="im-stat-info">
            <span>Pending reviews</span>
            <strong>{counts.pending}</strong>
            <small>Awaiting a decision</small>
          </div>
        </article>

        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-green">
            <CheckCircle2 size={21} />
          </div>
          <div className="im-stat-info">
            <span>Approved</span>
            <strong>{counts.approved}</strong>
            <small>Accepted community reports</small>
          </div>
        </article>

        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-red">
            <Trash2 size={21} />
          </div>
          <div className="im-stat-info">
            <span>Dismissed</span>
            <strong>{counts.dismissed}</strong>
            <small>Reports not accepted</small>
          </div>
        </article>
      </section>

      {(error || success) && (
        <div
          className={`im-message ${error ? "im-message-error" : "im-message-success"}`}
          role="status"
        >
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{error || success}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={clearMessages}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="im-workspace">
        <div className="im-toolbar">
          <div className="im-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search by title, category, location or reporter..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search issues"
            />
            {search && (
              <button
                type="button"
                className="im-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="im-filter-tabs" aria-label="Filter issues">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item}
                {item === "Pending" && counts.pending > 0 && (
                  <span className="im-filter-count">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="im-list-heading">
          <div>
            <h2>Submitted reports</h2>
            <p>
              {filteredIssues.length}{" "}
              {filteredIssues.length === 1 ? "issue" : "issues"} found
            </p>
          </div>

          <span className="im-review-note">
            <Users size={15} />
            Moderator review queue
          </span>
        </div>

        {loading ? (
          <div className="im-state-panel">
            <span className="im-loading-spinner" />
            <h3>Loading community issues</h3>
            <p>Please wait while the reports are retrieved.</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="im-state-panel">
            <div className="im-empty-icon">
              <Search size={26} />
            </div>
            <h3>
              {issues.length === 0 ? "No issues submitted yet" : "No matching issues"}
            </h3>
            <p>
              {issues.length === 0
                ? "New community reports will appear here when submitted."
                : "Try another search term or select a different status filter."}
            </p>

            {(search || filter !== "All") && (
              <button
                type="button"
                className="im-reset-button"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="im-issue-list">
            {filteredIssues.map((issue) => {
              const issueId = getId(issue);
              const moderationStatus = getModerationStatus(issue);
              const image = getIssueImage(issue);
              const isBusy = actionId === issueId;

              return (
                <article className="im-issue-card" key={issueId}>
                  <div className="im-card-image">
                    {image ? (
                      <img
                        src={image}
                        alt={issue.title || "Community issue"}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="im-image-placeholder">
                        <ImageIcon size={31} />
                        <span>No image attached</span>
                      </div>
                    )}

                    <span className={`im-status-badge im-status-${moderationStatus.toLowerCase()}`}>
                      <span className="im-status-dot" />
                      {moderationStatus}
                    </span>
                  </div>

                  <div className="im-card-content">
                    <div className="im-card-topline">
                      <span className="im-category">
                        {issue.category || "Other"}
                      </span>
                      <span className="im-date">
                        <CalendarDays size={14} />
                        {formatDate(issue.createdAt || issue.updatedAt)}
                      </span>
                    </div>

                    <h3 className="im-issue-title">
                      {issue.title || "Untitled issue"}
                    </h3>

                    <p className="im-issue-description">
                      {issue.description || "No description provided."}
                    </p>

                    <div className="im-card-meta">
                      <span>
                        <MapPin size={15} />
                        {issue.location || "Location not provided"}
                      </span>
                      <span>
                        <Users size={15} />
                        {getReporterName(issue)}
                      </span>
                    </div>

                    <div className="im-card-bottom">
                      <div className="im-engagement">
                        <span title="Upvotes">
                          <ThumbsUp size={15} />
                          {issue.upvotes ?? issue.upvotedBy?.length ?? 0}
                        </span>
                        <span title="Downvotes">
                          <ThumbsDown size={15} />
                          {issue.downvotes ?? issue.downvotedBy?.length ?? 0}
                        </span>
                        {issue.status && (
                          <span className="im-progress-status">
                            <Clock3 size={14} />
                            {issue.status}
                          </span>
                        )}
                      </div>

                      <div className="im-card-actions">
                        <button
                          type="button"
                          className="im-view-button"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <Eye size={16} />
                          View details
                        </button>

                        {moderationStatus === "Pending" && (
                          <>
                            <button
                              type="button"
                              className="im-approve-button"
                              onClick={() => handleApprove(issue)}
                              disabled={isBusy}
                            >
                              <CheckCircle2 size={16} />
                              {isBusy ? "Please wait..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="im-dismiss-button"
                              onClick={() => handleDismiss(issue)}
                              disabled={isBusy}
                            >
                              <X size={16} />
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedIssue && (
        <div
          className="im-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIssue(null);
            }
          }}
        >
          <section
            className="im-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="im-modal-title"
          >
            <div className="im-modal-header">
              <div>
                <span className="im-modal-eyebrow">
                  <MessageSquareText size={15} />
                  COMMUNITY REPORT
                </span>
                <h2 id="im-modal-title">Issue details</h2>
              </div>
              <button
                type="button"
                className="im-modal-close"
                onClick={() => setSelectedIssue(null)}
                aria-label="Close issue details"
              >
                <X size={20} />
              </button>
            </div>

            {getIssueImage(selectedIssue) && (
              <div className="im-modal-image">
                <img
                  src={getIssueImage(selectedIssue)}
                  alt={selectedIssue.title || "Issue attachment"}
                />
              </div>
            )}

            <div className="im-modal-body">
              <div className="im-modal-status-row">
                <span className="im-category">
                  {selectedIssue.category || "Other"}
                </span>
                <span className={`im-status-badge im-status-${getModerationStatus(selectedIssue).toLowerCase()}`}>
                  <span className="im-status-dot" />
                  {getModerationStatus(selectedIssue)}
                </span>
              </div>

              <h3 className="im-modal-issue-title">
                {selectedIssue.title || "Untitled issue"}
              </h3>

              <p className="im-modal-description">
                {selectedIssue.description || "No description provided."}
              </p>

              <div className="im-detail-grid">
                <div className="im-detail-item">
                  <MapPin size={17} />
                  <div>
                    <span>Location</span>
                    <strong>{selectedIssue.location || "Not provided"}</strong>
                  </div>
                </div>

                <div className="im-detail-item">
                  <Users size={17} />
                  <div>
                    <span>Reported by</span>
                    <strong>{getReporterName(selectedIssue)}</strong>
                  </div>
                </div>

                <div className="im-detail-item">
                  <CalendarDays size={17} />
                  <div>
                    <span>Submitted on</span>
                    <strong>
                      {formatDate(selectedIssue.createdAt || selectedIssue.updatedAt)}
                    </strong>
                  </div>
                </div>

                <div className="im-detail-item">
                  <ArrowUp size={17} />
                  <div>
                    <span>Upvotes</span>
                    <strong>
                      {selectedIssue.upvotes ?? selectedIssue.upvotedBy?.length ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="im-detail-item">
                  <ArrowDown size={17} />
                  <div>
                    <span>Downvotes</span>
                    <strong>
                      {selectedIssue.downvotes ?? selectedIssue.downvotedBy?.length ?? 0}
                    </strong>
                  </div>
                </div>

                <div className="im-detail-item">
                  <Clock3 size={17} />
                  <div>
                    <span>Progress status</span>
                    <strong>{selectedIssue.status || "Submitted"}</strong>
                  </div>
                </div>
              </div>

              {selectedIssue.dismissReason && (
                <div className="im-dismiss-reason">
                  <strong>Dismissal reason</strong>
                  <p>{selectedIssue.dismissReason}</p>
                </div>
              )}
            </div>

            <div className="im-modal-footer">
              <button
                type="button"
                className="im-view-button"
                onClick={() => setSelectedIssue(null)}
              >
                Close
              </button>

              {getModerationStatus(selectedIssue) === "Pending" && (
                <>
                  <button
                    type="button"
                    className="im-dismiss-button"
                    disabled={actionId === getId(selectedIssue)}
                    onClick={() => handleDismiss(selectedIssue)}
                  >
                    <X size={16} />
                    Dismiss issue
                  </button>

                  <button
                    type="button"
                    className="im-approve-button"
                    disabled={actionId === getId(selectedIssue)}
                    onClick={() => handleApprove(selectedIssue)}
                  >
                    <CheckCircle2 size={16} />
                    Approve issue
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default IssueManagement;