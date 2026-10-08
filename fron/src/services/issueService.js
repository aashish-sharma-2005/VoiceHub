import { issues } from "../data/issues";

const API_URL = "http://localhost:3000/api/issues";

/*
 * Get authentication token
 */
const getToken = () => {
    return (
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token") ||
        null
    );
};

/*
 * Existing dummy-data function
 * Used by existing pages such as Explore.
 */
export const getIssues = () => {
    return {
        issues,
        total: issues.length,
    };
};

/*
 * Existing dummy-data function
 */
export const getIssueById = (id) => {
    return issues.find(
        (issue) => issue._id === id
    );
};

/*
 * Get issues created by the logged-in user
 */
export const getMyIssues = async () => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    const response = await fetch(
        `${API_URL}/my`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to fetch your issues"
        );
    }

    return data;
};