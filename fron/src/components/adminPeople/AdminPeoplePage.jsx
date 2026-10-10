
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Search,
    RefreshCw,
    Users,
    ShieldCheck,
    UserRound,
    Mail,
    CalendarDays,
    ShieldAlert,
    UserCog,
    Trash2,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";

import {
    getManagedUsers,
    updateManagedUserStatus,
    updateManagedUserRole,
    deleteManagedUser,
} from "../../services/adminServices";

import "./AdminPeoplePage.css";

function AdminPeoplePage({ role }) {
    const isModeratorPage = role === "moderator";

    const [people, setPeople] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");

    const loadPeople = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getManagedUsers({
                role,
                status,
                search,
            });

            setPeople(data.users || []);
        } catch (err) {
            setError(err.message || "Unable to load accounts.");
            setPeople([]);
        } finally {
            setLoading(false);
        }
    }, [role, status, search]);

    useEffect(() => {
        loadPeople();
    }, [loadPeople]);

    const handleSearch = (event) => {
        event.preventDefault();
        setSearch(searchInput.trim());
    };

    // Block or unblock an account.
    const handleStatusChange = async (person) => {
        const nextStatus =
            person.status === "blocked" ? "active" : "blocked";

        setBusyId(person._id);
        setError("");

        try {
            const data = await updateManagedUserStatus(
                person._id,
                nextStatus
            );

            toast.success(
                data.message || "Account status updated successfully."
            );

            await loadPeople();
        } catch (err) {
            toast.error(
                err.message || "Could not update account status."
            );
        } finally {
            setBusyId("");
        }
    };

    // Promote a user or demote a moderator.
    const handleRoleChange = async (person) => {
        const nextRole = isModeratorPage ? "user" : "moderator";

        setBusyId(person._id);
        setError("");

        try {
            const data = await updateManagedUserRole(
                person._id,
                nextRole
            );

            toast.success(
                data.message || "Account role updated successfully."
            );

            // The account moves to the other management page.
            await loadPeople();
        } catch (err) {
            toast.error(
                err.message || "Could not update account role."
            );
        } finally {
            setBusyId("");
        }
    };

    // Permanently delete an account.
    const handleDelete = async (person) => {
        setBusyId(person._id);
        setError("");

        try {
            const data = await deleteManagedUser(person._id);

            toast.success(
                data.message || "Account deleted successfully."
            );

            await loadPeople();
        } catch (err) {
            toast.error(
                err.message || "Could not delete account."
            );
        } finally {
            setBusyId("");
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const activeCount = people.filter(
        (person) => person.status === "active"
    ).length;

    const blockedCount = people.filter(
        (person) => person.status === "blocked"
    ).length;

    return (
        <section className="admin-people-page">
            {/* Page heading */}
            <div className="admin-people-heading">
                <div>
                    <span className="admin-people-eyebrow">
                        ADMINISTRATION / ACCOUNTS
                    </span>

                    <h1>
                        {isModeratorPage
                            ? "Moderator Management"
                            : "User Management"}
                    </h1>

                    <p>
                        {isModeratorPage
                            ? "Manage community moderators and their account access."
                            : "Manage community members, account access, and moderator promotions."}
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-people-refresh"
                    onClick={() => loadPeople()}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="admin-people-stats">
                <article className="admin-people-stat-card">
                    <div className="admin-people-stat-icon blue">
                        {isModeratorPage ? (
                            <ShieldCheck size={21} />
                        ) : (
                            <Users size={21} />
                        )}
                    </div>

                    <div>
                        <span>
                            Total {isModeratorPage ? "Moderators" : "Users"}
                        </span>
                        <strong>{people.length}</strong>
                    </div>
                </article>

                <article className="admin-people-stat-card">
                    <div className="admin-people-stat-icon green">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>
                        <span>Active accounts</span>
                        <strong>{activeCount}</strong>
                    </div>
                </article>

                <article className="admin-people-stat-card">
                    <div className="admin-people-stat-icon red">
                        <ShieldAlert size={21} />
                    </div>

                    <div>
                        <span>Blocked accounts</span>
                        <strong>{blockedCount}</strong>
                    </div>
                </article>
            </div>

            {/* Search and filters */}
            <div className="admin-people-toolbar">
                <form
                    className="admin-people-search"
                    onSubmit={handleSearch}
                >
                    <Search size={18} />

                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="Search by name or email..."
                        aria-label="Search accounts"
                    />

                    <button type="submit">Search</button>
                </form>

                <label className="admin-people-filter">
                    <span>Account status</span>

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </label>
            </div>

            {/* Inline loading errors */}
            {error && (
                <div
                    className="admin-people-message error"
                    role="alert"
                >
                    <AlertCircle size={17} />
                    {error}
                    <button
                        type="button"
                        onClick={() => loadPeople()}
                        disabled={loading}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Account table */}
            <div className="admin-people-table-card">
                <div className="admin-people-table-heading">
                    <div>
                        <h2>
                            {isModeratorPage
                                ? "Community moderators"
                                : "Registered users"}
                        </h2>

                        <p>
                            {people.length} account
                            {people.length === 1 ? "" : "s"} found
                        </p>
                    </div>

                    <span className="admin-people-role-tag">
                        {isModeratorPage
                            ? "Moderator accounts"
                            : "User accounts"}
                    </span>
                </div>

                <div className="admin-people-table-scroll">
                    <table className="admin-people-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th className="actions-heading">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="admin-people-empty"
                                    >
                                        <LoaderCircle
                                            className="admin-people-spinner"
                                            size={24}
                                        />
                                        <span>Loading accounts...</span>
                                    </td>
                                </tr>
                            ) : people.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="admin-people-empty"
                                    >
                                        <UserRound size={30} />
                                        <strong>No accounts found</strong>
                                        <span>
                                            Try changing your search or
                                            status filter.
                                        </span>
                                    </td>
                                </tr>
                            ) : (
                                people.map((person) => (
                                    <tr key={person._id}>
                                        <td>
                                            <div className="admin-people-account">
                                                <div className="admin-people-avatar">
                                                    {person.name
                                                        ?.trim()
                                                        .charAt(0)
                                                        .toUpperCase() || "U"}
                                                </div>

                                                <div className="admin-people-account-details">
                                                    <strong>
                                                        {person.name}
                                                    </strong>

                                                    <span>
                                                        <Mail size={13} />
                                                        {person.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-people-role ${person.role}`}
                                            >
                                                {person.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-people-status ${person.status}`}
                                            >
                                                <span />
                                                {person.status}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="admin-people-date">
                                                <CalendarDays size={14} />
                                                {formatDate(person.createdAt)}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-people-actions">
                                                <button
                                                    type="button"
                                                    className={`admin-people-action ${
                                                        person.status === "blocked"
                                                            ? "unblock"
                                                            : "block"
                                                    }`}
                                                    disabled={busyId === person._id}
                                                    onClick={() =>
                                                        handleStatusChange(person)
                                                    }
                                                >
                                                    {busyId === person._id ? (
                                                        <LoaderCircle
                                                            size={14}
                                                            className="admin-people-spinner"
                                                        />
                                                    ) : (
                                                        <ShieldAlert size={14} />
                                                    )}

                                                    {person.status === "blocked"
                                                        ? "Unblock"
                                                        : "Block"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-people-action role-change"
                                                    disabled={busyId === person._id}
                                                    onClick={() =>
                                                        handleRoleChange(person)
                                                    }
                                                >
                                                    <UserCog size={14} />

                                                    {isModeratorPage
                                                        ? "Demote"
                                                        : "Promote"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-people-action delete"
                                                    disabled={busyId === person._id}
                                                    onClick={() =>
                                                        handleDelete(person)
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="admin-people-table-footer">
                    <span>
                        <ShieldCheck size={15} />
                        Only administrators can manage these accounts.
                    </span>

                    <span>VoiceHub Administration</span>
                </div>
            </div>
        </section>
    );
}

export default AdminPeoplePage;
