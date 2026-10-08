const multer = require("multer");

// Store files temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024, // 5 MB per image
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP images are allowed"
        )
      );
    }
  },
});

module.exports = upload;