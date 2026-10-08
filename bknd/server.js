require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/connectDB");

const frontendOnly = require("./midleware/frontentOnly")
const dashboardRoutes = require("./routes/dashboard");
const issueRoutes = require("./routes/issue");
const authRoutes = require("./routes/auth");
const testAuthRoutes = require("./routes/testAuth");
const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(frontendOnly)

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VoiceHub backend is running!",
  });
});
app.use("/api/test-auth", testAuthRoutes);
// Authentication routes
app.use("/api/auth", authRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Issue routes
app.use("/api/issues", issueRoutes);

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`VoiceHub backend running on http://localhost:${PORT}`);
});