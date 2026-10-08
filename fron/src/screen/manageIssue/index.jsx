import { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    MapPin,
    Clock3,
    UserRound,
    CheckCircle2,
    XCircle,
    Eye,
    X,
    AlertCircle,
    CalendarDays,
    Tag,
    MessageCircle,
} from "lucide-react";

import {
    getManageIssues,
    approveIssue,
    dismissIssue,
} from "../../services/issueService";

import "./manageIssues.css";

function ManageIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState("all");

    const [selectedIssue, setSelectedIssue] =
        useState(null);

    const [dismissModal, setDismissModal] =
        useState(null);

    const [dismissReason, setDismissReason] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(null);

    /*
     * Fetch issues
     */
    const fetchIssues = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getManageIssues();

            setIssues(data.issues || []);
        } catch (err) {
            console.error(
                "Failed to fetch manage issues:",
                err
            );

            setError(
                err.message ||
                    "Failed to load issues."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    /*
     * Close modal with Escape
     */
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key !== "Escape") {
                return;
            }

            setSelectedIssue(null);
            setDismissModal(null);
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    /*
     * Lock body scroll when modal is open
     */
    useEffect(() => {
        if (
            selectedIssue ||
            dismissModal
        ) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow =
                "";
        }

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [
        selectedIssue,
        dismissModal,
    ]);

    /*
     * Categories
     */
    const categories = useMemo(() => {
        const values = issues
            .map((issue) => issue.category)
            .filter(Boolean);

        return [
            ...new Set(values),
        ];
    }, [issues]);

    /*
     * Filter issues
     */
    const filteredIssues = useMemo(() => {
        const searchValue =
            search
                .trim()
                .toLowerCase();

        return issues.filter((issue) => {
            const title =
                issue.title || "";

            const description =
                issue.description || "";

            const category =
                issue.category || "";

            const location =
                issue.location || "";

            const matchesSearch =
                !searchValue ||
                title
                    .toLowerCase()
                    .includes(searchValue) ||
                description
                    .toLowerCase()
                    .includes(searchValue) ||
                category
                    .toLowerCase()
                    .includes(searchValue) ||
                location
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCategory =
                categoryFilter === "all" ||
                category === categoryFilter;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        issues,
        search,
        categoryFilter,
    ]);

    /*
     * Format date
     */
    const formatDate = (date) => {
        if (!date) {
            return "Unknown date";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Unknown date";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /*
     * Get reporter name
     */
    const getReporterName = (
        issue
    ) => {
        return (
            issue.user?.name ||
            issue.reportedBy?.name ||
            issue.createdBy?.name ||
            issue.userName ||
            "Community User"
        );
    };

    /*
     * Get issue image
     */
    const getIssueImage = (
        issue
    ) => {
        return (
            issue.images?.[0]?.url ||
            issue.image ||
            "/images/default-issue.jpeg"
        );
    };

    /*
     * Handle approve
     */
    const handleApprove = async (
        issue
    ) => {
        if (!issue?._id) {
            return;
        }

        try {
            setActionLoading(
                issue._id
            );

            setError("");

            await approveIssue(
                issue._id
            );

            /*
             * Remove from current
             * pending/manage list.
             */
            setIssues((current) =>
                current.filter(
                    (item) =>
                        item._id !==
                        issue._id
                )
            );

            if (
                selectedIssue?._id ===
                issue._id
            ) {
                setSelectedIssue(null);
            }
        } catch (err) {
            console.error(
                "Approve issue error:",
                err
            );

            setError(
                err.message ||
                    "Failed to approve issue."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /*
     * Open dismiss modal
     */
    const openDismissModal = (
        issue
    ) => {
        setDismissReason("");

        setDismissModal(issue);
    };

    /*
     * Confirm dismiss
     */
    const handleDismiss = async () => {
        if (
            !dismissModal?._id
        ) {
            return;
        }

        const reason =
            dismissReason.trim();

        if (!reason) {
            setError(
                "Please enter a reason before dismissing the issue."
            );

            return;
        }

        try {
            setActionLoading(
                dismissModal._id
            );

            setError("");

            await dismissIssue(
                dismissModal._id,
                reason
            );

            setIssues((current) =>
                current.filter(
                    (item) =>
                        item._id !==
                        dismissModal._id
                )
            );

            if (
                selectedIssue?._id ===
                dismissModal._id
            ) {
                setSelectedIssue(null);
            }

            setDismissModal(null);
            setDismissReason("");
        } catch (err) {
            console.error(
                "Dismiss issue error:",
                err
            );

            setError(
                err.message ||
                    "Failed to dismiss issue."
            );
        } finally {
            setActionLoading(null);
        }
    };

    /*
     * Status
     */
    const getModerationStatus = (
        issue
    ) => {
        return (
            issue.moderationStatus ||
            issue.status ||
            "Pending"
        );
    };

    return (
        <div className="manage-issues-page">

            {/* HEADER */}
            <div className="manage-page-header">

                <div>
                    <div className="manage-eyebrow">
                        MODERATION CENTER
                    </div>

                    <h1>
                        Pending Reports
                    </h1>

                    <p>
                        Review community
                        reports before they
                        become visible to
                        everyone.
                    </p>
                </div>

                <button
                    type="button"
                    className="manage-refresh-btn"
                    onClick={() =>
                        fetchIssues(true)
                    }
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "spin"
                                : ""
                        }
                    />

                    <span>
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </span>
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="manage-error">
                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* FILTER BAR */}
            <div className="manage-toolbar">

                <div className="manage-search">
                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search reports, categories, locations..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <select
                    value={
                        categoryFilter
                    }
                    onChange={(event) =>
                        setCategoryFilter(
                            event.target.value
                        )
                    }
                    className="manage-category-select"
                >
                    <option value="all">
                        All Categories
                    </option>

                    {categories.map(
                        (category) => (
                            <option
                                key={
                                    category
                                }
                                value={
                                    category
                                }
                            >
                                {category}
                            </option>
                        )
                    )}
                </select>

                <div className="manage-count">
                    <span>
                        Showing
                    </span>

                    <strong>
                        {
                            filteredIssues.length
                        }
                    </strong>

                    <span>
                        reports
                    </span>
                </div>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="manage-loading">

                    <RefreshCw
                        size={28}
                        className="spin"
                    />

                    <p>
                        Loading reports...
                    </p>

                </div>
            ) : filteredIssues.length ===
              0 ? (
                <div className="manage-empty">

                    <div className="manage-empty-icon">
                        <CheckCircle2
                            size={30}
                        />
                    </div>

                    <h2>
                        No pending reports
                    </h2>

                    <p>
                        There are currently
                        no reports waiting
                        for moderation.
                    </p>

                </div>
            ) : (
                <div className="manage-issues-list">

                    {filteredIssues.map(
                        (issue) => {
                            const image =
                                getIssueImage(
                                    issue
                                );

                            const reporter =
                                getReporterName(
                                    issue
                                );

                            const status =
                                getModerationStatus(
                                    issue
                                );

                            const isProcessing =
                                actionLoading ===
                                issue._id;

                            return (
                                <article
                                    className="manage-issue-card"
                                    key={
                                        issue._id
                                    }
                                >

                                    {/* IMAGE */}
                                    <div className="manage-card-image">

                                        <img
                                            src={
                                                image
                                            }
                                            alt={
                                                issue.title ||
                                                "Issue"
                                            }
                                            onError={(
                                                event
                                            ) => {
                                                event.currentTarget.src =
                                                    "/images/default-issue.jpeg";
                                            }}
                                        />

                                        <div className="manage-status-badge">
                                            <Clock3
                                                size={
                                                    14
                                                }
                                            />

                                            {
                                                status
                                            }
                                        </div>

                                    </div>

                                    {/* CONTENT */}
                                    <div className="manage-card-content">

                                        <div className="manage-card-top">

                                            <span className="manage-category">
                                                <Tag
                                                    size={
                                                        13
                                                    }
                                                />

                                                {issue.category ||
                                                    "General"}
                                            </span>

                                            <span className="manage-reference">
                                                #
                                                {issue._id
                                                    ?.slice(
                                                        -6
                                                    )
                                                    .toUpperCase()}
                                            </span>

                                        </div>

                                        <h2>
                                            {issue.title ||
                                                "Untitled Issue"}
                                        </h2>

                                        <p className="manage-description">
                                            {issue.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="manage-meta">

                                            <span>
                                                <MapPin
                                                    size={
                                                        15
                                                    }
                                                />

                                                {issue.location ||
                                                    "Location not provided"}
                                            </span>

                                            <span>
                                                <UserRound
                                                    size={
                                                        15
                                                    }
                                                />

                                                {
                                                    reporter
                                                }
                                            </span>

                                            <span>
                                                <CalendarDays
                                                    size={
                                                        15
                                                    }
                                                />

                                                {formatDate(
                                                    issue.createdAt ||
                                                        issue.created_at
                                                )}
                                            </span>

                                        </div>

                                        <div className="manage-card-footer">

                                            <div className="manage-card-stats">

                                                <span>
                                                    <MessageCircle
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    {issue.comments?.length ||
                                                        issue.commentCount ||
                                                        0}{" "}
                                                    comments
                                                </span>

                                            </div>

                                            <div className="manage-actions">

                                                <button
                                                    type="button"
                                                    className="manage-view-btn"
                                                    onClick={() =>
                                                        setSelectedIssue(
                                                            issue
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    className="manage-approve-btn"
                                                    onClick={() =>
                                                        handleApprove(
                                                            issue
                                                        )
                                                    }
                                                    disabled={
                                                        isProcessing
                                                    }
                                                >
                                                    <CheckCircle2
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    {isProcessing
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="manage-dismiss-btn"
                                                    onClick={() =>
                                                        openDismissModal(
                                                            issue
                                                        )
                                                    }
                                                    disabled={
                                                        isProcessing
                                                    }
                                                >
                                                    <XCircle
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Dismiss
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>
            )}

            {/* DETAILS MODAL */}
            {selectedIssue && (
                <div
                    className="manage-modal-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedIssue(
                                null
                            );
                        }
                    }}
                >

                    <div
                        className="manage-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <button
                            type="button"
                            className="manage-modal-close"
                            onClick={() =>
                                setSelectedIssue(
                                    null
                                )
                            }
                        >
                            <X size={20} />
                        </button>

                        <div className="manage-modal-image">

                            <img
                                src={getIssueImage(
                                    selectedIssue
                                )}
                                alt={
                                    selectedIssue.title ||
                                    "Issue"
                                }
                                onError={(
                                    event
                                ) => {
                                    event.currentTarget.src =
                                        "/images/default-issue.jpeg";
                                }}
                            />

                            <div className="manage-modal-image-overlay">
                                <span>
                                    {
                                        selectedIssue.category ||
                                        "General"
                                    }
                                </span>

                                <span>
                                    <MapPin
                                        size={
                                            14
                                        }
                                    />

                                    {selectedIssue.location ||
                                        "Location not provided"}
                                </span>
                            </div>

                        </div>

                        <div className="manage-modal-content">

                            <div className="manage-modal-topline">

                                <span>
                                    #
                                    {selectedIssue._id
                                        ?.slice(
                                            -6
                                        )
                                        .toUpperCase()}
                                </span>

                                <span>
                                    {formatDate(
                                        selectedIssue.createdAt
                                    )}
                                </span>

                            </div>

                            <h2>
                                {selectedIssue.title ||
                                    "Untitled Issue"}
                            </h2>

                            <p className="manage-modal-description">
                                {selectedIssue.description ||
                                    "No description provided."}
                            </p>

                            <div className="manage-modal-grid">

                                <div>
                                    <span>
                                        <UserRound
                                            size={
                                                15
                                            }
                                        />
                                        Reported By
                                    </span>

                                    <strong>
                                        {getReporterName(
                                            selectedIssue
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <Tag
                                            size={
                                                15
                                            }
                                        />
                                        Category
                                    </span>

                                    <strong>
                                        {selectedIssue.category ||
                                            "General"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <MapPin
                                            size={
                                                15
                                            }
                                        />
                                        Location
                                    </span>

                                    <strong>
                                        {selectedIssue.location ||
                                            "Not provided"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        <CalendarDays
                                            size={
                                                15
                                            }
                                        />
                                        Reported On
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedIssue.createdAt
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <div className="manage-modal-review">

                                <div>
                                    <span>
                                        Moderation Status
                                    </span>

                                    <strong>
                                        <Clock3
                                            size={
                                                15
                                            }
                                        />

                                        Pending Review
                                    </strong>
                                </div>

                            </div>

                            <div className="manage-modal-actions">

                                <button
                                    type="button"
                                    className="manage-approve-btn large"
                                    onClick={() =>
                                        handleApprove(
                                            selectedIssue
                                        )
                                    }
                                    disabled={
                                        actionLoading ===
                                        selectedIssue._id
                                    }
                                >
                                    <CheckCircle2
                                        size={
                                            18
                                        }
                                    />

                                    Approve Issue
                                </button>

                                <button
                                    type="button"
                                    className="manage-dismiss-btn large"
                                    onClick={() => {
                                        setSelectedIssue(
                                            null
                                        );

                                        openDismissModal(
                                            selectedIssue
                                        );
                                    }}
                                    disabled={
                                        actionLoading ===
                                        selectedIssue._id
                                    }
                                >
                                    <XCircle
                                        size={
                                            18
                                        }
                                    />

                                    Dismiss Issue
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* DISMISS MODAL */}
            {dismissModal && (
                <div
                    className="manage-modal-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDismissModal(
                                null
                            );
                        }
                    }}
                >

                    <div
                        className="dismiss-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="dismiss-icon">
                            <XCircle
                                size={28}
                            />
                        </div>

                        <button
                            type="button"
                            className="manage-modal-close"
                            onClick={() =>
                                setDismissModal(
                                    null
                                )
                            }
                        >
                            <X size={19} />
                        </button>

                        <h2>
                            Dismiss Issue
                        </h2>

                        <p>
                            Please provide a
                            reason for
                            dismissing this
                            report. This helps
                            maintain a clear
                            moderation record.
                        </p>

                        <label>
                            Dismissal Reason
                        </label>

                        <textarea
                            value={
                                dismissReason
                            }
                            onChange={(
                                event
                            ) =>
                                setDismissReason(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Enter the reason for dismissing this report..."
                            rows={5}
                            autoFocus
                        />

                        <div className="dismiss-modal-actions">

                            <button
                                type="button"
                                className="dismiss-cancel-btn"
                                onClick={() =>
                                    setDismissModal(
                                        null
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="manage-dismiss-btn large"
                                onClick={
                                    handleDismiss
                                }
                                disabled={
                                    !dismissReason.trim() ||
                                    actionLoading ===
                                        dismissModal._id
                                }
                            >
                                <XCircle
                                    size={
                                        17
                                    }
                                />

                                {actionLoading ===
                                dismissModal._id
                                    ? "Dismissing..."
                                    : "Dismiss Issue"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default ManageIssues;