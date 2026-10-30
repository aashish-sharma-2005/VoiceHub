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
  const status = String(issue?.moderationStatus || "Pending").trim().toLowerCase();
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "dismissed") return "Dismissed";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

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
  return typeof reporter === "string" && reporter.trim()
    ? reporter
    : "Community member";
};

const getIssueImages = (issue) => {
  const source = Array.isArray(issue?.images)
    ? issue.images
    : Array.isArray(issue?.photos)
      ? issue.photos
      : [];

  return source
    .map((item) => (typeof item === "string" ? item.trim() : item?.url))
    .filter((url) => typeof url === "string" && url.trim())
    .map((url) => url.trim());
};

const getIssueImage = (issue) => getIssueImages(issue)[0] || null;

const getId = (issue) => issue?._id || issue?.id;

const getVoteCount = (issue, type) => {
  const directCount = type === "up"
    ? issue?.upvotes
    : issue?.downvotes;
  const voters = type === "up" ? issue?.upvotedBy : issue?.downvotedBy;

  if (Number.isFinite(Number(directCount)) && directCount !== null && directCount !== "") {
    return Number(directCount);
  }
  if (Array.isArray(voters)) return voters.length;
  return 0;
};

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
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchIssues = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await getManageIssues();
      if (response?.success === false) {
        throw new Error(response.message || "Unable to load issues.");
      }

      // Supports the usual { issues: [] } response as well as a direct array.
      const issueList = Array.isArray(response)
        ? response
        : Array.isArray(response?.issues)
          ? response.issues
          : Array.isArray(response?.data?.issues)
            ? response.data.issues
            : [];

      setIssues(issueList);
      setFailedImages(new Set());
    } catch (err) {
      setError(err?.message || "Failed to load issues. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Allow the details dialog to be closed with Escape and keep the page from
  // scrolling behind it while it is open.
  useEffect(() => {
    if (!selectedIssue) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (previewImage) setPreviewImage(null);
        else setSelectedIssue(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIssue, previewImage]);

  useEffect(() => {
    setModalImageFailed(false);
  }, [selectedIssue]);

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
    if (actionId) return;

    const confirmed = window.confirm(
      `Approve "${issue.title || "this issue"}"? It can then appear in the public Explore page.`
    );
    if (!confirmed) return;

    setActionId(issueId);
    setError("");
    setSuccess("");

    try {
      const response = await approveIssue(issueId);
      if (response?.success === false) {
        throw new Error(response.message || "Failed to approve the issue.");
      }
      setSuccess("Issue approved successfully. It can now appear in Explore.");
      setSelectedIssue(null);
      await fetchIssues(true);
    } catch (err) {
      setError(err?.message || "Failed to approve the issue.");
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
    if (actionId) return;

    const reason = window.prompt("Enter a reason for dismissing this issue:");
    if (reason === null) return;
    if (!reason.trim()) {
      setError("Please enter a reason before dismissing the issue.");
      return;
    }

    setActionId(issueId);
    setError("");
    setSuccess("");

    try {
      const response = await dismissIssue(issueId, reason.trim());
      if (response?.success === false) {
        throw new Error(response.message || "Failed to dismiss the issue.");
      }
      setSuccess("Issue dismissed successfully.");
      setSelectedIssue(null);
      await fetchIssues(true);
    } catch (err) {
      setError(err?.message || "Failed to dismiss the issue.");
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

  const clearFilters = () => {
    setSearch("");
    setFilter("All");
  };

  const handleCardImageError = (issueId) => {
    setFailedImages((previous) => {
      const next = new Set(previous);
      next.add(issueId);
      return next;
    });
  };

  return (
    <main className="issue-management">
      <header className="im-header">
        <div className="im-header-copy">
          <div className="im-eyebrow">
            <ShieldCheck size={15} aria-hidden="true" />
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
          disabled={refreshing || loading}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "im-spin" : ""}
            aria-hidden="true"
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="im-stats-grid" aria-label="Issue statistics">
        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-blue"><FileText size={21} aria-hidden="true" /></div>
          <div className="im-stat-info">
            <span>Total issues</span><strong>{counts.total}</strong><small>All submitted reports</small>
          </div>
        </article>
        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-amber"><Clock3 size={21} aria-hidden="true" /></div>
          <div className="im-stat-info">
            <span>Pending reviews</span><strong>{counts.pending}</strong><small>Awaiting a decision</small>
          </div>
        </article>
        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-green"><CheckCircle2 size={21} aria-hidden="true" /></div>
          <div className="im-stat-info">
            <span>Approved</span><strong>{counts.approved}</strong><small>Accepted community reports</small>
          </div>
        </article>
        <article className="im-stat-card">
          <div className="im-stat-icon im-icon-red"><Trash2 size={21} aria-hidden="true" /></div>
          <div className="im-stat-info">
            <span>Dismissed</span><strong>{counts.dismissed}</strong><small>Reports not accepted</small>
          </div>
        </article>
      </section>

      {(error || success) && (
        <div
          className={`im-message ${error ? "im-message-error" : "im-message-success"}`}
          role={error ? "alert" : "status"}
        >
          {error ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
          <span>{error || success}</span>
          <button type="button" aria-label="Dismiss message" onClick={clearMessages}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="im-workspace" aria-label="Manage community issues">
        <div className="im-toolbar">
          <div className="im-search">
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by title, category, location or reporter..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search issues"
            />
            {search && (
              <button type="button" className="im-clear-search" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={16} aria-hidden="true" />
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
            <p>{filteredIssues.length} {filteredIssues.length === 1 ? "issue" : "issues"} found</p>
          </div>
          <span className="im-review-note"><Users size={15} aria-hidden="true" /> Moderator review queue</span>
        </div>

        {loading ? (
          <div className="im-state-panel" role="status" aria-live="polite">
            <span className="im-loading-spinner" aria-hidden="true" />
            <h3>Loading community issues</h3>
            <p>Please wait while the reports are retrieved.</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="im-state-panel">
            <div className="im-empty-icon"><Search size={26} aria-hidden="true" /></div>
            <h3>{issues.length === 0 ? "No issues submitted yet" : "No matching issues"}</h3>
            <p>
              {issues.length === 0
                ? "New community reports will appear here when submitted."
                : "Try another search term or select a different status filter."}
            </p>
            {(search || filter !== "All") && (
              <button type="button" className="im-reset-button" onClick={clearFilters}>Clear filters</button>
            )}
            {error && issues.length === 0 && (
              <button type="button" className="im-reset-button" onClick={() => fetchIssues()}>Try again</button>
            )}
          </div>
        ) : (
          <div className="im-issue-list">
            {filteredIssues.map((issue, index) => {
              const issueId = getId(issue) || `issue-${index}`;
              const moderationStatus = getModerationStatus(issue);
              const issueImages = getIssueImages(issue);
              const image = issueImages[0] || null;
              const isBusy = actionId === getId(issue);
              const imageFailed = failedImages.has(issueId);

              return (
                <article className="im-issue-card" key={issueId}>
                  <div className="im-card-image">
                    {image && !imageFailed ? (
                      <img
                        src={image}
                        alt={issue.title || "Community issue"}
                        loading="lazy"
                        onError={() => handleCardImageError(issueId)}
                      />
                    ) : (
                      <div className="im-image-placeholder">
                        <ImageIcon size={31} aria-hidden="true" />
                        <span>{image ? "Image unavailable" : "No image attached"}</span>
                      </div>
                    )}
                    {issueImages.length > 1 && (
                      <span className="im-photo-count"><ImageIcon size={13} aria-hidden="true" />+{issueImages.length - 1} photos</span>
                    )}
                    <span className={`im-status-badge im-status-${moderationStatus.toLowerCase()}`}>
                      <span className="im-status-dot" />{moderationStatus}
                    </span>
                  </div>

                  <div className="im-card-content">
                    <div className="im-card-topline">
                      <span className="im-category">{issue.category || "Other"}</span>
                      <span className="im-date"><CalendarDays size={14} aria-hidden="true" />{formatDate(issue.createdAt || issue.updatedAt)}</span>
                    </div>
                    <h3 className="im-issue-title">{issue.title || "Untitled issue"}</h3>
                    <p className="im-issue-description">{issue.description || "No description provided."}</p>

                    <div className="im-card-meta">
                      <span><MapPin size={15} aria-hidden="true" />{issue.location || "Location not provided"}</span>
                      <span><Users size={15} aria-hidden="true" />{getReporterName(issue)}</span>
                    </div>

                    <div className="im-card-bottom">
                      <div className="im-engagement">
                        <span title="Upvotes"><ThumbsUp size={15} aria-hidden="true" />{getVoteCount(issue, "up")}</span>
                        <span title="Downvotes"><ThumbsDown size={15} aria-hidden="true" />{getVoteCount(issue, "down")}</span>
                        {issue.status && <span className="im-progress-status"><Clock3 size={14} aria-hidden="true" />{issue.status}</span>}
                      </div>

                      <div className="im-card-actions">
                        <button type="button" className="im-view-button" onClick={() => setSelectedIssue(issue)}>
                          <Eye size={16} aria-hidden="true" />View details
                        </button>
                        {moderationStatus === "Pending" && (
                          <>
                            <button type="button" className="im-approve-button" onClick={() => handleApprove(issue)} disabled={Boolean(actionId)}>
                              <CheckCircle2 size={16} aria-hidden="true" />{isBusy ? "Please wait..." : "Approve"}
                            </button>
                            <button type="button" className="im-dismiss-button" onClick={() => handleDismiss(issue)} disabled={Boolean(actionId)}>
                              <X size={16} aria-hidden="true" />{isBusy ? "Please wait..." : "Dismiss"}
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
            if (event.target === event.currentTarget) setSelectedIssue(null);
          }}
        >
          <section className="im-modal" role="dialog" aria-modal="true" aria-labelledby="im-modal-title" aria-describedby="im-modal-description">
            <div className="im-modal-header">
              <div>
                <span className="im-modal-eyebrow"><MessageSquareText size={15} aria-hidden="true" />COMMUNITY REPORT</span>
                <h2 id="im-modal-title">Issue details</h2>
              </div>
              <button type="button" className="im-modal-close" onClick={() => setSelectedIssue(null)} aria-label="Close issue details">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {getIssueImages(selectedIssue).length > 0 && (
              <div className="im-modal-gallery" aria-label="Issue photos">
                {getIssueImages(selectedIssue).map((imageUrl, imageIndex) => (
                  <button
                    type="button"
                    className={`im-gallery-image ${imageIndex === 0 ? "im-gallery-image-featured" : ""}`}
                    key={`${imageUrl}-${imageIndex}`}
                    onClick={() => setPreviewImage(imageUrl)}
                    aria-label={`View issue photo ${imageIndex + 1} of ${getIssueImages(selectedIssue).length}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${selectedIssue.title || "Issue"} photo ${imageIndex + 1}`}
                      loading={imageIndex === 0 ? "eager" : "lazy"}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextElementSibling?.classList.remove("im-gallery-fallback-hidden");
                      }}
                    />
                    <span className="im-gallery-fallback im-gallery-fallback-hidden"><ImageIcon size={22} aria-hidden="true" />Image unavailable</span>
                    <span className="im-gallery-zoom"><Eye size={15} aria-hidden="true" /> View</span>
                  </button>
                ))}
              </div>
            )}

            <div className="im-modal-body">
              <div className="im-modal-status-row">
                <span className="im-category">{selectedIssue.category || "Other"}</span>
                <span className={`im-status-badge im-status-${getModerationStatus(selectedIssue).toLowerCase()}`}>
                  <span className="im-status-dot" />{getModerationStatus(selectedIssue)}
                </span>
              </div>
              <h3 className="im-modal-issue-title">{selectedIssue.title || "Untitled issue"}</h3>
              <p className="im-modal-description" id="im-modal-description">{selectedIssue.description || "No description provided."}</p>

              <div className="im-detail-grid">
                <div className="im-detail-item"><MapPin size={17} aria-hidden="true" /><div><span>Location</span><strong>{selectedIssue.location || "Not provided"}</strong></div></div>
                <div className="im-detail-item"><Users size={17} aria-hidden="true" /><div><span>Reported by</span><strong>{getReporterName(selectedIssue)}</strong></div></div>
                <div className="im-detail-item"><CalendarDays size={17} aria-hidden="true" /><div><span>Submitted on</span><strong>{formatDate(selectedIssue.createdAt || selectedIssue.updatedAt)}</strong></div></div>
                <div className="im-detail-item"><ArrowUp size={17} aria-hidden="true" /><div><span>Upvotes</span><strong>{getVoteCount(selectedIssue, "up")}</strong></div></div>
                <div className="im-detail-item"><ArrowDown size={17} aria-hidden="true" /><div><span>Downvotes</span><strong>{getVoteCount(selectedIssue, "down")}</strong></div></div>
                <div className="im-detail-item"><Clock3 size={17} aria-hidden="true" /><div><span>Progress status</span><strong>{selectedIssue.status || "Submitted"}</strong></div></div>
              </div>

              {selectedIssue.dismissReason && (
                <div className="im-dismiss-reason"><strong>Dismissal reason</strong><p>{selectedIssue.dismissReason}</p></div>
              )}
            </div>

            <div className="im-modal-footer">
              <button type="button" className="im-view-button" onClick={() => setSelectedIssue(null)}>Close</button>
              {getModerationStatus(selectedIssue) === "Pending" && (
                <>
                  <button type="button" className="im-dismiss-button" disabled={Boolean(actionId)} onClick={() => handleDismiss(selectedIssue)}>
                    <X size={16} aria-hidden="true" />Dismiss issue
                  </button>
                  <button type="button" className="im-approve-button" disabled={Boolean(actionId)} onClick={() => handleApprove(selectedIssue)}>
                    <CheckCircle2 size={16} aria-hidden="true" />Approve issue
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {previewImage && (
        <div className="im-lightbox" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPreviewImage(null);
        }}>
          <button type="button" className="im-lightbox-close" onClick={() => setPreviewImage(null)} aria-label="Close image preview"><X size={23} /></button>
          <img src={previewImage} alt="Expanded issue photo" />
        </div>
      )}
    </main>
  );
}

export default IssueManagement;
