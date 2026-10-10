const express = require("express");

const upload = require("../midleware/upload");

const authenticate = require("../midleware/auth");

const authorizeRoles = require("../midleware/role");

const {
  createIssue,
  approveIssue,
  dismissIssue,
  getPublicIssues,
  getManageIssues,
  getMyIssues,
  voteIssue,
} = require("../controler/issue");

const router = express.Router();

// =========================
// Public - Get Approved Issues
// =========================

router.get(
  "/",
  getPublicIssues
);

// =========================
// Admin / Moderator - Get All Issues
// =========================

router.get(
  "/manage",
  authenticate,
  authorizeRoles("moderator", "admin"),
  getManageIssues
);

// =========================
// Logged-in User - Get My Issues
// =========================

router.get(
  "/my",
  authenticate,
  getMyIssues
);

// =========================
// User - Create Issue
// =========================

router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  createIssue
);

// =========================
// Logged-in User - Vote
// =========================

router.patch(
  "/:id/vote",
  authenticate,
  voteIssue
);

// =========================
// Moderator/Admin - Approve
// =========================

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("moderator", "admin"),
  approveIssue
);

// =========================
// Moderator/Admin - Dismiss
// =========================

router.patch(
  "/:id/dismiss",
  authenticate,
  authorizeRoles("moderator", "admin"),
  dismissIssue
);

module.exports = router;