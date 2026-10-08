const express = require("express");

const authenticate = require("../midleware/auth");
const authorizeRoles = require("../midleware/role");

const router = express.Router();

// Any logged-in user
router.get("/user", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

// Moderator or Admin
router.get(
  "/moderator",
  authenticate,
  authorizeRoles("moderator", "admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "You have moderator permission",
      user: req.user,
    });
  }
);

// Admin only
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "You have admin permission",
      user: req.user,
    });
  }
);

module.exports = router;