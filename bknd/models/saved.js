
const mongoose = require("mongoose");

const savedIssueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user cannot save the same issue more than once.
savedIssueSchema.index(
  { user: 1, issue: 1 },
  { unique: true }
);

module.exports = mongoose.model("SavedIssue", savedIssueSchema);