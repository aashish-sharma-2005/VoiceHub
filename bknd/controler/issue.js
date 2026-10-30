
const mongoose = require("mongoose");
const Issue = require("../models/issue");
const Vote = require("../models/vote");
const Comment = require("../models/comment");
const SavedIssue = require("../models/saved");
const cloudinary = require("../config/cloudinary");

// =========================
// Get Public Issues
// =========================

const getPublicIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      moderationStatus: "Approved",
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get public issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};

// =========================
// Create Issue
// =========================

const createIssue = async (req, res) => {
  const uploadedImages = [];

  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "voicehub/issues",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      createdBy: req.user._id,
      images: uploadedImages,
      moderationStatus: "Pending",
      status: "Submitted",
    });

    return res.status(201).json({
      success: true,
      message:
        "Issue submitted successfully and is waiting for moderation",
      issue,
    });
  } catch (error) {
    console.error("Create issue error:", error);

    for (const image of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cleanupError) {
        console.error(
          `Failed to delete Cloudinary image ${image.publicId}:`,
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create issue",
    });
  }
};

// =========================
// Approve Issue
// =========================

const approveIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (issue.moderationStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Issue is already approved",
      });
    }

    if (issue.moderationStatus === "Dismissed") {
      return res.status(400).json({
        success: false,
        message: "Dismissed issue cannot be approved",
      });
    }

    issue.moderationStatus = "Approved";
    issue.reviewedAt = new Date();

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue approved successfully",
      issue,
    });
  } catch (error) {
    console.error("Approve issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve issue",
    });
  }
};

// =========================
// Dismiss Issue
// =========================

const dismissIssue = async (req, res) => {
  try {
    const { reason } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (issue.moderationStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Approved issue cannot be dismissed",
      });
    }

    if (issue.moderationStatus === "Dismissed") {
      return res.status(400).json({
        success: false,
        message: "Issue is already dismissed",
      });
    }

    issue.moderationStatus = "Dismissed";
    issue.dismissReason = reason || "No reason provided";
    issue.reviewedAt = new Date();

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue dismissed successfully",
      issue,
    });
  } catch (error) {
    console.error("Dismiss issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to dismiss issue",
    });
  }
};

// =========================
// Get Issues for Admin / Moderator
// =========================

const getManageIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate("createdBy", "name email")
      .select("-upvotedBy -downvotedBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get manage issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};

// =========================
// Get My Issues
// =========================

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "name email")
      .select("-upvotedBy -downvotedBy")
      .sort({ createdAt: -1 });

    const formattedIssues = issues.map((issue) => ({
      ...issue.toObject(),
      userVote: "none",
    }));

    return res.status(200).json({
      success: true,
      total: formattedIssues.length,
      issues: formattedIssues,
    });
  } catch (error) {
    console.error("Get my issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your issues",
    });
  }
};

// =========================
// Delete Own Issue
// =========================

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const existingIssue = await Issue.findById(id).select(
      "createdBy images"
    );

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Users can delete only their own issues.
    if (existingIssue.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own issues",
      });
    }

    // Check ownership again when deleting the document.
    const deletedIssue = await Issue.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found or already deleted",
      });
    }

    // Remove votes, comments, and saved bookmarks.
    const cleanupNames = ["votes", "comments", "saved bookmarks"];

    const cleanupResults = await Promise.allSettled([
      Vote.deleteMany({ issue: id }),
      Comment.deleteMany({ issueId: id }),
      SavedIssue.deleteMany({ issue: id }),
    ]);

    cleanupResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Issue ${cleanupNames[index]} cleanup failed:`,
          result.reason
        );
      }
    });

    // Remove all uploaded images from Cloudinary.
    const images = deletedIssue.images || [];

    const imageCleanupResults = await Promise.allSettled(
      images
        .filter((image) => image.publicId)
        .map((image) =>
          cloudinary.uploader.destroy(image.publicId, {
            resource_type: "image",
          })
        )
    );

    imageCleanupResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("Cloudinary image cleanup failed:", result.reason);
      }
    });

    const cleanupFailed = cleanupResults.some(
      (result) => result.status === "rejected"
    );

    const imageCleanupFailed = imageCleanupResults.some(
      (result) => result.status === "rejected"
    );

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
      issueId: id,
      cleanupWarning:
        cleanupFailed || imageCleanupFailed
          ? "Issue deleted, but some related data or images may require cleanup."
          : undefined,
    });
  } catch (error) {
    console.error("Delete issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete issue",
    });
  }
};

// =========================
// Vote on Issue
// Separate Vote collection
// One permanent vote per user per issue
// =========================

const voteIssue = async (req, res) => {
  let createdVote = null;
  let countsUpdated = false;

  try {
    const { vote } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    if (!["up", "down"].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: "Vote must be either 'up' or 'down'",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id).select("moderationStatus");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (issue.moderationStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved issues can be voted on",
      });
    }

    try {
      createdVote = await Vote.create({
        issue: id,
        user: userId,
        voteType: vote,
      });
    } catch (error) {
      if (error.code === 11000) {
        const existingVote = await Vote.findOne({
          issue: id,
          user: userId,
        }).select("voteType");

        return res.status(409).json({
          success: false,
          alreadyVoted: true,
          message: "You have already voted on this issue.",
          userVote: existingVote?.voteType || "none",
        });
      }

      throw error;
    }

    const countField = vote === "up" ? "upvotes" : "downvotes";

    const updatedIssue = await Issue.findOneAndUpdate(
      {
        _id: id,
        moderationStatus: "Approved",
      },
      {
        $inc: { [countField]: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id upvotes downvotes");

    if (!updatedIssue) {
      await Vote.deleteOne({ _id: createdVote._id });
      createdVote = null;

      return res.status(400).json({
        success: false,
        message: "Issue is no longer available for voting",
      });
    }

    countsUpdated = true;

    return res.status(201).json({
      success: true,
      message:
        vote === "up"
          ? "Upvote saved successfully"
          : "Downvote saved successfully",
      issue: {
        _id: updatedIssue._id,
        upvotes: updatedIssue.upvotes,
        downvotes: updatedIssue.downvotes,
        userVote: vote,
      },
      vote: {
        _id: createdVote._id,
        issue: createdVote.issue,
        user: createdVote.user,
        voteType: createdVote.voteType,
      },
    });
  } catch (error) {
    console.error("Vote issue error:", error);

    if (createdVote && !countsUpdated) {
      try {
        await Vote.deleteOne({ _id: createdVote._id });
      } catch (cleanupError) {
        console.error("Vote cleanup error:", cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit vote",
    });
  }
};

// =========================
// Get My Votes
// =========================

const getMyVotes = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedVotes = await Vote.find({
      user: userId,
    })
      .select("issue voteType")
      .lean();

    const votes = savedVotes.map((vote) => ({
      issueId: vote.issue.toString(),
      voteType: vote.voteType,
    }));

    return res.status(200).json({
      success: true,
      total: votes.length,
      votes,
    });
  } catch (error) {
    console.error("Get my votes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your votes",
    });
  }
};

// =========================
// Get Comments on Public Issues
// =========================

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

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
        message: "Public issue not found",
      });
    }

    const comments = await Comment.find({
      issueId: issue._id,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

// =========================
// Create Comment
// =========================

const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 2000 characters",
      });
    }

    const issue = await Issue.findOne({
      _id: id,
      moderationStatus: "Approved",
    }).select("_id");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Public issue not found",
      });
    }

    const comment = await Comment.create({
      issueId: issue._id,
      userId: req.user._id,
      text: text.trim(),
    });

    await comment.populate("userId", "name");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

// =========================
// Edit Own Comment
// =========================

const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 2000 characters",
      });
    }

    if (!mongoose.isValidObjectId(req.params.commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own comment",
      });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate("userId", "name");

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

// =========================
// Delete Own Comment
// =========================

const deleteComment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comment",
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

// =========================
// Admin Issue Status Management
// =========================

const getIssueStatusManagement = async (req, res) => {
  try {
    const issues = await Issue.find({
      moderationStatus: "Approved",
    })
      .populate("createdBy", "name email")
      .select("-upvotedBy -downvotedBy")
      .sort({ updatedAt: -1 });

    const stats = {
      total: issues.length,
      submitted: issues.filter(
        (issue) => issue.status === "Submitted"
      ).length,
      underReview: issues.filter(
        (issue) => issue.status === "Under Review"
      ).length,
      inProgress: issues.filter(
        (issue) => issue.status === "In Progress"
      ).length,
      resolved: issues.filter(
        (issue) => issue.status === "Resolved"
      ).length,
    };

    return res.status(200).json({
      success: true,
      message: "Issue status data fetched successfully",
      stats,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get issue status management error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issue status data",
    });
  }
};

// =========================
// Update Issue Progress Status
// =========================

const updateIssueProgressStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "Submitted",
      "Under Review",
      "In Progress",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue progress status",
        allowedStatuses,
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (issue.moderationStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved issues can have their progress updated",
      });
    }

    if (issue.status === status) {
      return res.status(200).json({
        success: true,
        message: "Issue already has this status",
        issue,
      });
    }

    issue.status = status;
    await issue.save();

    return res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      issue,
    });
  } catch (error) {
    console.error("Update issue progress status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update issue status",
    });
  }
};

// =========================
// Export Controllers
// =========================

module.exports = {
  getMyIssues,
  getMyVotes,
  createIssue,
  deleteIssue,
  approveIssue,
  dismissIssue,
  getPublicIssues,
  getManageIssues,
  voteIssue,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getIssueStatusManagement,
  updateIssueProgressStatus,
};
