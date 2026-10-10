const mongoose = require("mongoose");
const User = require("../models/user");

// Escape special characters in a search string.
const escapeRegex = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/users?role=user&status=active&search=ashish
const getManagedUsers = async (req, res) => {
    try {
        const { role, status = "all", search = "" } = req.query;

        if (!["user", "moderator"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be user or moderator.",
            });
        }

        if (!["all", "active", "blocked"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account status.",
            });
        }

        const query = { role };

        if (status !== "all") {
            query.status = status;
        }

        const trimmedSearch = search.trim();

        if (trimmedSearch) {
            const searchRegex = new RegExp(
                escapeRegex(trimmedSearch),
                "i"
            );

            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            total: users.length,
            users,
        });
    } catch (error) {
        console.error("Get managed users error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load accounts.",
        });
    }
};

// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account ID.",
            });
        }

        if (!["active", "blocked"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or blocked.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be modified here.",
            });
        }

        user.status = status;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Account ${status === "active" ? "unblocked" : "blocked"} successfully.`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Update user status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update account status.",
        });
    }
};

// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account ID.",
            });
        }

        if (!["user", "moderator"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be user or moderator.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin roles cannot be changed here.",
            });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: role === "moderator"
                ? "User promoted to moderator successfully."
                : "Moderator changed to user successfully.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Update user role error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update account role.",
        });
    }
};

// DELETE /api/admin/users/:id
const deleteManagedUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid account ID.",
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be deleted here.",
            });
        }

        await User.deleteOne({ _id: user._id });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
            deletedId: user._id,
        });
    } catch (error) {
        console.error("Delete managed user error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete account.",
        });
    }
};

module.exports = {
    getManagedUsers,
    updateUserStatus,
    updateUserRole,
    deleteManagedUser,
};