
const mongoose = require("mongoose");
const SavedIssue = require("../models/saved");
const Issue = require("../models/issue");

// =========================
// Get Logged-in User's Saved Issues
// =========================
const getSavedIssues = async (req, res) => {
  try {
    const savedIssues = await SavedIssue.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "issue",
        match: { moderationStatus: "Approved" },
        populate: {
          path: "createdBy",
          select: "name",
        },
      })
      .lean();

    // Exclude issues that are no longer approved or no longer exist.
    const issues = savedIssues
      .filter((saved) => saved.issue)
      .map((saved) => saved.issue);

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get saved issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved issues",
    });
  }
};

// =========================
// Save an Issue
// =========================
const saveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findOne({
      _id: id,
      moderationStatus: "Approved",
    }).select("_id");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Approved issue not found",
      });
    }

    // $setOnInsert prevents overwriting an existing bookmark.
    await SavedIssue.updateOne(
      { user: userId, issue: issue._id },
      {
        $setOnInsert: {
          user: userId,
          issue: issue._id,
        },
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      saved: true,
      message: "Issue saved successfully",
    });
  } catch (error) {
    // A concurrent request may encounter the unique index.
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Issue is already saved",
      });
    }

    console.error("Save issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save issue",
    });
  }
};

// =========================
// Remove a Saved Issue
// =========================
const removeSavedIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    await SavedIssue.deleteOne({
      user: req.user._id,
      issue: id,
    });

    return res.status(200).json({
      success: true,
      saved: false,
      message: "Issue removed from saved issues",
    });
  } catch (error) {
    console.error("Remove saved issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove saved issue",
    });
  }
};

module.exports = {
  getSavedIssues,
  saveIssue,
  removeSavedIssue,
};
