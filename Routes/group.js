const express = require("express");
const groupController = require("../Controllers/groupController");
const isAuth = require("../middlewares/isAuth");

const groupRouter = express.Router();

groupRouter.post("/create", isAuth, groupController.createGroup);

groupRouter.put("/join", isAuth, groupController.joinGroup);

groupRouter.get("/sug", isAuth, groupController.groupSug);

groupRouter.get("/:id", isAuth, groupController.findAllGroups);

groupRouter.get("/single/:id", isAuth, groupController.getSingleGroup);

groupRouter.get("/add/:id/:groupid", isAuth, groupController.addUser);

module.exports = groupRouter;
