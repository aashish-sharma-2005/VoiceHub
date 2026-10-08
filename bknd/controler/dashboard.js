const Issue = require("../models/issue");

const getDashboardData = async (req, res) => {
  try {
    // Only approved issues are public
    const publicFilter = {
      moderationStatus: "Approved",
    };

    // =========================
    // Total Public Issues
    // =========================

    const totalIssues = await Issue.countDocuments(publicFilter);

    // =========================
    // Status Counts
    // =========================

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

    // =========================
    // Issue Distribution
    // =========================

    const categoryData = await Issue.aggregate([
      {
        $match: publicFilter,
      },
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const categories = categoryData.map((item) => ({
      name: item._id,
      count: item.count,
      percentage:
        totalIssues > 0
          ? Math.round((item.count / totalIssues) * 100)
          : 0,
    }));

    // =========================
    // Recent Activity
    // =========================

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

    // =========================
    // Trending Issues
    // =========================

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

    // =========================
    // Resolved Percentage
    // =========================

    const resolvedPercentage =
      totalIssues > 0
        ? Math.round((resolved / totalIssues) * 100)
        : 0;

    // =========================
    // Response
    // =========================

    res.status(200).json({
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
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};