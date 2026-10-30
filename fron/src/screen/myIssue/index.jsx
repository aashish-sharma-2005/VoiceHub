
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Clock3,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ClipboardList,
  UserRound,
  CalendarDays,
  Tag,
  FileText,
  Activity,
  CircleDot,
  TrendingUp,
  X,
  Trash2,
} from "lucide-react";

import {
  getMyIssues,
  voteIssue,
  getSavedIssues,
  saveIssue,
  removeSavedIssue,
  deleteIssue,
} from "../../services/issueService";

import IssueCommentsModal from "../../components/issue/IssueCommentsModal";
import "./myIssue.css";

function MyIssue() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.login?.token);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [votingIssueId, setVotingIssueId] = useState(null);

  const [savedIssueIds, setSavedIssueIds] = useState(new Set());
  const [savingIssueId, setSavingIssueId] = useState(null);
  const [deletingIssueId, setDeletingIssueId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const goToReportIssue = () => {
    navigate("/create-issue");
  };

  const fetchMyIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyIssues();
      setIssues(data.issues || []);
    } catch (error) {
      console.error("Fetch my issues error:", error);
      setError(error.message || "Unable to load your reported issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedIssueIds = useCallback(async () => {
    try {
      const data = await getSavedIssues();

      const savedIssues =
        data.issues ||
        data.savedIssues ||
        data.data?.issues ||
        [];

      setSavedIssueIds(
        new Set(
          savedIssues
            .map((item) => String(item._id || item.issue?._id || item.issue))
            .filter((id) => id && id !== "undefined" && id !== "[object Object]")
        )
      );
    } catch (error) {
      // A saved-issues loading error should not prevent My Issues from loading.
      console.error("Fetch saved issues error:", error);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMyIssues();
      fetchSavedIssueIds();
    } else {
      setLoading(false);
      setError("Authentication required. Please login again.");
    }
  }, [token, fetchMyIssues, fetchSavedIssueIds]);

  useEffect(() => {
    if (selectedIssue) {
      document.body.classList.add("modal-open");
    } else if (!showComments) {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedIssue, showComments]);

  const getIssueId = (issue) => String(issue?._id || "");

  const updateIssueCommentCount = useCallback((issueId, count) => {
    const id = String(issueId);

    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        String(issue._id) === id
          ? { ...issue, commentCount: count }
          : issue
      )
    );

    setSelectedIssue((currentIssue) =>
      currentIssue && String(currentIssue._id) === id
        ? { ...currentIssue, commentCount: count }
        : currentIssue
    );
  }, []);

  const handleVote = async (issueId, vote) => {
    try {
      if (votingIssueId) return;

      setVotingIssueId(issueId);

      const data = await voteIssue(issueId, vote);
      const updatedIssue = data.issue;

      if (!updatedIssue) {
        throw new Error("The server did not return the updated vote.");
      }

      const applyVoteUpdate = (issue) => ({
        ...issue,
        upvotes: updatedIssue.upvotes,
        downvotes: updatedIssue.downvotes,
        userVote: updatedIssue.userVote,
      });

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue._id === issueId ? applyVoteUpdate(issue) : issue
        )
      );

      setSelectedIssue((currentIssue) =>
        currentIssue && currentIssue._id === issueId
          ? applyVoteUpdate(currentIssue)
          : currentIssue
      );
    } catch (error) {
      console.error("Vote issue error:", error);
      alert(error.message || "Unable to update your vote.");
    } finally {
      setVotingIssueId(null);
    }
  };

  const handleToggleSave = async (issue) => {
    const issueId = getIssueId(issue);

    if (!issueId || savingIssueId) return;

    const isSaved = savedIssueIds.has(issueId);

    try {
      setSavingIssueId(issueId);

      if (isSaved) {
        await removeSavedIssue(issueId);

        setSavedIssueIds((current) => {
          const updated = new Set(current);
          updated.delete(issueId);
          return updated;
        });

        alert("Issue removed from Saved Issues.");
      } else {
        await saveIssue(issueId);

        setSavedIssueIds((current) => {
          const updated = new Set(current);
          updated.add(issueId);
          return updated;
        });

        alert("Issue saved successfully.");
      }
    } catch (error) {
      console.error("Toggle saved issue error:", error);
      alert(error.message || "Unable to update saved issue.");
    } finally {
      setSavingIssueId(null);
    }
  };

  const handleDeleteIssue = async (issue) => {
    const issueId = getIssueId(issue);

    if (!issueId || deletingIssueId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${issue.title || "this issue"}"?\n\nThis action may not be reversible.`
    );

    if (!confirmed) return;

    try {
      setDeletingIssueId(issueId);

      await deleteIssue(issueId);

      setIssues((currentIssues) =>
        currentIssues.filter((item) => String(item._id) !== issueId)
      );

      setSavedIssueIds((current) => {
        const updated = new Set(current);
        updated.delete(issueId);
        return updated;
      });

      if (String(selectedIssue?._id) === issueId) {
        setSelectedIssue(null);
        setShowComments(false);
      }

      alert("Your issue was deleted successfully.");
    } catch (error) {
      console.error("Delete issue error:", error);
      alert(error.message || "Unable to delete this issue.");
    } finally {
      setDeletingIssueId(null);
    }
  };

  const handleShareIssue = async (issue) => {
    const issueId = getIssueId(issue);

    if (!issueId) {
      alert("Unable to create a link for this issue.");
      return;
    }

    const shareUrl = `${window.location.origin}/issue/${issueId}`;
    const shareData = {
      title: issue.title || "VoiceHub Issue",
      text: issue.description || "View this community issue on VoiceHub.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Issue link copied to clipboard.");
      } else {
        window.prompt("Copy this issue link:", shareUrl);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share issue error:", error);

        try {
          await navigator.clipboard.writeText(shareUrl);
          alert("Issue link copied to clipboard.");
        } catch {
          window.prompt("Copy this issue link:", shareUrl);
        }
      }
    }
  };

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setShowComments(false);
  };

  const closeIssueModal = () => {
    setSelectedIssue(null);
    setShowComments(false);
  };

  const getCommentsCount = (issue) => {
    if (typeof issue.commentCount === "number") {
      return issue.commentCount;
    }

    if (typeof issue.commentsCount === "number") {
      return issue.commentsCount;
    }

    if (typeof issue.comments === "number") {
      return issue.comments;
    }

    if (Array.isArray(issue.comments)) {
      return issue.comments.length;
    }

    return 0;
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Recently";

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) return "Recently";

    const difference = Math.floor((Date.now() - created.getTime()) / 1000);

    if (difference < 60) return "Just now";

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
    if (!status) return "status-reviewing";

    const value = status.toLowerCase();

    if (value.includes("resolved")) return "status-resolved";

    if (value.includes("progress") || value.includes("working")) {
      return "status-progress";
    }

    return "status-reviewing";
  };

  const getStatusIcon = (status) => {
    if (!status) return <Clock3 size={14} />;

    const value = status.toLowerCase();

    if (value.includes("resolved")) return <CheckCircle2 size={14} />;

    if (value.includes("progress")) return <Activity size={14} />;

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

  const totalIssues = issues.length;

  const pendingIssues = issues.filter(
    (issue) =>
      !issue.moderationStatus || issue.moderationStatus === "Pending"
  ).length;

  const approvedIssues = issues.filter(
    (issue) => issue.moderationStatus === "Approved"
  );

  const inProgressIssues = approvedIssues.filter((issue) => {
    const status = issue.status?.toLowerCase() || "";
    return status.includes("progress") || status.includes("working");
  }).length;

  const resolvedIssues = approvedIssues.filter((issue) =>
    issue.status?.toLowerCase().includes("resolved")
  ).length;

  return (
    <div className="my-issues-page">
      {/* TOP BAR */}
      <div className="my-issues-topbar">
        <div className="my-issues-breadcrumb">
          <span>Community Voice</span>
          <span className="breadcrumb-arrow">›</span>
          <strong>My Issues</strong>
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
            onClick={goToReportIssue}
          >
            <Plus size={16} />
            Report Issue
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="my-issues-hero">
        <div className="hero-copy">
          <div className="page-eyebrow">YOUR COMMUNITY VOICE</div>

          <h1>
            Your Issues.
            <span>Your Impact.</span>
          </h1>

          <p>
            Keep track of every issue you've reported and follow its journey
            from submission to resolution.
          </p>
        </div>

        <div className="hero-action">
          <div className="hero-mini-stat">
            <span>Your reports</span>
            <strong>{totalIssues}</strong>
          </div>

          <button
            type="button"
            className="new-issue-button"
            onClick={goToReportIssue}
          >
            <Plus size={17} />
            New Issue
          </button>
        </div>
      </section>

      {/* STATISTICS */}
      {!loading && !error && (
        <section className="issue-statistics">
          <div className="stat-card stat-total">
            <div className="stat-icon"><FileText size={19} /></div>
            <div className="stat-info">
              <span>Total Reported</span>
              <strong>{totalIssues}</strong>
            </div>
            <div className="stat-decoration"><ClipboardList size={50} /></div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon"><Clock3 size={19} /></div>
            <div className="stat-info">
              <span>Under Review</span>
              <strong>{pendingIssues}</strong>
            </div>
            <div className="stat-decoration"><CircleDot size={50} /></div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon"><TrendingUp size={19} /></div>
            <div className="stat-info">
              <span>In Progress</span>
              <strong>{inProgressIssues}</strong>
            </div>
            <div className="stat-decoration"><Activity size={50} /></div>
          </div>

          <div className="stat-card stat-resolved">
            <div className="stat-icon"><CheckCircle2 size={19} /></div>
            <div className="stat-info">
              <span>Resolved</span>
              <strong>{resolvedIssues}</strong>
            </div>
            <div className="stat-decoration"><CheckCircle2 size={50} /></div>
          </div>
        </section>
      )}

      {/* SECTION HEADER */}
      {!loading && !error && issues.length > 0 && (
        <div className="issues-section-header">
          <div>
            <div className="section-kicker">YOUR SUBMISSIONS</div>
            <h2>Issues you've reported</h2>
            <p>Stay updated on what is happening with your reports.</p>
          </div>

          <div className="issue-count-label">
            <span>{totalIssues}</span>
            {totalIssues === 1 ? " Issue" : " Issues"}
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="my-issues-state loading-state">
          <div className="loading-spinner" />
          <h3>Loading your issues</h3>
          <p>We're getting your community reports ready.</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="my-issues-state error-state">
          <div className="state-icon"><AlertCircle size={28} /></div>
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
      {!loading && !error && issues.length === 0 && (
        <div className="empty-issues">
          <div className="empty-illustration">
            <div className="empty-circle"><ClipboardList size={38} /></div>
            <span className="empty-dot empty-dot-one" />
            <span className="empty-dot empty-dot-two" />
            <span className="empty-dot empty-dot-three" />
          </div>

          <div className="empty-content">
            <span className="empty-kicker">START MAKING AN IMPACT</span>
            <h3>Your community needs your voice.</h3>
            <p>
              Report a problem around you and help make your community cleaner,
              safer and better for everyone.
            </p>

            <button
              type="button"
              className="empty-new-button"
              onClick={goToReportIssue}
            >
              <Plus size={17} />
              Report Your First Issue
            </button>
          </div>
        </div>
      )}

      {/* ISSUE LIST */}
      {!loading && !error && issues.length > 0 && (
        <div
          className={`my-issues-list ${
            view === "compact" ? "compact-view" : ""
          }`}
        >
          {issues.map((issue) => (
            <article className="my-issue-card" key={issue._id}>
              <div className="my-issue-image">
                <img
                  src={
                    issue.images?.find((image) => image?.url)?.url ||
                    "/images/default-issue.jpeg"
                  }
                  alt={issue.title || "Issue"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/default-issue.jpeg";
                  }}
                />

                <div className="image-overlay" />

                <div
                  className={`image-moderation ${getModerationClass(
                    issue.moderationStatus
                  )}`}
                >
                  {getModerationIcon(issue.moderationStatus)}
                  {issue.moderationStatus || "Pending"}
                </div>

                <div
                  className={`issue-status-badge ${getStatusClass(issue.status)}`}
                >
                  {getStatusIcon(issue.status)}
                  {issue.status || "Under Review"}
                </div>

                <div className="issue-category-badge">
                  <Tag size={11} />
                  {issue.category || "General"}
                </div>

                <div className="image-location">
                  <MapPin size={12} />
                  {issue.location || "Location not provided"}
                </div>
              </div>

              <div className="my-issue-content">
                <div className="issue-card-header">
                  <div className="issue-time">
                    <Clock3 size={13} />
                    {formatTimeAgo(issue.createdAt)}
                  </div>

                  <span className="issue-reference">
                    #{issue._id?.slice(-6)}
                  </span>
                </div>

                <h2>{issue.title || "Untitled Issue"}</h2>

                <p className="my-issue-description">
                  {issue.description || "No description provided for this issue."}
                </p>

                <div className="issue-quick-meta">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setShowComments(true);
                    }}
                    aria-label="Open comments"
                  >
                    <MessageCircle size={13} />
                    {getCommentsCount(issue)} comments
                  </button>

                  <span>
                    <TrendingUp size={13} />
                    {(issue.upvotes ?? 0) + (issue.downvotes ?? 0)} votes
                  </span>
                </div>

                <button
                  type="button"
                  className="details-button"
                  onClick={() => openIssueModal(issue)}
                >
                  <span>View Issue Details</span>
                  <span className="details-button-icon">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ISSUE DETAILS MODAL */}
      {selectedIssue && !showComments && (
        <div
          className="issue-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeIssueModal();
          }}
        >
          <div
            className="issue-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Issue details"
          >
            <div className="issue-modal-header">
              <div>
                <span className="modal-eyebrow">ISSUE DETAILS</span>
                <h2>{selectedIssue.title || "Untitled Issue"}</h2>
                <span className="modal-reference">
                  Reference #{selectedIssue._id?.slice(-6)}
                </span>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeIssueModal}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="issue-modal-body">
              <div className="modal-image-wrapper">
                <img
                  src={
                    selectedIssue.images?.find((image) => image?.url)?.url ||
                    "/images/default-issue.jpeg"
                  }
                  alt={selectedIssue.title || "Issue"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/default-issue.jpeg";
                  }}
                />

                <div className="modal-image-gradient" />

                <div
                  className={`modal-status ${getStatusClass(selectedIssue.status)}`}
                >
                  {getStatusIcon(selectedIssue.status)}
                  {selectedIssue.status || "Under Review"}
                </div>
              </div>

              {selectedIssue.moderationStatus && (
                <div
                  className={`modal-moderation ${getModerationClass(
                    selectedIssue.moderationStatus
                  )}`}
                >
                  {getModerationIcon(selectedIssue.moderationStatus)}
                  <span>
                    Moderation: <strong>{selectedIssue.moderationStatus}</strong>
                  </span>
                </div>
              )}

              <div className="modal-description-section">
                <div className="modal-section-title">
                  <FileText size={15} />
                  Description
                </div>
                <p>
                  {selectedIssue.description || "No description provided for this issue."}
                </p>
              </div>

              <div className="modal-detail-grid">
                <div className="modal-detail-card">
                  <div className="modal-detail-icon"><Tag size={17} /></div>
                  <div>
                    <span>Category</span>
                    <strong>{selectedIssue.category || "General"}</strong>
                  </div>
                </div>

                <div className="modal-detail-card">
                  <div className="modal-detail-icon"><MapPin size={17} /></div>
                  <div>
                    <span>Location</span>
                    <strong>{selectedIssue.location || "Location not provided"}</strong>
                  </div>
                </div>

                <div className="modal-detail-card">
                  <div className="modal-detail-icon"><CalendarDays size={17} /></div>
                  <div>
                    <span>Reported On</span>
                    <strong>
                      {selectedIssue.createdAt
                        ? new Date(selectedIssue.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Recently"}
                    </strong>
                  </div>
                </div>

                <div className="modal-detail-card">
                  <div className="modal-detail-icon"><Clock3 size={17} /></div>
                  <div>
                    <span>Submitted</span>
                    <strong>{formatTimeAgo(selectedIssue.createdAt)}</strong>
                  </div>
                </div>

                <div className="modal-detail-card">
                  <div className="modal-detail-icon"><UserRound size={17} /></div>
                  <div>
                    <span>Reported By</span>
                    <strong>
                      {selectedIssue.user?.name ||
                        selectedIssue.createdBy?.name ||
                        selectedIssue.reportedBy?.name ||
                        "You"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-detail-card"
                  onClick={() => setShowComments(true)}
                >
                  <div className="modal-detail-icon"><MessageCircle size={17} /></div>
                  <div>
                    <span>Comments</span>
                    <strong>{getCommentsCount(selectedIssue)} · View comments</strong>
                  </div>
                </button>
              </div>

              {selectedIssue.moderationStatus === "Dismissed" &&
                selectedIssue.dismissReason && (
                  <div className="modal-dismiss-box">
                    <div className="modal-dismiss-title">
                      <XCircle size={16} />
                      Dismissal Reason
                    </div>
                    <p>{selectedIssue.dismissReason}</p>
                  </div>
                )}

              <div className="modal-engagement">
                <div className="engagement-heading">Community response</div>

                <div className="engagement-actions">
                  <button
                    type="button"
                    className={`modal-vote-button ${
                      selectedIssue.userVote === "up" ? "vote-active-up" : ""
                    }`}
                    disabled={
                      selectedIssue.moderationStatus !== "Approved" ||
                      votingIssueId === selectedIssue._id
                    }
                    onClick={() => handleVote(selectedIssue._id, "up")}
                  >
                    <span>↑</span>
                    Upvote
                    <strong>{selectedIssue.upvotes ?? 0}</strong>
                  </button>

                  <button
                    type="button"
                    className={`modal-vote-button ${
                      selectedIssue.userVote === "down" ? "vote-active-down" : ""
                    }`}
                    disabled={
                      selectedIssue.moderationStatus !== "Approved" ||
                      votingIssueId === selectedIssue._id
                    }
                    onClick={() => handleVote(selectedIssue._id, "down")}
                  >
                    <span>↓</span>
                    Downvote
                    <strong>{selectedIssue.downvotes ?? 0}</strong>
                  </button>

                  <button
                    type="button"
                    className="modal-comment-count"
                    onClick={() => setShowComments(true)}
                  >
                    <MessageCircle size={17} />
                    <div>
                      <span>Comments</span>
                      <strong>{getCommentsCount(selectedIssue)}</strong>
                    </div>
                  </button>
                </div>

                {selectedIssue.moderationStatus !== "Approved" && (
                  <div className="modal-vote-info">
                    <AlertCircle size={14} />
                    Voting will be available after this issue is approved.
                  </div>
                )}
              </div>
            </div>

            <div className="issue-modal-footer">
              <div className="modal-footer-reference">
                <span>Submitted by</span>
                <strong>
                  {selectedIssue.user?.name ||
                    selectedIssue.createdBy?.name ||
                    selectedIssue.reportedBy?.name ||
                    "You"}
                </strong>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="modal-icon-action"
                  disabled={savingIssueId === getIssueId(selectedIssue)}
                  onClick={() => handleToggleSave(selectedIssue)}
                  title={savedIssueIds.has(getIssueId(selectedIssue)) ? "Unsave issue" : "Save issue"}
                >
                  {savedIssueIds.has(getIssueId(selectedIssue)) ? (
                    <BookmarkCheck size={17} />
                  ) : (
                    <Bookmark size={17} />
                  )}
                  {savedIssueIds.has(getIssueId(selectedIssue)) ? "Saved" : "Save"}
                </button>

                <button
                  type="button"
                  className="modal-icon-action"
                  onClick={() => handleShareIssue(selectedIssue)}
                  title="Share issue"
                >
                  <Share2 size={17} />
                  Share
                </button>

                <button
                  type="button"
                  className="modal-icon-action"
                  disabled={deletingIssueId === getIssueId(selectedIssue)}
                  onClick={() => handleDeleteIssue(selectedIssue)}
                  title="Delete your issue"
                >
                  <Trash2 size={17} />
                  {deletingIssueId === getIssueId(selectedIssue) ? "Deleting..." : "Delete"}
                </button>

                <button
                  type="button"
                  className="modal-close-text"
                  onClick={closeIssueModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS POPUP */}
      {selectedIssue && showComments && (
        <IssueCommentsModal
          issue={selectedIssue}
          onClose={() => setShowComments(false)}
          onCommentCountChange={(count) =>
            updateIssueCommentCount(selectedIssue._id, count)
          }
        />
      )}
    </div>
  );
}

export default MyIssue;
