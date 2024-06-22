const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
    },
    image: { type: String },
    chatId: { type: String },
    text: { type: String },
    seen: { type: Boolean },

    replyText: { type: String },
    createdAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
