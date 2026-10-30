
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Search,
    X,
    SlidersHorizontal,
    ArrowUpDown,
    RotateCcw,
    LayoutGrid,
    List,
    Flag,
    ChevronDown,
    Check,
    TrendingUp,
    Clock3,
    MessageCircle,
    Users,
    Sparkles,
    CircleAlert,
} from "lucide-react";

import IssueCard from "../issue/issueCard";

import "./explore.css";

function Explore({
    issues = [],
    total = 0,
    search,
    setSearch,
    category,
    setCategory,
    location,
    setLocation,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setView,
    resetFilters,
    categories = [],
    locations = [],
    statusCounts = {},
    loading,
    error,
    votingIds = [],
    onVote,
    onToggleSave,
    savingIds = [],
    onRetry,
}) {
    const navigate = useNavigate();

    const [sortOpen, setSortOpen] = useState(false);
    const [commentCountOverrides, setCommentCountOverrides] = useState({});
    const searchRef = useRef(null);

    // Keep the latest comment count for each issue without refetching issues.
    const handleCommentCountChange = useCallback((issueId, count) => {
        if (!issueId || !Number.isFinite(count)) return;

        setCommentCountOverrides((previous) => ({
            ...previous,
            [String(issueId)]: Math.max(0, count),
        }));
    }, []);

    const getCommentCount = useCallback(
        (issue) => {
            const issueId = String(issue?._id || "");

            if (
                issueId &&
                Object.prototype.hasOwnProperty.call(
                    commentCountOverrides,
                    issueId
                )
            ) {
                return commentCountOverrides[issueId];
            }

            if (typeof issue?.commentCount === "number") {
                return issue.commentCount;
            }

            if (typeof issue?.commentsCount === "number") {
                return issue.commentsCount;
            }

            if (Array.isArray(issue?.comments)) {
                return issue.comments.length;
            }

            return 0;
        },
        [commentCountOverrides]
    );

    useEffect(() => {
        const handleKeyboard = (event) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();
                searchRef.current?.focus();
            }

            if (event.key === "Escape") {
                setSortOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyboard);

        return () => {
            window.removeEventListener("keydown", handleKeyboard);
        };
    }, []);

    const sortOptions = [
        {
            value: "most-upvoted",
            label: "Most Upvoted",
            icon: TrendingUp,
        },
        {
            value: "newest",
            label: "Newest First",
            icon: Clock3,
        },
        {
            value: "most-downvoted",
            label: "Most Downvoted",
            icon: ArrowUpDown,
        },
    ];

    const selectedSort =
        sortOptions.find((option) => option.value === sort) ||
        sortOptions[0];

    const activeFilters = useMemo(() => {
        const filters = [];

        if (search.trim()) {
            filters.push({
                type: "search",
                label: `"${search.trim()}"`,
            });
        }

        if (category !== "all") {
            filters.push({
                type: "category",
                label: category,
            });
        }

        if (location !== "all") {
            filters.push({
                type: "location",
                label: location,
            });
        }

        if (status !== "all") {
            filters.push({
                type: "status",
                label: status,
            });
        }

        return filters;
    }, [search, category, location, status]);

    const clearFilter = (type) => {
        if (type === "search") setSearch("");
        if (type === "category") setCategory("all");
        if (type === "location") setLocation("all");
        if (type === "status") setStatus("all");
    };

    const totalVotes = issues.reduce(
        (totalValue, issue) =>
            totalValue + Number(issue.upvotes || 0),
        0
    );

    const totalComments = issues.reduce(
        (totalValue, issue) =>
            totalValue + getCommentCount(issue),
        0
    );

    const handleViewIssue = (issue) => {
        if (!issue?._id) return;

        navigate(`/issue/${issue._id}`);
    };

    const handleReport = () => {
        navigate("/report");
    };

    return (
        <main className="explore-page">
            <section className="explore-header">
                <div className="explore-title-area">
                    <div className="breadcrumb">
                        <span>Community Voice</span>
                        <span>/</span>
                        <strong>Explore Community Issues</strong>
                    </div>

                    <div className="explore-title-row">
                        <div>
                            <h1>Explore Community Issues</h1>

                            <p className="explore-subtitle">
                                Discover local problems, support important
                                issues, and make your voice count.
                            </p>
                        </div>

                        <div className="explore-title-badge">
                            <Sparkles size={15} />
                            <span>Community Powered</span>
                        </div>
                    </div>
                </div>

                <div className="explore-header-actions">
                    <div className="view-toggle">
                        <button
                            type="button"
                            className={`view-button ${
                                view === "grid" ? "active" : ""
                            }`}
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid size={15} />
                            Grid
                        </button>

                        <button
                            type="button"
                            className={`view-button ${
                                view === "compact" ? "active" : ""
                            }`}
                            onClick={() => setView("compact")}
                        >
                            <List size={15} />
                            Compact
                        </button>
                    </div>

                    <button
                        type="button"
                        className="header-report-button"
                        onClick={handleReport}
                    >
                        <Flag size={16} />
                        Report Issue
                    </button>
                </div>
            </section>

            <section className="explore-stat-strip">
                <div className="explore-stat-item">
                    <div className="explore-stat-icon blue">
                        <CircleAlert size={17} />
                    </div>
                    <div>
                        <strong>{total}</strong>
                        <span>Public Issues</span>
                    </div>
                </div>

                <div className="explore-stat-item">
                    <div className="explore-stat-icon green">
                        <TrendingUp size={17} />
                    </div>
                    <div>
                        <strong>{totalVotes}</strong>
                        <span>Community Votes</span>
                    </div>
                </div>

                <div className="explore-stat-item">
                    <div className="explore-stat-icon purple">
                        <MessageCircle size={17} />
                    </div>
                    <div>
                        <strong>{totalComments}</strong>
                        <span>Discussions</span>
                    </div>
                </div>

                <div className="explore-stat-item">
                    <div className="explore-stat-icon orange">
                        <Users size={17} />
                    </div>
                    <div>
                        <strong>{statusCounts.resolved || 0}</strong>
                        <span>Resolved</span>
                    </div>
                </div>
            </section>

            <section className="filter-panel">
                <div className="filter-top-row">
                    <div className="large-search">
                        <Search size={18} />

                        <input
                            ref={searchRef}
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search issues, locations, categories..."
                        />

                        {search && (
                            <button
                                type="button"
                                className="search-clear"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {!search && (
                            <span className="search-shortcut">Ctrl K</span>
                        )}
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                        >
                            <option value="all">All Categories</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={location}
                            onChange={(event) =>
                                setLocation(event.target.value)
                            }
                        >
                            <option value="all">All Locations</option>
                            {locations.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-select-wrapper">
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                        >
                            <option value="all">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="reviewing">Under Review</option>
                            <option value="inProgress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <div className="sort-wrapper">
                        <button
                            type="button"
                            className="sort-button"
                            onClick={() =>
                                setSortOpen((previous) => !previous)
                            }
                        >
                            <ArrowUpDown size={15} />
                            <span>{selectedSort.label}</span>
                            <ChevronDown
                                size={14}
                                className={sortOpen ? "rotate" : ""}
                            />
                        </button>

                        {sortOpen && (
                            <div className="sort-dropdown">
                                {sortOptions.map((option) => {
                                    const Icon = option.icon;

                                    return (
                                        <button
                                            type="button"
                                            key={option.value}
                                            className={`sort-option ${
                                                sort === option.value
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                setSort(option.value);
                                                setSortOpen(false);
                                            }}
                                        >
                                            <span>
                                                <Icon size={14} />
                                                {option.label}
                                            </span>

                                            {sort === option.value && (
                                                <Check size={14} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="reset-button"
                        onClick={resetFilters}
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>

                <div className="filter-bottom-row">
                    <div className="active-filters">
                        <span className="active-label">FILTERS</span>

                        {activeFilters.length === 0 ? (
                            <span className="no-active-filters">
                                All community issues
                            </span>
                        ) : (
                            activeFilters.map((filter) => (
                                <button
                                    type="button"
                                    className="active-filter-chip"
                                    key={`${filter.type}-${filter.label}`}
                                    onClick={() => clearFilter(filter.type)}
                                >
                                    {filter.label}
                                    <X size={12} />
                                </button>
                            ))
                        )}
                    </div>

                    <span className="filter-result-note">
                        Showing approved community issues
                    </span>
                </div>
            </section>

            <section className="results-summary">
                <div className="results-left">
                    <strong>
                        {issues.length}{" "}
                        {issues.length === 1 ? "Issue" : "Issues"} Found
                    </strong>
                    <span className="radius-badge">Community-wide</span>
                </div>

                <div className="results-status">
                    <span className="progress-label">Community Progress</span>

                    <span className="status-summary submitted">
                        <i />
                        {statusCounts.submitted || 0} Submitted
                    </span>

                    <span className="status-summary orange">
                        <i />
                        {statusCounts.inProgress || 0} In Progress
                    </span>

                    <span className="status-summary blue">
                        <i />
                        {statusCounts.reviewing || 0} Under Review
                    </span>

                    <span className="status-summary green">
                        <i />
                        {statusCounts.resolved || 0} Resolved
                    </span>
                </div>
            </section>

            {error ? (
                <section className="explore-message">
                    <div className="message-icon error">
                        <CircleAlert size={22} />
                    </div>
                    <h3>Unable to load issues</h3>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="retry-button"
                        onClick={onRetry}
                    >
                        <RotateCcw size={15} />
                        Try Again
                    </button>
                </section>
            ) : loading ? (
                <section className="explore-message">
                    <div className="loading-spinner" />
                    <h3>Loading community issues</h3>
                    <p>Fetching the latest approved issues...</p>
                </section>
            ) : issues.length === 0 ? (
                <section className="explore-message">
                    <div className="message-icon">
                        <Search size={22} />
                    </div>
                    <h3>No issues found</h3>
                    <p>
                        Try changing your filters or search for something else.
                    </p>
                    <button
                        type="button"
                        className="retry-button"
                        onClick={resetFilters}
                    >
                        <RotateCcw size={15} />
                        Clear Filters
                    </button>
                </section>
            ) : (
                <section
                    className={`issues-grid ${
                        view === "compact" ? "compact-view" : ""
                    }`}
                >
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            commentCount={getCommentCount(issue)}
                            onCommentCountChange={(count) =>
                                handleCommentCountChange(issue._id, count)
                            }
                            onVote={onVote}
                            voting={votingIds.includes(issue._id)}
                            onView={handleViewIssue}
                            onToggleSave={onToggleSave}
                            isSaved={Boolean(issue.isSaved)}
                            saving={savingIds.includes(String(issue._id))}
                        />
                    ))}
                </section>
            )}
        </main>
    );
}

export default Explore;
