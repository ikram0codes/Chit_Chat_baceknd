const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const Chat = require("../models/chat");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const userController = {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      let usernameTaken = await User.findOne({ username });
      let emailTaken = await User.findOne({ email });
      if (username === "" || email === "" || password === "") {
        return next(new ErrorHandler("Please fill all the Credentials", 400));
      }
      let atr = email.includes("@");
      let com = email.includes(".com");
      let gl = email.includes("gmail");
      if (!com || !atr || !gl) {
        return next(new ErrorHandler("Invalid Email Address", 400));
      }
      if (usernameTaken) {
        return next(new ErrorHandler("Username Already Taken!", 400));
      }
      if (emailTaken) {
        return next(new ErrorHandler("Account Already Registered!", 400));
      }
      if (username.length >= 40) {
        return next(
          new ErrorHandler("Username must be smaller than 20 characters", 400)
        );
      }
      if (username.length <= 3) {
        return next(
          new ErrorHandler("Username must be Greater than 3 characters", 400)
        );
      }

      if (password.length <= 8) {
        return next(
          new ErrorHandler("Password Must be Greater than 8 Characters", 400)
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      let user = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      let token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      return res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 1000 * 24 * 60,
        })
        .status(201)
        .json({ message: "User Registered Successfully!", user: user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("Invalid Credentials, Try Again", 500));
      }
      const matchedPass = await bcrypt.compare(password, user.password);
      if (!matchedPass) {
        return next(new ErrorHandler("Invalid Credentials, Try Again", 500));
      }
      let token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      return res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 1000 * 24 * 60,
        })
        .json({ message: "User Logged In Successfully!", user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async logout(req, res, next) {
    try {
      return res
        .status(200)
        .clearCookie("token")
        .json({ message: "User Logged Out Successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async setProfile(req, res, next) {
    try {
      const { avatar, city, bio, caption, name, hideEmail, private } = req.body;
      let user = await User.findById(req.user._id);
      if (user.isProfileSet) {
        user.avatar = avatar;
        user.bio = bio;
        user.caption = caption;
        user.name = name;
        user.hideEmail = hideEmail;
        user.private = private;
        user.city = city;
        await user.save();
        return res
          .status(200)
          .json({ user, message: "Chit Chat Profile Updated Successfully!" });
      }
      user.avatar = avatar;
      user.bio = bio;
      user.caption = caption;
      user.name = name;
      user.hideEmail = hideEmail;
      user.private = private;
      user.city = city;
      user.isProfileSet = true;
      await user.save();
      return res
        .status(200)
        .json({ user, message: "Chit Chat Profile Created Successfully!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async refresh(req, res, next) {
    try {
      let user = await User.findById(req.user._id);
      let token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      return res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 1000 * 24 * 60,
        })
        .json({
          user: user,
        });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async sendRequest(req, res, next) {
    try {
      const { id } = req.body;
      if (id === req.user.id) {
        return null;
      }
      let user = await User.findById(id);
      let userme = await User.findById(req.user.id);
      let alreadyFriend = user.friends.find((person) => {
        return person.userId == req.user.id;
      });
      let alreadySent = user.friendRequests.find((f) => {
        return f.userId === req.user.id;
      });
      if (alreadySent) {
        return next(new ErrorHandler(`Request Already Sent`, 400));
      }
      if (alreadyFriend) {
        return next(
          new ErrorHandler(`You are Already Friend With ${user.username}`, 400)
        );
      }
      if (user.private === true) {
        await User.updateOne(
          { _id: id },
          {
            $push: {
              friendRequests: {
                username: userme.username,
                userId: userme.id,
                avatar: userme.avatar,
              },
            },
          }
        );
        await User.updateOne(
          { _id: id },
          {
            $push: {
              notifications: {
                avatar: userme.avatar,
                message: `${userme.username} Sent You a Friend Request`,
              },
            },
          }
        );

        return res
          .status(200)
          .json({ message: `Friend Request Send To ${user.username}` });
      }

      await User.updateOne(
        { _id: user._id },
        {
          $push: {
            friends: {
              username: userme.username,
              userId: userme.id,
              avatar: userme.avatar,
            },
          },
        }
      );
      await User.updateOne(
        { _id: userme._id },
        {
          $push: {
            friends: {
              userId: user.id,
              username: user.username,
              avatar: user.avatar,
            },
          },
        }
      );

      let chat = new Chat({
        members: [userme._id.toString(), user._id.toString()],
      });

      await chat.save();

      await User.updateOne(
        { _id: id },
        {
          $push: {
            notifications: {
              avatar: userme.avatar,
              message: `${userme.username} is now you friend`,
            },
          },
        }
      );

      return res
        .status(200)
        .json({ user, message: `You are now Chat with ${user.username}` });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async acceptRequest(req, res, next) {
    try {
      const { id } = req.body;

      let user = await User.findById(id);
      let alreadyFriend = user.friends.find((person) => {
        return person.userId == req.user.id;
      });
      if (alreadyFriend) {
        await User.updateOne(
          { _id: userme._id },
          {
            $pull: {
              friendRequests: {
                userId: id,
                username: user.username,
                avatar: user.avatar,
              },
            },
          }
        );
        return res.status(400).json({
          message: `You are already Friend with ${user.username}`,
        });
      }

      await User.updateOne(
        { _id: user._id },
        {
          $push: {
            friends: {
              userId: req.user.id,
              username: req.user.username,
              avatar: req.user.avatar,
            },
          },
        }
      );
      await User.updateOne(
        { _id: req.user.id },
        {
          $push: {
            friends: {
              userId: user._id,
              username: user.username,
              avatar: user.avatar,
            },
          },
        }
      );
      await User.updateOne(
        { _id: req.user.id },
        {
          $pull: {
            friendRequests: {
              userId: user._id,
              username: user.username,
              avatar: user.avatar,
            },
          },
        }
      );
      let userme = await User.findById(req.user.id);

      let chat = new Chat({ members: [req.user.id, user._id] });

      await chat.save();

      await User.updateOne(
        { _id: id },
        {
          $push: {
            notifications: {
              avatar: userme.avatar,
              message: `${userme.username} has accepted Your Friend Request`,
            },
          },
        }
      );

      return res.status(200).json({
        userme,
        message: `You have accepted ${user.username}'s chat request.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async unfriend(req, res, next) {
    try {
      let { id } = req.body;
      let user = await User.findById(id);

      //Pulling the User from friends Lists
      await User.updateOne(
        { _id: user._id },
        {
          $pull: {
            friends: {
              userId: req.user.id,
              username: req.user.username,
              avatar: req.user.avatar,
            },
          },
        }
      );
      await User.updateOne(
        { _id: req.user._id },
        {
          $pull: {
            friends: {
              userId: user._id,
              username: user.username,
              avatar: user.avatar,
            },
          },
        }
      );
      //Deleteing The Chat Bettween The Users
      await Chat.deleteOne({
        members: [req.user.id.toString(), user._id.toString()],
      });
      return res.status(200).json({
        message: `${user.username} is no longer your friend`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async suggestions(req, res, next) {
    try {
      const { city } = req.params;

      let users = await User.find({
        city: { $regex: city, $options: "i" },
      }).limit();
      users = users.reverse();
      return res.status(200).json({
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      return res.status(200).json({
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async userSug(req, res, next) {
    try {
      let users = await User.find({}).limit(10).sort("-createdAt");
      return res.status(200).json({ users });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async removeNotification(req, res, next) {
    try {
      let { id } = req.params;
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { notifications: { _id: id } } }
      );
      let user = await User.findById(req.user.id);
      return res.status(200).json({ user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async userSearch(req, res, next) {
    try {
      const { username } = req.params;
      const agg = [
        {
          $search: {
            index: "user",
            autocomplete: {
              query: username,
              path: "username",
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 1,
            username: 1,
            avatar: 1,
          },
        },
      ];
      const response = await User.aggregate(agg);
      return res.status(200).json(response);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
};

module.exports = userController;
