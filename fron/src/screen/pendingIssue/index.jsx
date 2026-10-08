import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  MapPin,
  UserRound,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Eye,
} from "lucide-react";

import {
  getManageIssues,
  approveIssue,
  dismissIssue,
} from "../../services/issueService";

import "./pendingIssue.css";

function PendingIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] =
    useState(null);

  const [dismissModal, setDismissModal] =
    useState(false);

  const [selectedIssue, setSelectedIssue] =
    useState(null);

  const [dismissReason, setDismissReason] =
    useState("");

  /* =========================
     FETCH PENDING ISSUES
  ========================= */

  const fetchPendingIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getManageIssues();

      const allIssues = data.issues || [];

      const pendingIssues = allIssues.filter(
        (issue) =>
          issue.moderationStatus === "Pending"
      );

      setIssues(pendingIssues);
    } catch (error) {
      console.error(
        "Fetch pending issues error:",
        error
      );

      setError(
        error.message ||
          "Unable to load pending issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingIssues();
  }, []);

  /* =========================
     APPROVE ISSUE
  ========================= */

  const handleApprove = async (issueId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this issue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(issueId);

      await approveIssue(issueId);

      setIssues((currentIssues) =>
        currentIssues.filter(
          (issue) => issue._id !== issueId
        )
      );
    } catch (error) {
      console.error(
        "Approve issue error:",
        error
      );

      alert(
        error.message ||
          "Failed to approve issue."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================
     OPEN DISMISS MODAL
  ========================= */

  const openDismissModal = (issue) => {
    setSelectedIssue(issue);
    setDismissReason("");
    setDismissModal(true);
  };

  /* =========================
     DISMISS ISSUE
  ========================= */

  const handleDismiss = async () => {
    if (!selectedIssue) {
      return;
    }

    if (!dismissReason.trim()) {
      alert(
        "Please enter a reason for dismissing this issue."
      );

      return;
    }

    try {
      setProcessingId(
        selectedIssue._id
      );

      await dismissIssue(
        selectedIssue._id,
        dismissReason.trim()
      );

      setIssues((currentIssues) =>
        currentIssues.filter(
          (issue) =>
            issue._id !==
            selectedIssue._id
        )
      );

      setDismissModal(false);
      setSelectedIssue(null);
      setDismissReason("");
    } catch (error) {
      console.error(
        "Dismiss issue error:",
        error
      );

      alert(
        error.message ||
          "Failed to dismiss issue."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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

  return (
    <div className="pending-issues-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="pending-page-header">

        <div className="pending-header-left">

          <div className="pending-header-icon">
            <ClipboardCheck size={25} />
          </div>

          <div>
            <div className="pending-breadcrumb">
              Community Voice
              <span>›</span>
              Moderation
              <span>›</span>
              Pending Reports
            </div>

            <h1>
              Pending Issues
            </h1>

            <p>
              Review reported community issues
              before they become publicly visible.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="pending-refresh-button"
          onClick={fetchPendingIssues}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "refresh-spinning"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =========================
          STATS
      ========================= */}

      {!loading && !error && (
        <div className="pending-stats">

          <div className="pending-stat-card">

            <div className="pending-stat-icon pending">
              <Clock3 size={20} />
            </div>

            <div>
              <span>
                Pending Review
              </span>

              <strong>
                {issues.length}
              </strong>
            </div>

          </div>

          <div className="pending-info-card">
            <AlertCircle size={18} />

            <span>
              Review each issue carefully
              before approving or dismissing it.
            </span>
          </div>

        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="pending-state">

          <div className="pending-loader"></div>

          <h3>
            Loading pending issues...
          </h3>

          <p>
            Fetching reports waiting for
            moderation.
          </p>

        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {!loading && error && (
        <div className="pending-state error">

          <div className="pending-state-icon">
            <AlertCircle size={30} />
          </div>

          <h3>
            Unable to load issues
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchPendingIssues}
            className="pending-retry-button"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>
      )}

      {/* =========================
          EMPTY
      ========================= */}

      {!loading &&
        !error &&
        issues.length === 0 && (
          <div className="pending-state">

            <div className="pending-state-icon success">
              <CheckCircle2 size={30} />
            </div>

            <h3>
              No pending issues
            </h3>

            <p>
              Great! There are currently no
              reports waiting for moderation.
            </p>

          </div>
        )}

      {/* =========================
          ISSUE LIST
      ========================= */}

      {!loading &&
        !error &&
        issues.length > 0 && (

          <div className="pending-issues-list">

            {issues.map((issue) => {

              const isProcessing =
                processingId ===
                issue._id;

              return (
                <article
                  className="pending-issue-card"
                  key={issue._id}
                >

                  {/* IMAGE */}

                  <div className="pending-issue-image">

                    <img
                      src={getIssueImage(
                        issue
                      )}
                      alt={
                        issue.title ||
                        "Reported issue"
                      }
                      onError={(event) => {
                        event.currentTarget.src =
                          "/images/default-issue.jpeg";
                      }}
                    />

                    <div className="pending-status-badge">
                      <Clock3 size={14} />
                      Pending Review
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="pending-issue-content">

                    <div className="pending-issue-top">

                      <span className="pending-category">
                        {issue.category ||
                          "Other"}
                      </span>

                      <span className="pending-date">
                        <Clock3 size={13} />
                        {formatDate(
                          issue.createdAt
                        )}
                      </span>

                    </div>

                    <h2>
                      {issue.title ||
                        "Untitled Issue"}
                    </h2>

                    <p className="pending-description">
                      {issue.description ||
                        "No description provided."}
                    </p>

                    {/* LOCATION */}

                    <div className="pending-meta">

                      <span>
                        <MapPin size={15} />

                        {issue.location ||
                          "Location not provided"}
                      </span>

                    </div>

                    {/* USER */}

                    <div className="pending-reporter">

                      <div className="reporter-avatar">
                        {issue.createdBy?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "U"}
                      </div>

                      <div>
                        <small>
                          Reported by
                        </small>

                        <strong>
                          {issue.createdBy
                            ?.name ||
                            "Unknown User"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="pending-issue-actions">

                    <button
                      type="button"
                      className="view-issue-button"
                      title="View issue"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      type="button"
                      className="approve-issue-button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        handleApprove(
                          issue._id
                        )
                      }
                    >
                      <CheckCircle2
                        size={17}
                      />

                      {isProcessing
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="dismiss-issue-button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        openDismissModal(
                          issue
                        )
                      }
                    >
                      <XCircle size={17} />
                      Dismiss
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      {/* =========================
          DISMISS MODAL
      ========================= */}

      {dismissModal && (
        <div className="dismiss-modal-overlay">

          <div className="dismiss-modal">

            <div className="dismiss-modal-icon">
              <XCircle size={24} />
            </div>

            <h2>
              Dismiss Issue
            </h2>

            <p>
              Please provide a reason for
              dismissing this report.
            </p>

            <textarea
              value={dismissReason}
              onChange={(event) =>
                setDismissReason(
                  event.target.value
                )
              }
              placeholder="Enter dismissal reason..."
              rows={4}
            />

            <div className="dismiss-modal-actions">

              <button
                type="button"
                className="cancel-dismiss-button"
                onClick={() => {
                  setDismissModal(false);
                  setSelectedIssue(null);
                  setDismissReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-dismiss-button"
                disabled={
                  !dismissReason.trim() ||
                  processingId !== null
                }
                onClick={
                  handleDismiss
                }
              >
                <XCircle size={16} />
                Dismiss Issue
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PendingIssues;