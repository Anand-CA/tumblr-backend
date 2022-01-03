const User = require("./auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error(404, "User not found"));
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) return next(new Error(401, "Invalid password"));
    const newUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwt.sign(newUser, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      data: newUser,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return next(new Error(400, "User already exists"));
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const newUserData = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
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
