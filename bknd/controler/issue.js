const Issue = require("../models/issue");
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

    res.status(200).json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get public issues error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};
const createIssue = async (req, res) => {
  const uploadedImages = [];

  try {
    const { title, description, category, location } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "voicehub/issues",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
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

    // Save issue to MongoDB
    const issue = await Issue.create({
      title,
      description,
      category,
      location,

      // Logged-in user who created the issue
      createdBy: req.user._id,

      images: uploadedImages,

      // New issue waits for moderation
      moderationStatus: "Pending",

      // Initial progress status
      status: "Submitted",
    });

    res.status(201).json({
      success: true,
      message:
        "Issue submitted successfully and is waiting for moderation",
      issue,
    });
  } catch (error) {
    console.error("Create issue error:", error);

    // Delete uploaded Cloudinary images if issue creation fails
    if (uploadedImages.length > 0) {
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
    }

    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      error: error.message,
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

    res.status(200).json({
      success: true,
      message: "Issue approved successfully",
      issue,
    });
  } catch (error) {
    console.error("Approve issue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve issue",
      error: error.message,
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

    res.status(200).json({
      success: true,
      message: "Issue dismissed successfully",
      issue,
    });
  } catch (error) {
    console.error("Dismiss issue error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to dismiss issue",
      error: error.message,
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get manage issues error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};
// =========================
// Get My Issues - Logged-in User
// =========================

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get my issues error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your issues",
      error: error.message,
    });
  }
};
module.exports = {
  getMyIssues,
  createIssue,
  approveIssue,
  dismissIssue,
  getPublicIssues,
  getManageIssues
};