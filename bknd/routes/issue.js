
const express = require("express");

const upload = require("../midleware/upload");
const authenticate = require("../midleware/auth");
const authorizeRoles = require("../midleware/role");

const {
  createIssue,
  deleteIssue, // ADD THIS
  approveIssue,
  dismissIssue,
  getPublicIssues,
  getManageIssues,
  getMyIssues,
  voteIssue,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getMyVotes,
  getIssueStatusManagement,
  updateIssueProgressStatus,
} = require("../controler/issue");
const {
  getSavedIssues,
  saveIssue,
  removeSavedIssue,
} = require("../controler/savedIssue");

const router = express.Router();

// =========================
// Logged-in User - Delete Own Issue
// =========================

router.delete(
  "/:id",
  authenticate,
  deleteIssue
);
// =========================
// Saved Issues
// =========================

router.get(
  "/saved",
  authenticate,
  getSavedIssues
);

router.post(
  "/:id/save",
  authenticate,
  saveIssue
);

router.delete(
  "/:id/save",
  authenticate,
  removeSavedIssue
);

// =========================
// Public - Get Approved Issues
// =========================

router.get("/", getPublicIssues);


// =========================
// Admin - Get Issue Status Data
// =========================

router.get(
  "/status-management",
  authenticate,
  authorizeRoles("admin"),
  getIssueStatusManagement
);


// =========================
// Admin - Update Issue Progress
// =========================

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  updateIssueProgressStatus
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
// One vote per user per issue
// =========================

router.patch(
  "/:id/vote",
  authenticate,
  voteIssue
);


// =========================
// Get Comments
// =========================

router.get(
  "/:id/comments",
  getComments
);


// =========================
// Add Comment
// =========================

router.post(
  "/:id/comments",
  authenticate,
  createComment
);


// =========================
// Edit Own Comment
// =========================

router.patch(
  "/comments/:commentId",
  authenticate,
  updateComment
);


// =========================
// Delete Own Comment
// =========================

router.delete(
  "/comments/:commentId",
  authenticate,
  deleteComment
);

router.get(
  "/my-votes",
  authenticate,
  getMyVotes
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