
const API_URL = "http://localhost:3000/api/dashboard";

/*
 * Public community dashboard.
 * Existing pages can continue using this function.
 */
export const getDashboardData = async () => {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to fetch dashboard data"
        );
    }

    return data;
};

/*
 * Get the authenticated admin dashboard data.
 */
export const getAdminDashboardData = async () => {
    const token =
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token");

    if (!token) {
        throw new Error("Please login again to continue.");
    }

    const response = await fetch(`${API_URL}/admin`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to fetch admin dashboard data"
        );
    }

    return data;
};
