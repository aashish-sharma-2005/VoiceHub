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
  Check,
  X,
  Eye,
  Clock3,
} from "lucide-react";

import "./IssueManagement.css";

function IssueManagement() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // Fetch Issues
  // =========================

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/issues/manage",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setIssues(data.issues);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // =========================
  // Search
  // =========================

  const filteredIssues = issues.filter((issue) => {
    const searchText = search.toLowerCase();

    return (
      issue.title?.toLowerCase().includes(searchText) ||
      issue.category?.toLowerCase().includes(searchText) ||
      issue.location?.toLowerCase().includes(searchText) ||
      issue.createdBy?.name?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // Date Format
  // =========================

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // Status Class
  // =========================

  const getStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Dismissed") return "status-dismissed";

    return "status-pending";
  };

  return (
    <div className="issue-management">

      {/* =========================
          HEADER
      ========================= */}

      <div className="issue-page-header">
        <div>
          <h1>Issue Reports</h1>

          <p>
            Review and manage community issues reported by users.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchIssues}
          disabled={loading}
        >
          <RefreshCw size={17} />

          Refresh
        </button>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="issue-toolbar">

        <div className="issue-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="issue-count">
          {filteredIssues.length} Issues
        </div>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="issue-empty">
          <RefreshCw size={25} className="loading-icon" />

          <p>Loading issues...</p>
        </div>
      )}

      {/* =========================
          NO ISSUES
      ========================= */}

      {!loading && filteredIssues.length === 0 && (
        <div className="issue-empty">
          <MessageCircle size={35} />

          <h3>No issues found</h3>

          <p>
            There are no issues matching your search.
          </p>
        </div>
      )}

      {/* =========================
          ISSUE CARDS
      ========================= */}

      {!loading &&
        filteredIssues.map((issue) => {

          const firstImage =
            issue.images?.length > 0
              ? issue.images[0].url
              : null;

          return (
            <div className="issue-card" key={issue._id}>

              {/* IMAGE */}

              <div className="issue-image-wrapper">

                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={issue.title}
                    className="issue-image"
                  />
                ) : (
                  <div className="issue-image-placeholder">
                    <MessageCircle size={30} />
                  </div>
                )}

              </div>

              {/* CONTENT */}

              <div className="issue-content">

                <div className="issue-top">

                  <div>

                    <div className="issue-title-row">

                      <h2>{issue.title}</h2>

                      <span
                        className={`issue-status ${getStatusClass(
                          issue.moderationStatus
                        )}`}
                      >
                        {issue.moderationStatus}
                      </span>

                    </div>

                    <span className="issue-category">
                      {issue.category}
                    </span>

                  </div>

                </div>

                {/* META */}

                <div className="issue-meta">

                  <div>
                    <MapPin size={15} />
                    <span>{issue.location}</span>
                  </div>

                  <div>
                    <UserRound size={15} />

                    <span>
                      {issue.createdBy?.name || "Unknown User"}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={15} />

                    <span>
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>

                </div>

                {/* DESCRIPTION */}

                <p className="issue-description">
                  {issue.description}
                </p>

                {/* STATS */}

                <div className="issue-stats">

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

                {/* ACTIONS */}

                <div className="issue-actions">

                  <button className="view-button">
                    <Eye size={16} />
                    View
                  </button>

                  {issue.moderationStatus === "Pending" && (
                    <>
                      <button className="approve-button">
                        <Check size={16} />
                        Approve
                      </button>

                      <button className="dismiss-button">
                        <X size={16} />
                        Dismiss
                      </button>
                    </>
                  )}

                  {issue.moderationStatus === "Approved" && (
                    <button className="review-button">
                      <Clock3 size={16} />
                      Under Review
                    </button>
                  )}

                </div>

              </div>

            </div>
          );
        })}

    </div>
  );
}

export default IssueManagement;