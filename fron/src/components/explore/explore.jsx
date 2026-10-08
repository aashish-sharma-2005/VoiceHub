import { useState } from "react";
import {
    Search,
    ChevronDown,
    ArrowUpDown,
    RotateCcw,
    Navigation,
    CircleAlert,
    Wrench,
    Trash2,
    CheckCircle2,
} from "lucide-react";

import IssueCard from "../issue/issueCard";

function Explore({
    issues,
    total,
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
    categories,
    locations,
    statusCounts,
}) {

    const [sortOpen, setSortOpen] = useState(false);

    return (
        <div className="explore-page">

            <div className="explore-header">

                <div>

                    <div className="breadcrumb">
                        <span>Community Voice</span>
                        <span>›</span>
                        <span>Explore Community Issues</span>
                        <span>›</span>
                        <span>Metro Region</span>
                    </div>

                    <h1>Explore Community Issues</h1>

                </div>

                <div className="explore-header-actions">

                    <div className="view-toggle">

                        <button
                            type="button"
                            className={`view-button ${view === "grid" ? "active" : ""}`}
                            onClick={() => setView("grid")}
                        >
                            ▦ Grid
                        </button>

                        <button
                            type="button"
                            className={`view-button ${view === "compact" ? "active" : ""}`}
                            onClick={() => setView("compact")}
                        >
                            ☰ Compact
                        </button>

                    </div>

                    <button
                        type="button"
                        className="header-report-button"
                    >
                        ⚑ Report Issue
                    </button>

                </div>

            </div>

            <div className="explore-intro">
                Discover problems reported by people around you and make your voice count.
            </div>

            <section className="filter-panel">

                <div className="filter-row">

                    <div className="large-search">

                        <Search size={19} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search problems, locations or categories..."
                        />

                        <span className="search-shortcut">
                            ⌘K
                        </span>

                    </div>

                    {/* Category */}

                    <div className="filter-select-wrapper">

                        <select
                            className="filter-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="all">
                                All Categories
                            </option>

                            {categories.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Location */}

                    <div className="filter-select-wrapper">

                        <select
                            className="filter-select"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <option value="all">
                                All Locations
                            </option>

                            {locations.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Status */}

                    <div className="filter-select-wrapper small">

                        <select
                            className="filter-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="all">
                                All Statuses
                            </option>

                            <option value="in-progress">
                                In Progress
                            </option>

                            <option value="reviewing">
                                Reviewing
                            </option>

                            <option value="resolved">
                                Resolved
                            </option>

                        </select>

                    </div>

                    {/* Sort */}

                    <div className="sort-dropdown">

                        <button
                            type="button"
                            className="filter-select sort"
                            onClick={() => setSortOpen((prev) => !prev)}
                        >

                            <span>
                                {sort === "most-upvoted"
                                    ? "Most Upvoted"
                                    : "Most Recent"}
                            </span>

                            <ArrowUpDown size={15} />

                            <ChevronDown
                                size={15}
                                className={
                                    sortOpen
                                        ? "sort-arrow-open"
                                        : ""
                                }
                            />

                        </button>

                        {sortOpen && (

                            <div className="sort-menu">

                                <button
                                    type="button"
                                    className={`sort-option ${
                                        sort === "most-upvoted"
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSort("most-upvoted");
                                        setSortOpen(false);
                                    }}
                                >

                                    <span>
                                        Most Upvoted
                                    </span>

                                    {sort === "most-upvoted" && (
                                        <span className="sort-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                                <button
                                    type="button"
                                    className={`sort-option ${
                                        sort === "newest"
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSort("newest");
                                        setSortOpen(false);
                                    }}
                                >

                                    <span>
                                        Most Recent
                                    </span>

                                    {sort === "newest" && (
                                        <span className="sort-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            </div>

                        )}

                    </div>

                    {/* Reset */}

                    <button
                        type="button"
                        className="reset-button"
                        onClick={resetFilters}
                    >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                    </button>

                </div>

                {/* Active Filters */}

                <div className="active-filter-row">

                    <span className="active-label">
                        ACTIVE:
                    </span>

                    {category !== "all" && (
                        <span className="filter-chip">
                            Category: {category} ×
                        </span>
                    )}

                    {location !== "all" && (
                        <span className="filter-chip">
                            Location: {location} ×
                        </span>
                    )}

                    {status !== "all" && (
                        <span className="filter-chip">
                            Status: {status} ×
                        </span>
                    )}

                    {search && (
                        <span className="filter-chip">
                            Search: {search} ×
                        </span>
                    )}

                    {!search &&
                        category === "all" &&
                        location === "all" &&
                        status === "all" && (
                            <span className="filter-chip">
                                Radius: 5 km
                            </span>
                        )}

                    <span className="realtime-text">
                        Showing real-time community records
                    </span>

                </div>

            </section>

            {/* Results Summary */}

            <section className="results-summary">

                <div className="results-left">

                    <strong>
                        {total} Issues Found
                    </strong>

                    <span className="radius-badge">
                        Within 5km radius
                    </span>

                </div>

                <div className="results-status">

                    <span>
                        Filter summary:
                    </span>

                    <span className="status-summary orange">
                        ● {statusCounts.inProgress} In Progress
                    </span>

                    <span className="status-summary blue">
                        ● {statusCounts.reviewing} Reviewing
                    </span>

                    <span className="status-summary green">
                        ● {statusCounts.resolved} Resolved
                    </span>

                </div>

            </section>

            {/* Content */}

            <section className="explore-content">

                <div
                    className={
                        view === "compact"
                            ? "issues-grid compact-view"
                            : "issues-grid"
                    }
                >

                    {issues.length > 0 ? (

                        issues.map((issue) => (
                            <IssueCard
                                key={issue._id}
                                issue={issue}
                            />
                        ))

                    ) : (

                        <div className="no-issues">

                            <h3>
                                No issues found
                            </h3>

                            <p>
                                Try changing your search or filters.
                            </p>

                        </div>

                    )}

                </div>

                {/* Nearby Issues */}

                <div className="nearby-panel">

                    <div className="nearby-header">

                        <div>

                            <h2>
                                Issues Near You
                            </h2>

                            <p>
                                Live civic geospatial radar
                            </p>

                        </div>

                        <span className="radius-control">

                            <Navigation size={13} />

                            Radius: 5km

                        </span>

                    </div>

                    <div className="radar">

                        <div className="radar-circle circle-one"></div>

                        <div className="radar-circle circle-two"></div>

                        <div className="radar-circle circle-three"></div>

                        <div className="radar-marker center">
                            ●
                        </div>

                        <div className="radar-marker green-marker">
                            <CheckCircle2 size={17} />
                        </div>

                        <div className="radar-marker orange-marker">
                            <CircleAlert size={16} />
                        </div>

                        <div className="radar-marker orange-marker-two">
                            <CircleAlert size={16} />
                        </div>

                        <div className="radar-marker blue-marker">
                            <Wrench size={15} />
                        </div>

                        <div className="radar-marker purple-marker">
                            <Trash2 size={15} />
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default Explore;