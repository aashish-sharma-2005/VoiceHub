
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Search,
    MapPin,
    FileText,
    LoaderCircle,
    ChevronDown,
} from "lucide-react";

import {
    getIssueStatusManagement,
    updateIssueProgressStatus,
} from "../../services/issueService";

import "./AdminIssueStatus.css";

const PROGRESS_STATUSES = [
    "Submitted",
    "Under Review",
    "In Progress",
    "Resolved",
];

const getIssueId = (issue) => issue?._id || issue?.id;

const getStatusClass = (status = "") =>
    status.toLowerCase().replace(/\s+/g, "-");

function AdminIssueStatus() {
    const [issues, setIssues] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        underReview: 0,
        inProgress: 0,
        resolved: 0,
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [pageError, setPageError] = useState("");

    const loadIssues = useCallback(async (showToast = false) => {
        setLoading(true);
        setPageError("");

        try {
            const data = await getIssueStatusManagement();

            const issueList = Array.isArray(data.issues)
                ? data.issues
                : [];

            setIssues(issueList);

            if (data.stats) {
                setStats(data.stats);
            } else {
                setStats({
                    total: issueList.length,
                    submitted: issueList.filter(
                        (issue) => issue.status === "Submitted"
                    ).length,
                    underReview: issueList.filter(
                        (issue) => issue.status === "Under Review"
                    ).length,
                    inProgress: issueList.filter(
                        (issue) => issue.status === "In Progress"
                    ).length,
                    resolved: issueList.filter(
                        (issue) => issue.status === "Resolved"
                    ).length,
                });
            }

            if (showToast) {
                toast.success("Issue statuses refreshed.");
            }
        } catch (error) {
            setPageError(error.message || "Failed to load issue statuses.");
            if (showToast) {
                toast.error(error.message || "Failed to refresh issues.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadIssues();
    }, [loadIssues]);

    const filteredIssues = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return issues.filter((issue) => {
            const matchesSearch =
                !searchText ||
                issue.title?.toLowerCase().includes(searchText) ||
                issue.category?.toLowerCase().includes(searchText) ||
                issue.location?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "All" || issue.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [issues, search, statusFilter]);

    const handleStatusChange = async (issue, newStatus) => {
        const issueId = getIssueId(issue);

        if (!issueId || newStatus === issue.status) {
            return;
        }

        setUpdatingId(issueId);

        try {
            const data = await updateIssueProgressStatus(issueId, newStatus);

            setIssues((currentIssues) =>
                currentIssues.map((item) =>
                    getIssueId(item) === issueId
                        ? { ...item, status: data.issue?.status || newStatus }
                        : item
                )
            );

            toast.success(data.message || "Issue progress updated.");

            // Reload statistics after a successful update.
            await loadIssues();
        } catch (error) {
            toast.error(error.message || "Failed to update issue status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const summaryCards = [
        {
            label: "Total Approved Issues",
            value: stats.total ?? issues.length,
            icon: FileText,
            className: "total",
        },
        {
            label: "Submitted",
            value: stats.submitted ?? 0,
            icon: Clock3,
            className: "submitted",
        },
        {
            label: "Under Review",
            value: stats.underReview ?? 0,
            icon: AlertCircle,
            className: "review",
        },
        {
            label: "In Progress",
            value: stats.inProgress ?? 0,
            icon: Activity,
            className: "progress",
        },
        {
            label: "Resolved",
            value: stats.resolved ?? 0,
            icon: CheckCircle2,
            className: "resolved",
        },
    ];

    return (
        <main className="admin-status-page">
            <header className="admin-status-header">
                <div>
                    <span className="admin-status-eyebrow">
                        ADMINISTRATION / ISSUE TRACKING
                    </span>
                    <h1>Issue Status Management</h1>
                    <p>
                        Track approved community issues and update their
                        progress until they are resolved.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-status-refresh"
                    onClick={() => loadIssues(true)}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "admin-status-spinning" : ""}
                    />
                    Refresh
                </button>
            </header>

            <section className="admin-status-stats">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            className="admin-status-stat-card"
                            key={card.label}
                        >
                            <div
                                className={`admin-status-stat-icon ${card.className}`}
                            >
                                <Icon size={21} />
                            </div>
                            <div className="admin-status-stat-content">
                                <span>{card.label}</span>
                                <strong>{card.value}</strong>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="admin-status-content">
                <div className="admin-status-section-heading">
                    <div>
                        <h2>Community Issues</h2>
                        <p>
                            Manage progress for issues that have been approved
                            by a moderator.
                        </p>
                    </div>

                    <span className="admin-status-count">
                        {filteredIssues.length} issues
                    </span>
                </div>

                <div className="admin-status-toolbar">
                    <div className="admin-status-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Search title, category or location..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search issues"
                        />
                    </div>

                    <div className="admin-status-filter">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Filter by progress status"
                        >
                            <option value="All">All progress statuses</option>
                            {PROGRESS_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                {pageError && (
                    <div className="admin-status-error">
                        <AlertCircle size={19} />
                        <div>
                            <strong>Unable to load issues</strong>
                            <p>{pageError}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => loadIssues(true)}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="admin-status-state">
                        <LoaderCircle
                            size={30}
                            className="admin-status-spinning"
                        />
                        <p>Loading issue statuses...</p>
                    </div>
                ) : !pageError && filteredIssues.length === 0 ? (
                    <div className="admin-status-state">
                        <FileText size={34} />
                        <h3>No issues found</h3>
                        <p>
                            {issues.length === 0
                                ? "There are no approved issues to manage yet."
                                : "Try changing your search or status filter."}
                        </p>
                        {(search || statusFilter !== "All") && (
                            <button
                                type="button"
                                className="admin-status-clear"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("All");
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : !pageError ? (
                    <div className="admin-status-table-wrapper">
                        <table className="admin-status-table">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Progress</th>
                                    <th>Update status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredIssues.map((issue) => {
                                    const issueId = getIssueId(issue);
                                    const isUpdating = updatingId === issueId;

                                    return (
                                        <tr key={issueId}>
                                            <td>
                                                <div className="admin-status-issue-cell">
                                                    {issue.images?.[0]?.url ? (
                                                        <img
                                                            src={issue.images[0].url}
                                                            alt=""
                                                            className="admin-status-issue-image"
                                                        />
                                                    ) : (
                                                        <div className="admin-status-issue-placeholder">
                                                            <FileText size={20} />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>
                                                            {issue.title || "Untitled issue"}
                                                        </strong>
                                                        <span>
                                                            {issue.createdBy?.name ||
                                                                "Community member"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="admin-status-category">
                                                    {issue.category || "Other"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="admin-status-location">
                                                    <MapPin size={14} />
                                                    {issue.location || "Not specified"}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-status-badge ${getStatusClass(issue.status)}`}
                                                >
                                                    {issue.status || "Submitted"}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="admin-status-select-wrapper">
                                                    <select
                                                        value={issue.status || "Submitted"}
                                                        disabled={isUpdating}
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                issue,
                                                                event.target.value
                                                            )
                                                        }
                                                        aria-label={`Update status for ${issue.title}`}
                                                    >
                                                        {PROGRESS_STATUSES.map(
                                                            (status) => (
                                                                <option
                                                                    key={status}
                                                                    value={status}
                                                                >
                                                                    {status}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                    {isUpdating && (
                                                        <LoaderCircle
                                                            size={16}
                                                            className="admin-status-spinning"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {!loading && !pageError && filteredIssues.length > 0 && (
                    <footer className="admin-status-footer">
                        Showing {filteredIssues.length} of {issues.length}{" "}
                        approved issues
                    </footer>
                )}
            </section>
        </main>
    );
}

export default AdminIssueStatus;
