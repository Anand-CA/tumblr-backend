const express = require("express");
const { login, register } = require("./auth.controller");
const router = express.Router();
const passport = require("passport");
const upload = require("../../configs/multer");
const User = require("./auth.model");
const {
  signAccessToken,
  verifyAccessToken,
} = require("../../helpers/jwt_helper");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
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
});

router.get("/currentuser", verifyAccessToken, (req, res) => {
  User.findById(req.payload.userId)
    .select("-__v -password")
    .then((user) => {
      res.status(200).json({
        success: true,
        message: "Get current user success",
        user,
      });
    });
});

// router.get(
//   "/google/start",
//   passport.authenticate("google", {
//     session: false,
//     scope: ["openid", "profile", "email"],
//   })
// );
// router.get(
//   "/google/redirect",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     signAccessToken(req.user._id).then((t) => {
//       res.redirect(`http://localhost:3000/`);
//       res.status(200).json({
//         success: true,
//         user: req.user,
//         accessToken: t,
//       });
//     });
//   }
// );

module.exports = router;
