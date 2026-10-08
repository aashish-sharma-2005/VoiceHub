const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // User Information
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // User Role
    // =========================

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },

    // =========================
    // Account Status
    // =========================

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;