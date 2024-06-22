const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 40,
    unique: true,
  },
  name: {
    type: String,
    min: 3,
    max: 25,
    default: "",
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 25,
  },
  avatar: { type: String, default: "" },
  caption: {
    type: String,
    min: 2,
    max: 80,
    default: "",
  },
  bio: { type: String, default: "" },
  private: {
    type: Boolean,
    default: false,
  },
  hideEmail: {
    type: Boolean,
    default: false,
  },
  chats: [
    {
      userId: { type: String },
      username: { type: String },
      avatar: { type: String },
    },
  ],
  notifications: [
    {
      avatar: { type: String },
      message: { type: String },
      createdAt: { type: Date, default: Date.now() },
    },
  ],

  friendRequests: [
    {
      userId: { type: String },
      username: { type: String },
      avatar: { type: String },
    },
  ],
  city: { type: String, max: 20 },
  isProfileSet: {
    type: Boolean,
    default: false,
  },
  friends: [
    {
      userId: { type: String },
      username: { type: String },
      avatar: { type: String },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = new mongoose.model("Users", userSchema);
