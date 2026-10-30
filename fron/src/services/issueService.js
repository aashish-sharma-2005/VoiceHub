
const API_URL = "http://localhost:3000/api/issues";

/* Get authentication token */
const getToken = () => {
    return (
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token") ||
        null
    );
};

/* Shared API response handler */
const handleResponse = async (response, fallbackMessage) => {
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid server response. Please try again.");
    }

    if (!response.ok) {
        const error = new Error(data.message || fallbackMessage);

        error.status = response.status;
        error.alreadyVoted = data.alreadyVoted || false;
        error.userVote = data.userVote || "none";

        throw error;
    }

    return data;
};

/* Delete an issue created by the logged-in user */
export const deleteIssue = async (issueId) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    if (!issueId) {
        throw new Error("Issue ID is required.");
    }

    const response = await fetch(`${API_URL}/${issueId}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to delete issue");
};

/* Get approved public issues */
export const getPublicIssues = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    return handleResponse(response, "Failed to fetch public issues");
};

/* Get logged-in user's issues */
export const getMyIssues = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/my`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to fetch your issues");
};

/* Submit one permanent vote */
export const voteIssue = async (issueId, vote) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    if (!["up", "down"].includes(vote)) {
        throw new Error("Invalid vote type.");
    }

    const response = await fetch(`${API_URL}/${issueId}/vote`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
    });

    return handleResponse(response, "Failed to submit vote");
};

/* Get logged-in user's votes */
export const getMyVotes = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/my-votes`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to fetch your saved votes");
};

/* Get issues for admin/moderator management */
export const getManageIssues = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/manage`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to fetch issues");
};

/* Approve an issue */
export const approveIssue = async (issueId) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/${issueId}/approve`, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to approve issue");
};

/* Dismiss an issue */
export const dismissIssue = async (issueId, reason) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/${issueId}/dismiss`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
    });

    return handleResponse(response, "Failed to dismiss issue");
};

/* Get issue status management data */
export const getIssueStatusManagement = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/status-management`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to fetch issue status data");
};

/* Update progress status */
export const updateIssueProgressStatus = async (issueId, status) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const allowedStatuses = [
        "Submitted",
        "Under Review",
        "In Progress",
        "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid issue progress status.");
    }

    const response = await fetch(`${API_URL}/${issueId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
    });

    return handleResponse(response, "Failed to update issue status");
};

/* =========================
   SAVED ISSUES
========================= */

export const getSavedIssues = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/saved`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to fetch saved issues");
};

export const saveIssue = async (issueId) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/${issueId}/save`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to save issue");
};

export const removeSavedIssue = async (issueId) => {
    const token = getToken();

    if (!token) {
        throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(`${API_URL}/${issueId}/save`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to remove saved issue");
};

/* =========================
   ISSUE COMMENTS
========================= */

/* Fetch comments for one issue */
export const getIssueComments = async (issueId) => {
    const response = await fetch(`${API_URL}/${issueId}/comments`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return handleResponse(response, "Failed to fetch comments");
};

/* Add a comment */
export const createIssueComment = async (issueId, text) => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login to add a comment.");
    }

    if (!text || !text.trim()) {
        throw new Error("Comment cannot be empty.");
    }

    const response = await fetch(`${API_URL}/${issueId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
    });

    return handleResponse(response, "Failed to add comment");
};

/* Edit your own comment */
export const updateIssueComment = async (commentId, text) => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login to edit a comment.");
    }

    if (!text || !text.trim()) {
        throw new Error("Comment cannot be empty.");
    }

    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
    });

    return handleResponse(response, "Failed to update comment");
};

/* Delete your own comment */
export const deleteIssueComment = async (commentId) => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login to delete a comment.");
    }

    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return handleResponse(response, "Failed to delete comment");
};
