const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

//Importing Middlewares and Routes
const userRouter = require("./Routes/user");
const chatRouter = require("./Routes/chats");
const groupRouter = require("./Routes/group");

const errorMid = require("./middlewares/errorMid");
const cookieParser = require("cookie-parser");

// User Midlewares And Routes
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true,
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/group", groupRouter);

//Error Middleware
app.use(errorMid);

module.exports = app;
