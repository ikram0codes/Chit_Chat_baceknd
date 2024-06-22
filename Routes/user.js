const express = require("express");
const userController = require("../Controllers/userController");
const isAuth = require("../middlewares/isAuth");
const userRouter = express.Router();

userRouter.post("/register", userController.register);

userRouter.post("/login", userController.login);

userRouter.get("/logout", isAuth, userController.logout);

userRouter.put("/setprofile", isAuth, userController.setProfile);

userRouter.get("/refresh", isAuth, userController.refresh);

userRouter.get("/getuser/:id", isAuth, userController.getUser);

userRouter.get("/suggestions/:city", isAuth, userController.suggestions);

userRouter.get("/notification/:id", isAuth, userController.removeNotification);

userRouter.put("/addfriend", isAuth, userController.sendRequest);

userRouter.put("/unfriend", isAuth, userController.unfriend);

userRouter.put("/acceptrequest", isAuth, userController.acceptRequest);

userRouter.get("/sug", isAuth, userController.userSug);

userRouter.get("/search/:username", userController.userSearch);

module.exports = userRouter;
