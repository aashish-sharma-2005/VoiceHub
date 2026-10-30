import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    ArrowBigDown,
    ArrowBigUp,
    X,
    ShieldCheck,
} from "lucide-react";

import Explore from "../../components/explore/explore";
import {
    getPublicIssues,
    getMyVotes,
    voteIssue,
    getSavedIssues,
    saveIssue,
    removeSavedIssue,
} from "../../services/issueService";

function ExploreScreen() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [location, setLocation] = useState("all");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("most-upvoted");
    const [view, setView] = useState("grid");

    const [votingIds, setVotingIds] = useState([]);
    const [userVotes, setUserVotes] = useState({});
    const [pendingVote, setPendingVote] = useState(null);

    const [savedIssues, setSavedIssues] = useState({});
    const [savingIds, setSavingIds] = useState([]);

    const extractIssues = (response) => {
        const data =
            response?.issues ??
            response?.data?.issues ??
            response?.data ??
            response ??
            [];

        return Array.isArray(data) ? data : [];
    };

    const loadMyVotes = useCallback(async () => {
        try {
            const response = await getMyVotes();
            const votes = response?.votes || [];
            const voteMap = {};

            votes.forEach((item) => {
                if (
                    item?.issueId &&
                    ["up", "down"].includes(item.voteType)
                ) {
                    voteMap[String(item.issueId)] = item.voteType;
                }
            });

            setUserVotes(voteMap);
        } catch {
            setUserVotes({});
        }
    }, []);

    const loadSavedIssues = useCallback(async () => {
        try {
            const response = await getSavedIssues();
            const savedList = response?.issues || [];
            const savedMap = {};

            savedList.forEach((issue) => {
                const issueId =
                    typeof issue === "string" ? issue : issue?._id;

                if (issueId) {
                    savedMap[String(issueId)] = true;
                }
            });

            setSavedIssues(savedMap);
        } catch {
            setSavedIssues({});
        }
    }, []);

    const loadIssues = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getPublicIssues();
            const publicIssues = extractIssues(response);

            setIssues(publicIssues);

            // Personal data is loaded separately so a vote/save loading
            // problem does not hide publicly available issues.
            await Promise.allSettled([
                loadMyVotes(),
                loadSavedIssues(),
            ]);
        } catch (err) {
            console.error("Failed to load public issues:", err);
            setError(
                err?.message || "Unable to load community issues."
            );
        } finally {
            setLoading(false);
        }
    }, [loadMyVotes, loadSavedIssues]);

    useEffect(() => {
        loadIssues();
    }, [loadIssues]);

    const handleToggleSave = async (issueId) => {
        const id = String(issueId || "");

        if (!id || savingIds.includes(id)) return;

        const wasSaved = Boolean(savedIssues[id]);

        setSavingIds((previous) => [...previous, id]);

        // Optimistic update: show the expected result immediately.
        setSavedIssues((previous) => {
            const updated = { ...previous };

            if (wasSaved) {
                delete updated[id];
            } else {
                updated[id] = true;
            }

            return updated;
        });

        try {
            if (wasSaved) {
                await removeSavedIssue(id);
                toast.success("Issue removed from Saved Issues.");
            } else {
                await saveIssue(id);
                toast.success("Issue saved successfully.");
            }
        } catch (err) {
            // Restore the previous state if the server rejects the request.
            setSavedIssues((previous) => {
                const updated = { ...previous };

                if (wasSaved) {
                    updated[id] = true;
                } else {
                    delete updated[id];
                }

                return updated;
            });

            toast.error(
                err?.message ||
                "Unable to update Saved Issues. Please try again."
            );
        } finally {
            setSavingIds((previous) =>
                previous.filter((item) => item !== id)
            );
        }
    };

    const getLocationText = (issue) => {
        if (typeof issue?.location === "string") {
            return issue.location;
        }

        if (issue?.location?.address) {
            return issue.location.address;
        }

        if (issue?.location?.name) {
            return issue.location.name;
        }

        return "Location not provided";
    };

    const normalizeStatus = (value) =>
        String(value || "")
            .toLowerCase()
            .replace(/[\s_-]/g, "");

    const categories = useMemo(
        () =>
            [...new Set(
                issues
                    .map((issue) => issue.category)
                    .filter(Boolean)
            )].sort(),
        [issues]
    );

    const locations = useMemo(
        () =>
            [...new Set(
                issues
                    .map(getLocationText)
                    .filter(
                        (value) =>
                            value &&
                            value !== "Location not provided"
                    )
            )].sort(),
        [issues]
    );

    const statusCounts = useMemo(
        () => ({
            submitted: issues.filter((issue) =>
                ["submitted", "pending"].includes(
                    normalizeStatus(issue.status)
                )
            ).length,

            reviewing: issues.filter((issue) =>
                ["reviewing", "underreview"].includes(
                    normalizeStatus(issue.status)
                )
            ).length,

            inProgress: issues.filter((issue) =>
                ["inprogress", "progress"].includes(
                    normalizeStatus(issue.status)
                )
            ).length,

            resolved: issues.filter((issue) =>
                ["resolved", "completed"].includes(
                    normalizeStatus(issue.status)
                )
            ).length,
        }),
        [issues]
    );

    const filteredIssues = useMemo(() => {
        let result = [...issues];
        const searchText = search.trim().toLowerCase();

        if (searchText) {
            result = result.filter((issue) => {
                const title = String(issue.title || "").toLowerCase();
                const description = String(
                    issue.description || ""
                ).toLowerCase();
                const issueCategory = String(
                    issue.category || ""
                ).toLowerCase();
                const issueLocation = getLocationText(
                    issue
                ).toLowerCase();
                const createdBy = String(
                    issue.createdBy?.name ||
                    issue.user?.name ||
                    ""
                ).toLowerCase();

                return (
                    title.includes(searchText) ||
                    description.includes(searchText) ||
                    issueCategory.includes(searchText) ||
                    issueLocation.includes(searchText) ||
                    createdBy.includes(searchText)
                );
            });
        }

        if (category !== "all") {
            result = result.filter(
                (issue) =>
                    String(issue.category || "").toLowerCase() ===
                    category.toLowerCase()
            );
        }

        if (location !== "all") {
            result = result.filter(
                (issue) =>
                    getLocationText(issue).toLowerCase() ===
                    location.toLowerCase()
            );
        }

        if (status !== "all") {
            const selectedStatus = normalizeStatus(status);

            result = result.filter(
                (issue) =>
                    normalizeStatus(issue.status) === selectedStatus
            );
        }

        if (sort === "most-upvoted") {
            result.sort(
                (a, b) =>
                    Number(b.upvotes || 0) -
                    Number(a.upvotes || 0)
            );
        } else if (sort === "newest") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );
        } else if (sort === "most-downvoted") {
            result.sort(
                (a, b) =>
                    Number(b.downvotes || 0) -
                    Number(a.downvotes || 0)
            );
        }

        return result;
    }, [issues, search, category, location, status, sort]);

    const handleVote = (issueId, vote) => {
        const id = String(issueId || "");

        if (!id || !["up", "down"].includes(vote)) return;
        if (votingIds.includes(id)) return;

        const existingVote = userVotes[id];

        if (existingVote === "up" || existingVote === "down") {
            toast.info(
                `You have already ${
                    existingVote === "up" ? "upvoted" : "downvoted"
                } this issue. Your vote cannot be changed.`
            );
            return;
        }

        const issue = issues.find(
            (item) => String(item._id) === id
        );

        setPendingVote({
            issueId: id,
            vote,
            title: issue?.title || "this issue",
        });
    };

    const confirmVote = async () => {
        if (!pendingVote) return;

        const { issueId, vote } = pendingVote;

        if (votingIds.includes(issueId)) return;

        setVotingIds((previous) => [...previous, issueId]);

        try {
            const response = await voteIssue(issueId, vote);
            const updatedIssue = response?.issue;

            setIssues((previousIssues) =>
                previousIssues.map((issue) =>
                    String(issue._id) === issueId
                        ? {
                            ...issue,
                            upvotes:
                                updatedIssue?.upvotes ??
                                issue.upvotes,
                            downvotes:
                                updatedIssue?.downvotes ??
                                issue.downvotes,
                            userVote: vote,
                        }
                        : issue
                )
            );

            setUserVotes((previous) => ({
                ...previous,
                [issueId]: vote,
            }));

            setPendingVote(null);

            toast.success(
                vote === "up"
                    ? "Your upvote has been saved."
                    : "Your downvote has been saved."
            );
        } catch (err) {
            console.error("Vote failed:", err);

            if (err?.alreadyVoted || err?.status === 409) {
                await loadMyVotes();
            }

            toast.error(
                err?.message || "Unable to submit your vote."
            );
        } finally {
            setVotingIds((previous) =>
                previous.filter((id) => id !== issueId)
            );
        }
    };

    const resetFilters = () => {
        setSearch("");
        setCategory("all");
        setLocation("all");
        setStatus("all");
        setSort("most-upvoted");
    };

    const issuesWithUserVotes = useMemo(
        () =>
            filteredIssues.map((issue) => {
                const id = String(issue._id);

                return {
                    ...issue,
                    userVote:
                        userVotes[id] || issue.userVote || "none",
                    isSaved: Boolean(savedIssues[id]),
                    isSaving: savingIds.includes(id),
                };
            }),
        [filteredIssues, userVotes, savedIssues, savingIds]
    );

    return (
        <>
            <Explore
                issues={issuesWithUserVotes}
                total={issues.length}
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                location={location}
                setLocation={setLocation}
                status={status}
                setStatus={setStatus}
                sort={sort}
                setSort={setSort}
                view={view}
                setView={setView}
                resetFilters={resetFilters}
                categories={categories}
                locations={locations}
                statusCounts={statusCounts}
                loading={loading}
                error={error}
                votingIds={votingIds}
                onVote={handleVote}
                onToggleSave={handleToggleSave}
                savedIssueIds={Object.keys(savedIssues)}
                savingIds={savingIds}
                onRetry={loadIssues}
            />

            {pendingVote && (
                <div
                    role="presentation"
                    onClick={() => {
                        if (!votingIds.includes(pendingVote.issueId)) {
                            setPendingVote(null);
                        }
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(15, 23, 42, 0.55)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="vote-confirm-title"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: 430,
                            position: "relative",
                            background: "#ffffff",
                            borderRadius: 20,
                            padding: 28,
                            boxShadow:
                                "0 24px 80px rgba(15, 23, 42, 0.24)",
                            color: "#172033",
                        }}
                    >
                        <button
                            type="button"
                            aria-label="Close confirmation"
                            disabled={votingIds.includes(pendingVote.issueId)}
                            onClick={() => setPendingVote(null)}
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                border: 0,
                                background: "#f1f5f9",
                                color: "#475569",
                                borderRadius: 10,
                                width: 34,
                                height: 34,
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div
                            style={{
                                width: 54,
                                height: 54,
                                borderRadius: 16,
                                display: "grid",
                                placeItems: "center",
                                background:
                                    pendingVote.vote === "up"
                                        ? "#eff6ff"
                                        : "#fff1f2",
                                color:
                                    pendingVote.vote === "up"
                                        ? "#2563eb"
                                        : "#e11d48",
                                marginBottom: 20,
                            }}
                        >
                            {pendingVote.vote === "up" ? (
                                <ArrowBigUp size={29} />
                            ) : (
                                <ArrowBigDown size={29} />
                            )}
                        </div>

                        <h2
                            id="vote-confirm-title"
                            style={{
                                fontSize: 22,
                                fontWeight: 750,
                                margin: "0 0 10px",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Confirm your{" "}
                            {pendingVote.vote === "up"
                                ? "upvote"
                                : "downvote"}?
                        </h2>

                        <p
                            style={{
                                fontSize: 14,
                                lineHeight: 1.7,
                                color: "#64748b",
                                margin: "0 0 12px",
                                overflowWrap: "anywhere",
                            }}
                        >
                            You are voting on{" "}
                            <strong style={{ color: "#334155" }}>
                                {pendingVote.title}
                            </strong>.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 22,
                            }}
                        >
                            <ShieldCheck
                                size={19}
                                color="#64748b"
                                style={{ flexShrink: 0, marginTop: 1 }}
                            />
                            <p
                                style={{
                                    margin: 0,
                                    color: "#475569",
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                }}
                            >
                                Your vote is permanent. You cannot change
                                or remove it after confirming.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                type="button"
                                disabled={votingIds.includes(pendingVote.issueId)}
                                onClick={() => setPendingVote(null)}
                                style={{
                                    flex: 1,
                                    minHeight: 44,
                                    borderRadius: 11,
                                    border: "1px solid #cbd5e1",
                                    background: "#ffffff",
                                    color: "#334155",
                                    fontWeight: 650,
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={votingIds.includes(pendingVote.issueId)}
                                onClick={confirmVote}
                                style={{
                                    flex: 1,
                                    minHeight: 44,
                                    border: 0,
                                    borderRadius: 11,
                                    background:
                                        pendingVote.vote === "up"
                                            ? "#2563eb"
                                            : "#e11d48",
                                    color: "#ffffff",
                                    fontWeight: 650,
                                    cursor: "pointer",
                                    opacity: votingIds.includes(pendingVote.issueId)
                                        ? 0.7
                                        : 1,
                                }}
                            >
                                {votingIds.includes(pendingVote.issueId)
                                    ? "Submitting..."
                                    : "Confirm vote"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

export default ExploreScreen;