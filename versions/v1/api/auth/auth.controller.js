const User = require("./auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const { OAuth2Client } = require("google-auth-library");
const createError = require("http-errors");
const { signAccessToken } = require("../../helpers/jwt_helper");
const { getIO, getUser } = require("../../helpers/socketio");
const { createNotif } = require("../notification/notification.controller");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(404, "User not found"));
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) return next(createHttpError(401, "Incorrect password"));
    const newUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
    const accessToken = jwt.sign(newUser, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      data: { ...newUser, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return next(createHttpError(400, "user already exists"));
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: req.file.path,
      roles: ["user"],
    });
    const newUserData = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      roles: ["user"],
    };
    const accessToken = jwt.sign(newUserData, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      data: newUserData,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.currentUser = (req, res, next) => {
  User.findById(req.payload.userId)
    .select("-__v -password")
    .then((user) => {
      res.status(200).json({
        success: true,
        message: "Get current user success",
        user,
      });
    })
    .catch((err) => next(createError(500, err)));
};

exports.googleAuth = async (req, res, next) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({
      email: payload.email,
      source: "google",
    });
    if (!user) {
      user = await User.create({
        displayName: payload.name,
        email: payload.email,
        avatar: payload.picture,
        source: "google",
      });
    }
    const token = await signAccessToken(user._id);
    res.status(200).json({
      success: true,
      message: "Login success",
      accesstoken: token,
      user,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

exports.followUser = (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.payload;
  if (id === userId) {
    return next(createError(400, "You can't follow yourself"));
  }
  User.findByIdAndUpdate(id, {
    $push: { followers: userId },
  })
    .then((user) => {
      if (!user) {
        return next(createError(404, "User not found"));
      }
      User.findByIdAndUpdate(userId, {
        $push: { following: id },
      })
        .then((user) => {
          if (!user) {
            return next(createError(404, "User not found"));
          }

          createNotif({
            userId: id,
            msg: `${user.displayName} is now following you`,
          });
          const receiver = getUser(id);
          if (receiver) {
            getIO()
              .to(receiver.socketId)
              .emit("follow-notify", {
                msg: `${user.displayName} is now following you`,
              });
          }

          getIO().emit("follow", {
            senderId: userId,
            receiverId: id,
          });
          res.status(200).json({
            success: true,
            message: "User followed",
          });
        })
        .catch((err) => next(createError(500, err)));
    })
    .catch((err) => next(createError(500, err)));
};

exports.unfollowUser = (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.payload;
  User.findByIdAndUpdate(id, {
    $pull: { followers: userId },
  })
    .then((user) => {
      if (!user) {
        return next(createError(404, "User not found"));
      }
      User.findByIdAndUpdate(userId, {
        $pull: { following: id },
      })
        .then((user) => {
          if (!user) {
            return next(createError(404, "User not found"));
          }
          getIO().emit("unfollow", {
            senderId: userId,
            receiverId: id,
          });
          res.status(200).json({
            success: true,
            message: "User unfollowed",
            id: userId,
          });
        })
        .catch((err) => next(createError(500, err)));
    })
    .catch((err) => next(createError(500, err)));
};

exports.getallusers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      message: "Get all users success",
      users,
    });
  } catch (error) {
    next(createHttpError(500, error));
  }
};
