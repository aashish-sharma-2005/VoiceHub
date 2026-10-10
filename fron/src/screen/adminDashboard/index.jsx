
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Users,
    ClipboardList,
    Clock3,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Eye,
    Plus,
    ShieldCheck,
    UserCog,
    AlertCircle,
    TrendingUp,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

import { getAdminDashboardData } from "../../services/dashboardServices";
import "./AdminDashboard.css";

const EMPTY_STATS = {
    totalUsers: 0,
    totalIssues: 0,
    pendingReviews: 0,
    resolvedIssues: 0,
};

function StatusBadge({ status, type }) {
    const normalizedStatus = String(status || "Unknown")
        .toLowerCase()
        .replace(/\s+/g, "-");

    return (
        <span
            className={`admin-status-badge ${type}-${normalizedStatus}`}
        >
            <span className="admin-status-dot" />
            {status || "Unknown"}
        </span>
    );
}

function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function AdminDashboard() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState(EMPTY_STATS);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminDashboardData();

            setStats({
                ...EMPTY_STATS,
                ...data.stats,
            });

            setIssues(
                Array.isArray(data.recentIssues)
                    ? data.recentIssues
                    : []
            );
        } catch (err) {
            setError(
                err.message || "Unable to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const filteredIssues = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return issues;

        return issues.filter((issue) => {
            const submittedBy =
                typeof issue.createdBy === "object"
                    ? issue.createdBy?.name || ""
                    : "";

            return [
                issue.title,
                issue.category,
                submittedBy,
                issue.moderationStatus,
                issue.status,
                issue.location,
            ].some((value) =>
                String(value || "").toLowerCase().includes(search)
            );
        });
    }, [issues, searchTerm]);

    const statistics = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            description: "Registered community members",
            icon: Users,
            className: "users",
        },
        {
            title: "Total Issues",
            value: stats.totalIssues,
            description: "All reported issues",
            icon: ClipboardList,
            className: "issues",
        },
        {
            title: "Pending Reviews",
            value: stats.pendingReviews,
            description: "Waiting for moderation",
            icon: Clock3,
            className: "pending",
        },
        {
            title: "Resolved Issues",
            value: stats.resolvedIssues,
            description: "Approved and successfully resolved",
            icon: CheckCircle2,
            className: "resolved",
        },
    ];

    const pendingCount = stats.pendingReviews;

    // A visual indicator only; it is not a completion percentage.
    const reviewBarWidth =
        stats.totalIssues > 0
            ? Math.min(
                  100,
                  (pendingCount / stats.totalIssues) * 100
              )
            : 0;

    return (
        <main className="admin-dashboard">
            {/* Page heading */}
            <div className="admin-page-heading">
                <div>
                    <div className="admin-breadcrumb">
                        <span>Home</span>
                        <ChevronRight size={14} />
                        <span className="admin-breadcrumb-current">
                            Dashboard
                        </span>
                    </div>

                    <h1>Dashboard</h1>

                    <p>
                        Monitor community activity and manage reported issues.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-primary-button"
                    onClick={() => navigate("/admin/issues")}
                >
                    <ClipboardList size={17} />
                    Manage Issues
                </button>
            </div>

            {/* Welcome section */}
            <section className="admin-welcome">
                <div className="admin-welcome-content">
                    <span className="admin-eyebrow">
                        ADMIN OVERVIEW
                    </span>

                    <h2>Welcome back, Admin!</h2>

                    <p>
                        Here's what's happening in your community today.
                        Review reports and help make your community better.
                    </p>
                </div>

                <div className="admin-welcome-icon">
                    <ShieldCheck size={40} strokeWidth={1.6} />
                </div>
            </section>

            {/* Loading and error messages */}
            {error && (
                <div
                    role="alert"
                    style={{
                        padding: "14px 16px",
                        marginBottom: "20px",
                        border: "1px solid #f1cccc",
                        borderRadius: "9px",
                        background: "#fff5f5",
                        color: "#a83232",
                        fontSize: "13px",
                    }}
                >
                    <p style={{ margin: "0 0 10px" }}>{error}</p>

                    <button
                        type="button"
                        className="admin-primary-button"
                        onClick={loadDashboard}
                    >
                        <RefreshCw size={15} />
                        Try Again
                    </button>
                </div>
            )}

            {/* Statistics */}
            <section className="admin-stats-grid">
                {statistics.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className="admin-stat-card"
                            key={stat.title}
                        >
                            <div className="admin-stat-top">
                                <div
                                    className={`admin-stat-icon ${stat.className}`}
                                >
                                    <Icon size={21} />
                                </div>

                                <span className="admin-stat-label">
                                    {stat.title}
                                </span>
                            </div>

                            <h3>
                                {loading
                                    ? "—"
                                    : Number(stat.value).toLocaleString("en-IN")}
                            </h3>

                            <p>{stat.description}</p>
                        </article>
                    );
                })}
            </section>

            {/* Main dashboard content */}
            <div className="admin-dashboard-grid">
                <section className="admin-panel admin-recent-panel">
                    <div className="admin-panel-heading">
                        <div>
                            <h2>Recent Issues</h2>
                            <p>
                                Latest reports submitted by the community
                            </p>
                        </div>

                        <Link
                            to="/admin/issues"
                            className="admin-view-all"
                        >
                            View All
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="admin-table-toolbar">
                        <div className="admin-search">
                            <Search size={17} />

                            <input
                                type="search"
                                placeholder="Search issues, category or user..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                aria-label="Search recent issues"
                            />
                        </div>

                        <span className="admin-results-count">
                            {loading
                                ? "Loading..."
                                : `${filteredIssues.length} issues`}
                        </span>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-issues-table">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Submitted By</th>
                                    <th>Moderation</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="admin-empty-state"
                                        >
                                            Loading recent issues...
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    filteredIssues.map((issue) => {
                                        const submittedBy =
                                            issue.createdBy?.name ||
                                            "Unknown user";

                                        return (
                                            <tr key={issue._id}>
                                                <td>
                                                    <div className="admin-issue-title">
                                                        <strong>
                                                            {issue.title}
                                                        </strong>
                                                        <span>
                                                            {issue.category}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="admin-submitter">
                                                        {submittedBy}
                                                    </span>
                                                    <span className="admin-issue-date">
                                                        {formatDate(
                                                            issue.createdAt
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <StatusBadge
                                                        status={
                                                            issue.moderationStatus
                                                        }
                                                        type="moderation"
                                                    />
                                                </td>

                                                <td>
                                                    <StatusBadge
                                                        status={issue.status}
                                                        type="progress"
                                                    />
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="admin-view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                "/admin/issues"
                                                            )
                                                        }
                                                        title="Open issue management"
                                                        aria-label={`View ${issue.title}`}
                                                    >
                                                        <Eye size={17} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                {!loading &&
                                    !error &&
                                    filteredIssues.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="admin-empty-state"
                                            >
                                                <Search size={23} />
                                                <strong>
                                                    No issues found
                                                </strong>
                                                <span>
                                                    {issues.length === 0
                                                        ? "No reports have been submitted yet."
                                                        : "Try another search term."}
                                                </span>
                                            </td>
                                        </tr>
                                    )}

                                {!loading &&
                                    error &&
                                    issues.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="admin-empty-state"
                                            >
                                                Dashboard data could not be loaded.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    <div className="admin-table-footer">
                        {loading
                            ? "Fetching data from the server..."
                            : `Showing ${filteredIssues.length} of ${issues.length} recent issues`}
                    </div>
                </section>

                {/* Right column */}
                <aside className="admin-dashboard-side">
                    <section className="admin-panel admin-review-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h2>Needs Attention</h2>
                                <p>Moderation tasks</p>
                            </div>

                            <div className="admin-attention-icon">
                                <AlertCircle size={20} />
                            </div>
                        </div>

                        <div className="admin-review-count">
                            <strong>
                                {loading ? "—" : pendingCount}
                            </strong>
                            <span>issues awaiting review</span>
                        </div>

                        <div className="admin-review-progress">
                            <div>
                                <span>Review queue</span>
                                <strong>
                                    {loading
                                        ? "Loading"
                                        : `${pendingCount} pending`}
                                </strong>
                            </div>

                            <div className="admin-review-progress-track">
                                <span
                                    style={{
                                        width: `${reviewBarWidth}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <Link
                            to="/admin/pending"
                            className="admin-secondary-button"
                        >
                            Review Pending Issues
                            <ChevronRight size={17} />
                        </Link>
                    </section>

                    <section className="admin-panel admin-quick-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h2>Quick Actions</h2>
                                <p>Manage your platform</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="admin-quick-action"
                            onClick={() => navigate("/admin/issues")}
                        >
                            <span className="admin-quick-icon blue">
                                <ClipboardList size={19} />
                            </span>

                            <span className="admin-quick-text">
                                <strong>Manage Issues</strong>
                                <small>Review and update reports</small>
                            </span>

                            <ChevronRight size={18} />
                        </button>

                        <button
                            type="button"
                            className="admin-quick-action"
                            onClick={() => navigate("/admin/users")}
                        >
                            <span className="admin-quick-icon purple">
                                <Users size={19} />
                            </span>

                            <span className="admin-quick-text">
                                <strong>Manage Users</strong>
                                <small>Accounts and access</small>
                            </span>

                            <ChevronRight size={18} />
                        </button>

                        <button
                            type="button"
                            className="admin-quick-action"
                            onClick={() => navigate("/admin/moderators")}
                        >
                            <span className="admin-quick-icon orange">
                                <UserCog size={19} />
                            </span>

                            <span className="admin-quick-text">
                                <strong>Manage Moderators</strong>
                                <small>Moderator accounts and roles</small>
                            </span>

                            <ChevronRight size={18} />
                        </button>
                    </section>

                    <section className="admin-tip-card">
                        <div className="admin-tip-icon">
                            <TrendingUp size={20} />
                        </div>

                        <div>
                            <strong>Keep your community moving</strong>
                            <p>
                                Review pending reports regularly so genuine
                                local issues can reach the community.
                            </p>
                        </div>
                    </section>

                    <button
                        type="button"
                        className="admin-add-action"
                        onClick={() => navigate("/admin/issues")}
                    >
                        <Plus size={17} />
                        Open issue management
                    </button>
                </aside>
            </div>

            <footer className="admin-dashboard-footer">
                <span>VoiceHub Community Voice</span>
                <span>Admin workspace</span>
            </footer>
        </main>
    );
}

export default AdminDashboard;
