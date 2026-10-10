
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/connectDB");

const dashboardRoutes = require("./routes/dashboard");
const issueRoutes = require("./routes/issue");
const authRoutes = require("./routes/auth");
const testAuthRoutes = require("./routes/testAuth");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend health-check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VoiceHub backend is running!",
  });
});

// API routes
app.use("/api/test-auth", testAuthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", require("./routes/admin"));

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`VoiceHub backend running on http://localhost:${PORT}`);
});
