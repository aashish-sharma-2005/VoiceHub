const express = require("express");

const { getDashboardData } = require("../controler/dashboard");

const router = express.Router();

router.get("/", getDashboardData);

module.exports = router;