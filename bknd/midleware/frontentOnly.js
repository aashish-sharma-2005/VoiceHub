const frontendOnly = (req, res, next) => {
  const allowedOrigin = "http://localhost:5173";

  const origin = req.headers.origin;

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Direct API access is not allowed",
    });
  }

  next();
};

module.exports = frontendOnly;