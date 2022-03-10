const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    avatar: {
      type: String,
    },
    displayName: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
    },
    source: {
      type: String,
    },
    resetLinkToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
