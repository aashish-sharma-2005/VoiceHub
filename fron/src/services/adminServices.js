const API_URL = "http://localhost:3000/api/admin";

const getToken = () =>
    localStorage.getItem("voicehub_token") ||
    sessionStorage.getItem("voicehub_token");

const adminRequest = async (path, options = {}) => {
    const token = getToken();

    if (!token) {
        throw new Error("Please login again to continue.");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
};

export const getManagedUsers = ({ role, status = "all", search = "" }) => {
    const params = new URLSearchParams({
        role,
        status,
        search: search.trim(),
    });

    return adminRequest(`/users?${params.toString()}`);
};

export const updateManagedUserStatus = (id, status) =>
    adminRequest(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

export const updateManagedUserRole = (id, role) =>
    adminRequest(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });

export const deleteManagedUser = (id) =>
    adminRequest(`/users/${id}`, {
        method: "DELETE",
    });