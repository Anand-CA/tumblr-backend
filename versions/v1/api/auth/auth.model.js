const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
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
