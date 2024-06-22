const Group = require("../models/group");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const Chat = require("../models/chat");

const groupController = {
  async createGroup(req, res, next) {
    const { name, caption, bio, location, isprivate, image } = req.body;
    if (
      name === "" ||
      caption === "" ||
      bio === "" ||
      location === "" ||
      image === ""
    ) {
      return next(new ErrorHandler("Please Fill All The Credentials!"));
    }

    try {
      //   let chat = await Chat.create({ members: req.user.id });
      let group = await Group.create({
        name,
        email: req.user.email,
        admin: req.user.id,
        image,
        caption,
        bio,
        location,
        isprivate: isprivate || false,
      });
      await Group.updateOne(
        { _id: group._id },
        {
          $push: {
            members: {
              userId: req.user.id,
              username: req.user.username,
              avatar: req.user.avatar,
            },
          },
        }
      );
      group = await Group.findById(group.id);

      return res
        .status(200)
        .json({ message: "Group Created Successfully!", group });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },

  async joinGroup(req, res, next) {
    try {
      const { id } = req.body;
      let group = await Group.findById(id);
      let alreadyJoined = group.members.find((person) => {
        return person.userId === req.user.id;
      });
      if (alreadyJoined) {
        return next(
          new ErrorHandler("You Are Already A Member of This Group", 400)
        );
      }
      if (group.isprivate) {
        let user = await User.findById(group.admin);
        await User.updateOne(
          { _id: user._id },
          {
            $push: {
              friendRequests: {
                userId: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar,
              },
            },
          }
        );
        return res.status(200).json({
          message: "Request Sent to Admin",
        });
      }
      //   await Chat.updateOne(
      //     { _id: group.chatId },
      //     { $push: { members: req.user.id } }
      //   );
      await Group.updateOne(
        { _id: group._id },
        {
          $push: {
            memebers: {
              userId: req.user.id,
              username: req.user.username,
              avatar: req.user.avatar,
            },
          },
        }
      );
      return res.status(200).json({
        message: `You are now a member of ${group.name}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async addUser(req, res, next) {
    try {
      const { id, groupid } = req.params;
      let user = await User.findById(id);
      let group = await Group.findById(groupid);
      let alreadyJoined = group.members.find((person) => {
        return person.userId.toString() === user._id.toString();
      });
      if (alreadyJoined) {
        return next(
          new ErrorHandler(
            `${user.username} is already a Member of this ${group.name}`,
            400
          )
        );
      }
      await Group.updateOne(
        { _id: groupid },
        {
          $push: {
            members: {
              userId: id,
              username: user.username,
              avatar: user.avatar,
            },
          },
        }
      );
      return res.status(200).json({
        message: `${user.username} is now a member of  ${group.name}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async findAllGroups(req, res, next) {
    try {
      const { id } = req.params;
      const groups = await Group.find({
        members: {
          $elemMatch: {
            userId: id,
          },
        },
      });
      return res.status(200).json({ groups });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
  async getSingleGroup(req, res, next) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);
      return res.status(200).json({ group });
    } catch (error) {}
  },
  async groupSug(req, res, next) {
    try {
      const groups = await Group.find({
        members: {
          $ne: {
            userId: req.user.id,
          },
        },
      })
        .limit(10)
        .sort("-createdAt");

      return res.status(200).json({ groups: groups });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  },
};

module.exports = groupController;
