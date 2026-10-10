
const Issue = require("../models/issue");
const User = require("../models/user");

/*
 * PUBLIC COMMUNITY DASHBOARD
 * Keeps the existing public dashboard response.
 */
const getDashboardData = async (req, res) => {
    try {
        const publicFilter = {
            moderationStatus: "Approved",
        };

        const totalIssues = await Issue.countDocuments(publicFilter);

        const resolved = await Issue.countDocuments({
            ...publicFilter,
            status: "Resolved",
        });

        const inProgress = await Issue.countDocuments({
            ...publicFilter,
            status: "In Progress",
        });

        const submitted = await Issue.countDocuments({
            ...publicFilter,
            status: "Submitted",
        });

        const underReview = await Issue.countDocuments({
            ...publicFilter,
            status: "Under Review",
        });

        const categoryData = await Issue.aggregate([
            { $match: publicFilter },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const categories = categoryData.map((item) => ({
            name: item._id,
            count: item.count,
            percentage:
                totalIssues > 0
                    ? Math.round((item.count / totalIssues) * 100)
                    : 0,
        }));

        const recentIssues = await Issue.find(publicFilter)
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title category status createdAt");

        const recentActivity = recentIssues.map((issue) => ({
            title: issue.title,
            category: issue.category,
            status: issue.status,
            time: issue.createdAt,
        }));

        const trendingIssues = await Issue.find(publicFilter)
            .sort({ upvotes: -1 })
            .limit(3)
            .select("title location upvotes status");

        const trending = trendingIssues.map((issue) => ({
            title: issue.title,
            location: issue.location,
            votes: issue.upvotes,
            comments: 0,
            status: issue.status,
        }));

        const resolvedPercentage =
            totalIssues > 0
                ? Math.round((resolved / totalIssues) * 100)
                : 0;

        return res.status(200).json({
            success: true,

            stats: {
                totalIssues,
                resolved,
                inProgress,
                pending: submitted,
            },

            categories,
            recentActivity,
            trendingIssues: trending,

            civicProgress: {
                submitted,
                underReview,
                inProgress,
                resolved,
                resolvedPercentage,
            },
        });
    } catch (error) {
        console.error("Public dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
        });
    }
};

/*
 * ADMIN DASHBOARD
 * Includes all issues, regardless of moderation status.
 */
const getAdminDashboardData = async (req, res) => {
    try {
        const [
            totalUsers,
            totalIssues,
            pendingReviews,
            resolvedIssues,
            recentIssues,
        ] = await Promise.all([
            User.countDocuments({}),

            Issue.countDocuments({}),

            Issue.countDocuments({
                moderationStatus: "Pending",
            }),

            Issue.countDocuments({
                moderationStatus: "Approved",
                status: "Resolved",
            }),

            Issue.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("createdBy", "name email")
                .select(
                    "title category location moderationStatus status createdAt createdBy"
                ),
        ]);

        return res.status(200).json({
            success: true,

            stats: {
                totalUsers,
                totalIssues,
                pendingReviews,
                resolvedIssues,
            },

            recentIssues,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard data",
        });
    }
};

module.exports = {
    getDashboardData,
    getAdminDashboardData,
};
