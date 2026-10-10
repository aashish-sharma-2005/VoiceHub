
const express = require("express");

const {
    getDashboardData,
    getAdminDashboardData,
} = require("../controler/dashboard");

const authenticate = require("../midleware/auth");
const authorizeRoles = require("../midleware/role");

const router = express.Router();

// Public community dashboard
router.get("/", getDashboardData);

// Protected admin dashboard
router.get(
    "/admin",
    authenticate,
    authorizeRoles("admin"),
    getAdminDashboardData
);

module.exports = router;
