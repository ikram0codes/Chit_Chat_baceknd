const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");

const chatController = {
  async createChat(req, res, next) {
    try {
      const { firstId, secondId } = req.body;
      let alreadyCreated = await Chat.find({
        members: { $all: [firstId, secondId] },
      });
      if (alreadyCreated) {
        return res
          .status(200)
          .json({ chat: alreadyCreated, message: "Chat Alreay Created" });
      }
      const user = await User.findById(secondId);
      let chat = new Chat({ members: [firstId, secondId] });
      chat = await chat.save();
      return res
        .status(201)
        .json({ chat, message: `You can now chat with ${user.username}` });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async allChats(req, res, next) {
    try {
      const { userId } = req.params;
      const chats = await Chat.find({
        members: { $in: [userId] },
      });
      return res.status(200).json({
        chats: chats.reverse(),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async findSingleChat(req, res, next) {
    try {
      const [secondId, firstId] = req.body;
      const chat = await Chat.findOne({
        members: { $all: [firstId, secondId] },
      });
      return res.status(200).json({
        chat,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async createMessage(req, res, next) {
    try {
      const { senderId, chatId, text, image, replyText, createdAt, seen } =
        req.body;
      let message = await Message.create({
        senderId,
        chatId,
        text,
        image,
        replyText,
        createdAt,
        seen,
      });
      return res.status(200).json({ message });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async getMessage(req, res, next) {
    try {
      const { chatId } = req.params;
      await Message.updateMany({ chatId: chatId }, { $set: { seen: true } });
      let messages = await Message.find({ chatId: chatId });
      return res.status(200).json({ messages });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
};

module.exports = chatController;
