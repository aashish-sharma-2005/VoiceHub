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
  FileText,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

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
  const [processingId, setProcessingId] = useState(null);

  const [dismissModal, setDismissModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [dismissReason, setDismissReason] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);

  const [approveModal, setApproveModal] = useState(false);
  const [approvalIssue, setApprovalIssue] = useState(null);

  /* FETCH PENDING ISSUES */

  const fetchPendingIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getManageIssues();
      const allIssues = data.issues || [];

      // Include older records that do not have moderationStatus.
      const pendingIssues = allIssues.filter(
        (issue) =>
          !issue.moderationStatus ||
          issue.moderationStatus === "Pending"
      );

      setIssues(pendingIssues);
    } catch (error) {
      console.error("Fetch pending issues error:", error);
      setError(error.message || "Unable to load pending issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingIssues();
  }, []);

  /* VIEW ISSUE DETAILS */

  const handleViewIssue = (issue) => {
    setViewIssue(issue);
    setViewModal(true);
  };

  const closeViewModal = () => {
    setViewModal(false);
    setViewIssue(null);
  };

  /* OPEN APPROVAL CONFIRMATION */

  const handleApprove = (issue) => {
    if (!issue?._id || processingId !== null) return;

    setApprovalIssue(issue);
    setApproveModal(true);
  };

  /* CLOSE APPROVAL CONFIRMATION */

  const closeApproveModal = () => {
    if (processingId !== null) return;

    setApproveModal(false);
    setApprovalIssue(null);
  };

  /* CONFIRM APPROVAL */

  const confirmApprove = async () => {
    if (!approvalIssue || processingId !== null) return;

    const issueId = approvalIssue._id;

    try {
      setProcessingId(issueId);

      await approveIssue(issueId);

      setIssues((currentIssues) =>
        currentIssues.filter((issue) => issue._id !== issueId)
      );

      if (viewIssue?._id === issueId) {
        closeViewModal();
      }

      setApproveModal(false);
      setApprovalIssue(null);

      toast.success("Issue approved successfully. It is now ready for public viewing.");
    } catch (error) {
      console.error("Approve issue error:", error);
      toast.error(error.message || "Failed to approve issue.");
    } finally {
      setProcessingId(null);
    }
  };

  /* OPEN DISMISS MODAL */

  const openDismissModal = (issue) => {
    if (!issue?._id || processingId !== null) return;

    setSelectedIssue(issue);
    setDismissReason("");
    setViewModal(false);
    setViewIssue(null);
    setDismissModal(true);
  };

  /* CLOSE DISMISS MODAL */

  const closeDismissModal = () => {
    if (processingId !== null) return;

    setDismissModal(false);
    setSelectedIssue(null);
    setDismissReason("");
  };

  /* DISMISS ISSUE */

  const handleDismiss = async () => {
    if (!selectedIssue || processingId !== null) return;

    if (!dismissReason.trim()) {
      toast.warning("Please enter a reason for dismissing this issue.");
      return;
    }

    const issueId = selectedIssue._id;

    try {
      setProcessingId(issueId);

      await dismissIssue(issueId, dismissReason.trim());

      setIssues((currentIssues) =>
        currentIssues.filter((issue) => issue._id !== issueId)
      );

      setDismissModal(false);
      setSelectedIssue(null);
      setDismissReason("");

      toast.success("Issue dismissed successfully.");
    } catch (error) {
      console.error("Dismiss issue error:", error);
      toast.error(error.message || "Failed to dismiss issue.");
    } finally {
      setProcessingId(null);
    }
  };

  /* FORMAT DATE */

  const formatDate = (date) => {
    if (!date) return "Recently";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ISSUE IMAGE */

  const getIssueImage = (issue) => {
    if (issue?.images?.length > 0 && issue.images[0]?.url) {
      return issue.images[0].url;
    }

    return "/images/default-issue.jpeg";
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/images/default-issue.jpeg";
  };

  return (
    <div className="pending-issues-page">
      {/* HEADER */}

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

            <h1>Pending Issues</h1>

            <p>
              Review reported community issues before they become publicly
              visible.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pending-refresh-button"
          onClick={fetchPendingIssues}
          disabled={loading || processingId !== null}
        >
          <RefreshCw
            size={16}
            className={loading ? "refresh-spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* SUMMARY */}

      {!loading && !error && (
        <div className="pending-stats">
          <div className="pending-stat-card">
            <div className="pending-stat-icon pending">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Pending Review</span>
              <strong>{issues.length}</strong>
            </div>
          </div>

          <div className="pending-info-card">
            <AlertCircle size={18} />
            <span>
              Review each issue carefully before approving or dismissing it.
            </span>
          </div>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="pending-state">
          <div className="pending-loader" />
          <h3>Loading pending issues...</h3>
          <p>Fetching reports waiting for moderation.</p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="pending-state error">
          <div className="pending-state-icon">
            <AlertCircle size={30} />
          </div>

          <h3>Unable to load issues</h3>
          <p>{error}</p>

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

      {/* EMPTY STATE */}

      {!loading && !error && issues.length === 0 && (
        <div className="pending-state">
          <div className="pending-state-icon success">
            <CheckCircle2 size={30} />
          </div>

          <h3>No pending issues</h3>
          <p>
            Great! There are currently no reports waiting for moderation.
          </p>
        </div>
      )}

      {/* ISSUE LIST */}

      {!loading && !error && issues.length > 0 && (
        <div className="pending-issues-list">
          {issues.map((issue) => {
            const isProcessing = processingId === issue._id;

            return (
              <article className="pending-issue-card" key={issue._id}>
                {/* IMAGE */}

                <div className="pending-issue-image">
                  <img
                    src={getIssueImage(issue)}
                    alt={issue.title || "Reported issue"}
                    onError={handleImageError}
                  />

                  <div className="pending-status-badge">
                    <Clock3 size={14} />
                    Pending Review
                  </div>
                </div>

                {/* ISSUE INFORMATION */}

                <div className="pending-issue-content">
                  <div className="pending-issue-top">
                    <span className="pending-category">
                      {issue.category || "Other"}
                    </span>

                    <span className="pending-date">
                      <Clock3 size={13} />
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>

                  <h2>{issue.title || "Untitled Issue"}</h2>

                  <p className="pending-description">
                    {issue.description || "No description provided."}
                  </p>

                  <div className="pending-meta">
                    <span>
                      <MapPin size={15} />
                      {issue.location || "Location not provided"}
                    </span>
                  </div>

                  <div className="pending-reporter">
                    <div className="reporter-avatar">
                      {issue.createdBy?.name?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>

                    <div>
                      <small>Reported by</small>
                      <strong>
                        {issue.createdBy?.name || "Unknown User"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="pending-issue-actions">
                  <button
                    type="button"
                    className="view-issue-button"
                    title="View issue details"
                    onClick={() => handleViewIssue(issue)}
                    disabled={processingId !== null}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  <button
                    type="button"
                    className="approve-issue-button"
                    disabled={isProcessing || processingId !== null}
                    onClick={() => handleApprove(issue)}
                  >
                    <CheckCircle2 size={17} />
                    {isProcessing ? "Processing..." : "Approve"}
                  </button>

                  <button
                    type="button"
                    className="dismiss-issue-button"
                    disabled={isProcessing || processingId !== null}
                    onClick={() => openDismissModal(issue)}
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

      {/* VIEW DETAILS MODAL */}

      {viewModal && viewIssue && (
        <div
          className="pending-details-overlay"
          onClick={closeViewModal}
        >
          <section
            className="pending-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="pending-details-header">
              <div>
                <span className="pending-details-eyebrow">
                  <FileText size={14} />
                  COMMUNITY REPORT
                </span>

                <h2 id="pending-details-title">Issue Details</h2>

                <p>Review the complete report before making a decision.</p>
              </div>

              <button
                type="button"
                className="pending-details-close"
                onClick={closeViewModal}
                aria-label="Close issue details"
              >
                <X size={20} />
              </button>
            </header>

            <div className="pending-details-body">
              <img
                className="pending-details-image"
                src={getIssueImage(viewIssue)}
                alt={viewIssue.title || "Reported issue"}
                onError={handleImageError}
              />

              <div className="pending-details-tags">
                <span className="pending-category">
                  {viewIssue.category || "Other"}
                </span>

                <span className="pending-details-status">
                  <Clock3 size={13} />
                  {viewIssue.moderationStatus || "Pending Review"}
                </span>
              </div>

              <h3 className="pending-details-title">
                {viewIssue.title || "Untitled Issue"}
              </h3>

              <p className="pending-details-description">
                {viewIssue.description || "No description provided."}
              </p>

              <div className="pending-details-information">
                <div className="pending-details-row">
                  <MapPin size={18} />

                  <div>
                    <small>Location</small>
                    <strong>
                      {viewIssue.location || "Location not provided"}
                    </strong>
                  </div>
                </div>

                <div className="pending-details-row">
                  <UserRound size={18} />

                  <div>
                    <small>Reported by</small>
                    <strong>
                      {viewIssue.createdBy?.name || "Unknown User"}
                    </strong>
                  </div>
                </div>

                <div className="pending-details-row">
                  <Clock3 size={18} />

                  <div>
                    <small>Date reported</small>
                    <strong>{formatDate(viewIssue.createdAt)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <footer className="pending-details-footer">
              <button
                type="button"
                className="pending-details-close-button"
                onClick={closeViewModal}
              >
                Close
              </button>

              <button
                type="button"
                className="pending-details-approve-button"
                disabled={processingId !== null}
                onClick={() => handleApprove(viewIssue)}
              >
                <CheckCircle2 size={16} />
                Approve
              </button>

              <button
                type="button"
                className="pending-details-dismiss-button"
                disabled={processingId !== null}
                onClick={() => openDismissModal(viewIssue)}
              >
                <XCircle size={16} />
                Dismiss
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}

      {approveModal && approvalIssue && (
        <div
          className="approve-confirm-overlay"
          onClick={closeApproveModal}
        >
          <section
            className="approve-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="approve-confirm-close"
              onClick={closeApproveModal}
              disabled={processingId !== null}
              aria-label="Close approval confirmation"
            >
              <X size={19} />
            </button>

            <div className="approve-confirm-icon">
              <ShieldCheck size={29} />
            </div>

            <span className="approve-confirm-eyebrow">
              MODERATION DECISION
            </span>

            <h2 id="approve-confirm-title">Approve this issue?</h2>

            <p className="approve-confirm-description">
              You are about to approve the following community report.
              Once approved, it can appear in the public issues feed.
            </p>

            <div className="approve-confirm-issue">
              <div className="approve-confirm-issue-icon">
                <FileText size={19} />
              </div>

              <div>
                <strong>
                  {approvalIssue.title || "Untitled Issue"}
                </strong>

                <span>
                  {approvalIssue.category || "Other"}
                  {" · "}
                  {approvalIssue.location || "Location not provided"}
                </span>
              </div>
            </div>

            <div className="approve-confirm-notice">
              <AlertTriangle size={16} />
              <span>
                Please ensure this report follows the community guidelines.
              </span>
            </div>

            <div className="approve-confirm-actions">
              <button
                type="button"
                className="approve-confirm-cancel"
                onClick={closeApproveModal}
                disabled={processingId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="approve-confirm-submit"
                onClick={confirmApprove}
                disabled={processingId !== null}
              >
                <CheckCircle2 size={17} />
                {processingId === approvalIssue._id
                  ? "Approving..."
                  : "Yes, Approve Issue"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* DISMISS MODAL */}

      {dismissModal && selectedIssue && (
        <div
          className="dismiss-modal-overlay"
          onClick={closeDismissModal}
        >
          <section
            className="dismiss-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dismiss-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dismiss-modal-icon">
              <XCircle size={24} />
            </div>

            <h2 id="dismiss-modal-title">Dismiss Issue</h2>

            <p>
              Please provide a reason for dismissing this report.
            </p>

            <textarea
              value={dismissReason}
              onChange={(event) => setDismissReason(event.target.value)}
              placeholder="Enter dismissal reason..."
              rows={4}
              disabled={processingId === selectedIssue._id}
            />

            <div className="dismiss-modal-actions">
              <button
                type="button"
                className="cancel-dismiss-button"
                onClick={closeDismissModal}
                disabled={processingId === selectedIssue._id}
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
                onClick={handleDismiss}
              >
                <XCircle size={16} />
                {processingId === selectedIssue._id
                  ? "Processing..."
                  : "Dismiss Issue"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PendingIssues;