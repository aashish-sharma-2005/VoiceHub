import {
    BarChart3,
    Compass,
    FilePlus2,
    ClipboardList,
    Bookmark,
    Bell,
    HelpCircle,
    Settings,
    MapPin,
    LogOut,
    Flag,
    Users,
    Tags,
    ShieldCheck,
    AlertTriangle,
    MessageSquare,
    History,
    CheckCircle2,
    XCircle,
    Activity,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../../store/loginSlice";
import './sidebar.css'
function Sidebar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /*
     * First try Redux.
     * If Redux has not loaded yet, fall back to storage.
     */
    const reduxUser = useSelector(
        (state) => state.login?.user
    );

    let storedUser = null;

    try {
        const userData =
            localStorage.getItem("voicehub_user") ||
            sessionStorage.getItem("voicehub_user");

        storedUser = userData
            ? JSON.parse(userData)
            : null;
    } catch (error) {
        console.error(
            "Invalid stored user data:",
            error
        );
    }

    const user = reduxUser || storedUser;

    const role = user?.role || "user";

    /*
     * Active navigation styling
     */
    const linkClass = ({ isActive }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    /*
     * Logout
     */
    const handleLogout = () => {
        dispatch(logout());

        localStorage.removeItem("voicehub_token");
        localStorage.removeItem("voicehub_user");

        sessionStorage.removeItem("voicehub_token");
        sessionStorage.removeItem("voicehub_user");

        navigate("/login", { replace: true });
    };

    /*
     * USER SIDEBAR
     */
    const userLinks = (
        <>
            <NavLink
                to="/"
                className={linkClass}
            >
                <BarChart3 size={19} />
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                to="/explore"
                className={linkClass}
            >
                <Compass size={19} />
                <span>Explore Issues</span>
            </NavLink>

            <NavLink
                to="/create-issue"
                className={linkClass}
            >
                <FilePlus2 size={19} />
                <span>Report an Issue</span>
            </NavLink>

            <NavLink
                to="/my-issues"
                className={linkClass}
            >
                <ClipboardList size={19} />
                <span>My Issues</span>
            </NavLink>

            <NavLink
                to="/saved-issues"
                className={linkClass}
            >
                <Bookmark size={19} />
                <span>Saved Issues</span>
            </NavLink>

            <NavLink
                to="/notifications"
                className={linkClass}
            >
                <Bell size={19} />
                <span>Notifications</span>
            </NavLink>

            <NavLink
                to="/help"
                className={linkClass}
            >
                <HelpCircle size={19} />
                <span>Help</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={linkClass}
            >
                <Settings size={19} />
                <span>Settings</span>
            </NavLink>
        </>
    );

    /*
     * MODERATOR SIDEBAR
     */
    const moderatorLinks = (
        <>
            <NavLink
                to="/moderator"
                className={linkClass}
            >
                <BarChart3 size={19} />
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                to="/moderator/pending"
                className={linkClass}
            >
                <ClipboardList size={19} />
                <span>Pending Reports</span>
            </NavLink>

            <NavLink
                to="/moderator/issues"
                className={linkClass}
            >
                <Flag size={19} />
                <span>All Issues</span>
            </NavLink>

            <NavLink
                to="/moderator/approved"
                className={linkClass}
            >
                <CheckCircle2 size={19} />
                <span>Approved Issues</span>
            </NavLink>

            <NavLink
                to="/moderator/dismissed"
                className={linkClass}
            >
                <XCircle size={19} />
                <span>Dismissed Issues</span>
            </NavLink>

            <NavLink
                to="/moderator/reported-content"
                className={linkClass}
            >
                <AlertTriangle size={19} />
                <span>Reported Content</span>
            </NavLink>

            <NavLink
                to="/moderator/comments"
                className={linkClass}
            >
                <MessageSquare size={19} />
                <span>Comments</span>
            </NavLink>

            <NavLink
                to="/moderator/history"
                className={linkClass}
            >
                <History size={19} />
                <span>Moderation History</span>
            </NavLink>

            <NavLink
                to="/notifications"
                className={linkClass}
            >
                <Bell size={19} />
                <span>Notifications</span>
            </NavLink>

            <NavLink
                to="/help"
                className={linkClass}
            >
                <HelpCircle size={19} />
                <span>Help</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={linkClass}
            >
                <Settings size={19} />
                <span>Settings</span>
            </NavLink>
        </>
    );

    /*
     * ADMIN SIDEBAR
     */
    const adminLinks = (
        <>
            <NavLink
                to="/admin"
                className={linkClass}
            >
                <BarChart3 size={19} />
                <span>Dashboard</span>
            </NavLink>

            <NavLink
                to="/admin/issues"
                className={linkClass}
            >
                <Flag size={19} />
                <span>All Issues</span>
            </NavLink>

            <NavLink
                to="/admin/pending"
                className={linkClass}
            >
                <ClipboardList size={19} />
                <span>Pending Issues</span>
            </NavLink>

            <NavLink
                to="/admin/users"
                className={linkClass}
            >
                <Users size={19} />
                <span>Users</span>
            </NavLink>

            <NavLink
                to="/admin/moderators"
                className={linkClass}
            >
                <ShieldCheck size={19} />
                <span>Moderators</span>
            </NavLink>

            <NavLink
                to="/admin/categories"
                className={linkClass}
            >
                <Tags size={19} />
                <span>Categories</span>
            </NavLink>

            <NavLink
                to="/admin/status"
                className={linkClass}
            >
                <CheckCircle2 size={19} />
                <span>Issue Status</span>
            </NavLink>

            <NavLink
                to="/admin/reports"
                className={linkClass}
            >
                <AlertTriangle size={19} />
                <span>Reports</span>
            </NavLink>

            <NavLink
                to="/admin/comments"
                className={linkClass}
            >
                <MessageSquare size={19} />
                <span>Comments</span>
            </NavLink>

            <NavLink
                to="/notifications"
                className={linkClass}
            >
                <Bell size={19} />
                <span>Notifications</span>
            </NavLink>

            <NavLink
                to="/admin/analytics"
                className={linkClass}
            >
                <Activity size={19} />
                <span>Platform Analytics</span>
            </NavLink>

            <NavLink
                to="/admin/activity-logs"
                className={linkClass}
            >
                <History size={19} />
                <span>Activity Logs</span>
            </NavLink>

            <NavLink
                to="/settings"
                className={linkClass}
            >
                <Settings size={19} />
                <span>Settings</span>
            </NavLink>

            <NavLink
                to="/help"
                className={linkClass}
            >
                <HelpCircle size={19} />
                <span>Help</span>
            </NavLink>
        </>
    );

    return (
        <aside className="sidebar">

            {/* BRAND */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <Flag size={20} />
                </div>

                <div className="sidebar-brand-text">
                    <span className="sidebar-brand-name">
                        VoiceHub
                    </span>

                    <span className="sidebar-brand-subtitle">
                        Community Voice
                    </span>
                </div>
            </div>

            {/* LOCATION */}
            <div className="sidebar-location">
                <MapPin size={16} />

                <div>
                    <span>Current Location</span>
                    <strong>Your Community</strong>
                </div>
            </div>

            {/* ROLE */}
            <div className="sidebar-role">
                <span className="sidebar-role-label">
                    Account
                </span>

                <span className="sidebar-role-value">
                    {role.charAt(0).toUpperCase() +
                        role.slice(1)}
                </span>
            </div>

            {/* NAVIGATION */}
            <nav className="sidebar-nav">

                {role === "admin" && adminLinks}

                {role === "moderator" &&
                    moderatorLinks}

                {role === "user" && userLinks}

            </nav>

            {/* USER PROFILE / LOGOUT */}
            <div className="sidebar-bottom">

                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.name
                            ? user.name
                                  .charAt(0)
                                  .toUpperCase()
                            : "U"}
                    </div>

                    <div className="sidebar-user-info">
                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.email ||
                                "user@voicehub.com"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>

            </div>
        </aside>
    );
}

export default Sidebar;