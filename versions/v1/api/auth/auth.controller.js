const User = require("./auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");

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
