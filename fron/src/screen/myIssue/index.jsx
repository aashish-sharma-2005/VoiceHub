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
  UserRound,
  CalendarDays,
  Tag,
  FileText,
  Activity,
  CircleDot,
  TrendingUp,
  X,
} from "lucide-react";

import {
  getMyIssues,
  voteIssue,
} from "../../services/issueService";

import "./myIssue.css";

function MyIssue() {
  const token = useSelector((state) => state.login?.token);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [votingIssueId, setVotingIssueId] = useState(null);

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

  const handleVote = async (issueId, vote) => {
    try {
      if (votingIssueId) {
        return;
      }

      setVotingIssueId(issueId);

      const data = await voteIssue(issueId, vote);

      const updatedIssue = data.issue;

      setIssues((currentIssues) =>
        currentIssues.map((issue) => {
          if (issue._id !== issueId) {
            return issue;
          }

          return {
            ...issue,
            upvotes: updatedIssue.upvotes,
            downvotes: updatedIssue.downvotes,
            userVote: updatedIssue.userVote,
          };
        })
      );

      setSelectedIssue((currentIssue) => {
        if (!currentIssue || currentIssue._id !== issueId) {
          return currentIssue;
        }

        return {
          ...currentIssue,
          upvotes: updatedIssue.upvotes,
          downvotes: updatedIssue.downvotes,
          userVote: updatedIssue.userVote,
        };
      });
    } catch (error) {
      console.error("Vote issue error:", error);

      alert(error.message || "Unable to update your vote.");
    } finally {
      setVotingIssueId(null);
    }
  };

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    document.body.classList.add("modal-open");
  };

  const closeIssueModal = () => {
    setSelectedIssue(null);
    document.body.classList.remove("modal-open");
  };

  const formatTimeAgo = (date) => {
    if (!date) {
      return "Recently";
    }

    const created = new Date(date);
    const now = new Date();

    const difference = Math.floor((now - created) / 1000);

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
      return <Activity size={14} />;
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

  const totalIssues = issues.length;

  const pendingIssues = issues.filter(
    (issue) =>
      !issue.moderationStatus ||
      issue.moderationStatus === "Pending"
  ).length;

  const approvedIssues = issues.filter(
    (issue) => issue.moderationStatus === "Approved"
  );

  const inProgressIssues = approvedIssues.filter((issue) => {
    const status = issue.status?.toLowerCase() || "";

    return (
      status.includes("progress") ||
      status.includes("working")
    );
  }).length;

  const resolvedIssues = approvedIssues.filter((issue) => {
    const status = issue.status?.toLowerCase() || "";

    return status.includes("resolved");
  }).length;

  return (
    <div className="my-issues-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

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
          >
            <Plus size={16} />
            Report Issue
          </button>

        </div>
      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="my-issues-hero">

        <div className="hero-copy">

          <div className="page-eyebrow">
            YOUR COMMUNITY VOICE
          </div>

          <h1>
            Your Issues.
            <span>Your Impact.</span>
          </h1>

          <p>
            Keep track of every issue you've reported and follow
            its journey from submission to resolution.
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
          >
            <Plus size={17} />
            New Issue
          </button>

        </div>

      </section>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      {!loading && !error && (
        <section className="issue-statistics">

          <div className="stat-card stat-total">
            <div className="stat-icon">
              <FileText size={19} />
            </div>

            <div className="stat-info">
              <span>Total Reported</span>
              <strong>{totalIssues}</strong>
            </div>

            <div className="stat-decoration">
              <ClipboardList size={50} />
            </div>
          </div>


          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <Clock3 size={19} />
            </div>

            <div className="stat-info">
              <span>Under Review</span>
              <strong>{pendingIssues}</strong>
            </div>

            <div className="stat-decoration">
              <CircleDot size={50} />
            </div>
          </div>


          <div className="stat-card stat-progress">
            <div className="stat-icon">
              <TrendingUp size={19} />
            </div>

            <div className="stat-info">
              <span>In Progress</span>
              <strong>{inProgressIssues}</strong>
            </div>

            <div className="stat-decoration">
              <Activity size={50} />
            </div>
          </div>


          <div className="stat-card stat-resolved">
            <div className="stat-icon">
              <CheckCircle2 size={19} />
            </div>

            <div className="stat-info">
              <span>Resolved</span>
              <strong>{resolvedIssues}</strong>
            </div>

            <div className="stat-decoration">
              <CheckCircle2 size={50} />
            </div>
          </div>

        </section>
      )}


      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      {!loading && !error && issues.length > 0 && (
        <div className="issues-section-header">

          <div>
            <div className="section-kicker">
              YOUR SUBMISSIONS
            </div>

            <h2>Issues you've reported</h2>

            <p>
              Stay updated on what is happening with your reports.
            </p>
          </div>

          <div className="issue-count-label">
            <span>{totalIssues}</span>
            {totalIssues === 1 ? " Issue" : " Issues"}
          </div>

        </div>
      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="my-issues-state loading-state">

          <div className="loading-spinner"></div>

          <h3>Loading your issues</h3>

          <p>
            We're getting your community reports ready.
          </p>

        </div>
      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

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


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        issues.length === 0 && (
          <div className="empty-issues">

            <div className="empty-illustration">

              <div className="empty-circle">
                <ClipboardList size={38} />
              </div>

              <span className="empty-dot empty-dot-one"></span>
              <span className="empty-dot empty-dot-two"></span>
              <span className="empty-dot empty-dot-three"></span>

            </div>

            <div className="empty-content">

              <span className="empty-kicker">
                START MAKING AN IMPACT
              </span>

              <h3>
                Your community needs your voice.
              </h3>

              <p>
                Report a problem around you and help make your
                community cleaner, safer and better for everyone.
              </p>

              <button
                type="button"
                className="empty-new-button"
              >
                <Plus size={17} />
                Report Your First Issue
              </button>

            </div>

          </div>
        )}


      {/* =====================================================
          ISSUE LIST
      ===================================================== */}

      {!loading &&
        !error &&
        issues.length > 0 && (
          <div
            className={`my-issues-list ${
              view === "compact" ? "compact-view" : ""
            }`}
          >

            {issues.map((issue) => {

              const reporter =
                issue.user?.name ||
                issue.createdBy?.name ||
                issue.reportedBy?.name ||
                "You";

              return (
                <article
                  className="my-issue-card"
                  key={issue._id}
                >

                  {/* IMAGE */}

                  <div className="my-issue-image">

                    <img
                      src={
                        issue.images &&
                        issue.images.length > 0 &&
                        issue.images[0]?.url
                          ? issue.images[0].url
                          : "/images/default-issue.jpeg"
                      }
                      alt={issue.title || "Issue"}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/images/default-issue.jpeg";
                      }}
                    />

                    <div className="image-overlay"></div>


                    {/* MODERATION */}

                    {issue.moderationStatus && (
                      <div
                        className={`image-moderation ${getModerationClass(
                          issue.moderationStatus
                        )}`}
                      >
                        {getModerationIcon(
                          issue.moderationStatus
                        )}

                        {issue.moderationStatus}
                      </div>
                    )}


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

                      <Tag size={11} />

                      {issue.category || "General"}

                    </div>


                    {/* LOCATION */}

                    <div className="image-location">

                      <MapPin size={12} />

                      {issue.location ||
                        "Location not provided"}

                    </div>

                  </div>


                  {/* CONTENT */}

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


                    <h2>
                      {issue.title || "Untitled Issue"}
                    </h2>


                    <p className="my-issue-description">
                      {issue.description ||
                        "No description provided for this issue."}
                    </p>


                    <div className="issue-quick-meta">

                      <span>
                        <MessageCircle size={13} />
                        {getCommentsCount(issue)} comments
                      </span>

                      <span>
                        <TrendingUp size={13} />
                        {issue.upvotes ?? 0} votes
                      </span>

                    </div>


                    {/* OPEN MODAL */}

                    <button
                      type="button"
                      className="details-button"
                      onClick={() =>
                        openIssueModal(issue)
                      }
                    >
                      <span>View Issue Details</span>

                      <span className="details-button-icon">
                        →
                      </span>
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}


      {/* =====================================================
          ISSUE DETAILS MODAL
      ===================================================== */}

      {selectedIssue && (
        <div
          className="issue-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeIssueModal();
            }
          }}
        >

          <div
            className="issue-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Issue details"
          >

            {/* MODAL HEADER */}

            <div className="issue-modal-header">

              <div>
                <span className="modal-eyebrow">
                  ISSUE DETAILS
                </span>

                <h2>
                  {selectedIssue.title ||
                    "Untitled Issue"}
                </h2>

                <span className="modal-reference">
                  Reference #
                  {selectedIssue._id?.slice(-6)}
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


            {/* MODAL BODY */}

            <div className="issue-modal-body">

              {/* IMAGE */}

              <div className="modal-image-wrapper">

                <img
                  src={
                    selectedIssue.images &&
                    selectedIssue.images.length > 0 &&
                    selectedIssue.images[0]?.url
                      ? selectedIssue.images[0].url
                      : "/images/default-issue.jpeg"
                  }
                  alt={
                    selectedIssue.title ||
                    "Issue"
                  }
                  onError={(event) => {
                    event.currentTarget.src =
                      "/images/default-issue.jpeg";
                  }}
                />

                <div className="modal-image-gradient"></div>

                <div
                  className={`modal-status ${getStatusClass(
                    selectedIssue.status
                  )}`}
                >
                  {getStatusIcon(
                    selectedIssue.status
                  )}

                  {selectedIssue.status ||
                    "Under Review"}
                </div>

              </div>


              {/* MODERATION */}

              {selectedIssue.moderationStatus && (
                <div
                  className={`modal-moderation ${getModerationClass(
                    selectedIssue.moderationStatus
                  )}`}
                >

                  {getModerationIcon(
                    selectedIssue.moderationStatus
                  )}

                  <span>
                    Moderation:
                    {" "}
                    <strong>
                      {selectedIssue.moderationStatus}
                    </strong>
                  </span>

                </div>
              )}


              {/* DESCRIPTION */}

              <div className="modal-description-section">

                <div className="modal-section-title">
                  <FileText size={15} />
                  Description
                </div>

                <p>
                  {selectedIssue.description ||
                    "No description provided for this issue."}
                </p>

              </div>


              {/* DETAILS */}

              <div className="modal-detail-grid">

                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <Tag size={17} />
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>
                      {selectedIssue.category ||
                        "General"}
                    </strong>
                  </div>

                </div>


                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <MapPin size={17} />
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>
                      {selectedIssue.location ||
                        "Location not provided"}
                    </strong>
                  </div>

                </div>


                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Reported On</span>
                    <strong>
                      {selectedIssue.createdAt
                        ? new Date(
                            selectedIssue.createdAt
                          ).toLocaleDateString(
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

                  <div className="modal-detail-icon">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <span>Submitted</span>
                    <strong>
                      {formatTimeAgo(
                        selectedIssue.createdAt
                      )}
                    </strong>
                  </div>

                </div>


                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <UserRound size={17} />
                  </div>

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


                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <MessageCircle size={17} />
                  </div>

                  <div>
                    <span>Comments</span>
                    <strong>
                      {getCommentsCount(
                        selectedIssue
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              {/* DISMISS REASON */}

              {selectedIssue.moderationStatus ===
                "Dismissed" &&
                selectedIssue.dismissReason && (
                  <div className="modal-dismiss-box">

                    <div className="modal-dismiss-title">
                      <XCircle size={16} />
                      Dismissal Reason
                    </div>

                    <p>
                      {selectedIssue.dismissReason}
                    </p>

                  </div>
                )}


              {/* VOTE / ENGAGEMENT */}

              <div className="modal-engagement">

                <div className="engagement-heading">
                  Community response
                </div>

                <div className="engagement-actions">

                  <button
                    type="button"
                    className={`modal-vote-button ${
                      selectedIssue.userVote === "up"
                        ? "vote-active-up"
                        : ""
                    }`}
                    disabled={
                      selectedIssue.moderationStatus !==
                        "Approved" ||
                      votingIssueId ===
                        selectedIssue._id
                    }
                    onClick={() =>
                      handleVote(
                        selectedIssue._id,
                        "up"
                      )
                    }
                  >
                    <span>↑</span>
                    Upvote
                    <strong>
                      {selectedIssue.upvotes ?? 0}
                    </strong>
                  </button>


                  <button
                    type="button"
                    className={`modal-vote-button ${
                      selectedIssue.userVote === "down"
                        ? "vote-active-down"
                        : ""
                    }`}
                    disabled={
                      selectedIssue.moderationStatus !==
                        "Approved" ||
                      votingIssueId ===
                        selectedIssue._id
                    }
                    onClick={() =>
                      handleVote(
                        selectedIssue._id,
                        "down"
                      )
                    }
                  >
                    <span>↓</span>
                    Downvote
                    <strong>
                      {selectedIssue.downvotes ?? 0}
                    </strong>
                  </button>


                  <div className="modal-comment-count">

                    <MessageCircle size={17} />

                    <div>
                      <span>Comments</span>
                      <strong>
                        {getCommentsCount(
                          selectedIssue
                        )}
                      </strong>
                    </div>

                  </div>

                </div>


                {selectedIssue.moderationStatus !==
                  "Approved" && (
                  <div className="modal-vote-info">
                    <AlertCircle size={14} />
                    Voting will be available after
                    this issue is approved.
                  </div>
                )}

              </div>

            </div>


            {/* MODAL FOOTER */}

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
                  title="Save issue"
                >
                  <Bookmark size={17} />
                  Save
                </button>

                <button
                  type="button"
                  className="modal-icon-action"
                  title="Share issue"
                >
                  <Share2 size={17} />
                  Share
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

    </div>
  );
}

export default MyIssue;