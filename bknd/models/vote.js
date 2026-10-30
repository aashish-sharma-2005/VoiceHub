
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
    {
        issue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Issue",
            required: true,
            immutable: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            immutable: true,
        },
        voteType: {
            type: String,
            enum: ["up", "down"],
            required: true,
            immutable: true,
        },
    },
    {
        timestamps: true,
    }
);

// A user can vote only once on a particular issue.
voteSchema.index(
    { issue: 1, user: 1 },
    { unique: true }
);

module.exports = mongoose.model("Vote", voteSchema);
