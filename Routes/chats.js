const express = require("express");
const chatController = require("../Controllers/chatController");
const isAuth = require("../middlewares/isAuth");

const chatRouter = express.Router();

chatRouter.post("/create", isAuth, chatController.createChat);

chatRouter.post("/message", isAuth, chatController.createMessage);

chatRouter.get("/messages/:chatId", isAuth, chatController.getMessage);

chatRouter.get("/allchats/:userId", isAuth, chatController.allChats);

chatRouter.get("/:senderId/:reciverId", isAuth, chatController.findSingleChat);

module.exports = chatRouter;
