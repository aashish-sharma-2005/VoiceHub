const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const issueSchema = new mongoose.Schema(
  {
    // =========================
    // Issue Information
    // =========================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Roads & Transit",
        "Sanitation & Garbage",
        "Environment & Parks",
        "Water & Electricity",
        "Other",
      ],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    // =========================
    // Moderation
    // =========================

    moderationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Dismissed"],
      default: "Pending",
    },

    dismissReason: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // Issue Progress
    // =========================

    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "In Progress",
        "Resolved",
      ],
      default: "Submitted",
    },

    // =========================
    // Community Voting
    // =========================

    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Users who have upvoted
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Users who have downvoted
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;