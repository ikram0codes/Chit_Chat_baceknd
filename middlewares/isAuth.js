const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token || token === "") {
      return next(new ErrorHandler("Login To Continue!", 400));
    }
    let decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = await user.findById(decoded._id);
    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

module.exports = isAuth;
