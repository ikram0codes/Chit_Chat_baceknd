const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    admin: {
      type: String,
    },
    image: {
      type: String,
    },
    email: { type: String },
    caption: {
      type: String,
    },
    bio: {
      type: String,
    },
    members: {
      type: Array,
    },
    isprivate: {
      type: Boolean,
    },
    chatId: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
