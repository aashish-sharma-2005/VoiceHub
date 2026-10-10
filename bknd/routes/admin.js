const express = require("express");

const {
    getManagedUsers,
    updateUserStatus,
    updateUserRole,
    deleteManagedUser,
} = require("../controler/admin");

// Match these import paths to the folder spelling used by
// your existing working routes/dashboard.js.
const authenticate = require("../midleware/auth");
const authorizeRoles = require("../midleware/role");

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/users", getManagedUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteManagedUser);

module.exports = router;