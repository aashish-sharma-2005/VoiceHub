import { Navigate, Outlet } from "react-router-dom";

const RoleRoute = ({ allowedRoles }) => {
    // =========================
    // Get authentication data
    // =========================

    const token =
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token");

    const storedUser =
        localStorage.getItem("voicehub_user") ||
        sessionStorage.getItem("voicehub_user");

    let user = null;

    // =========================
    // Convert stored user data
    // =========================

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Invalid stored user data:", error);
        user = null;
    }

    // =========================
    // Not logged in
    // =========================

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // =========================
    // Check user role
    // =========================

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // =========================
    // Authorized
    // =========================

    return <Outlet />;
};

export default RoleRoute;