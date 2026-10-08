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

/*
 * Vote on an issue
 *
 * vote:
 * "up"   = upvote
 * "down" = downvote
 *
 * Clicking the same vote again removes it.
 */
export const voteIssue = async (
    issueId,
    vote
) => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    if (!["up", "down"].includes(vote)) {
        throw new Error(
            "Invalid vote type."
        );
    }

    const response = await fetch(
        `${API_URL}/${issueId}/vote`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
                vote,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to update vote"
        );
    }

    return data;
};
export const getManageIssues = async () => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    const response = await fetch(
        `${API_URL}/manage`,
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
                "Failed to fetch issues"
        );
    }

    return data;
};


export const approveIssue = async (issueId) => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    const response = await fetch(
        `${API_URL}/${issueId}/approve`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to approve issue"
        );
    }

    return data;
};


export const dismissIssue = async (
    issueId,
    reason
) => {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please login again."
        );
    }

    const response = await fetch(
        `${API_URL}/${issueId}/dismiss`,
        {
            method: "PATCH",
            headers: {
                "Content-Type":
                    "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                reason,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to dismiss issue"
        );
    }

    return data;
};