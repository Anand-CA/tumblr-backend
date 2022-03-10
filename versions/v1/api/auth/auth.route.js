const express = require("express");
const {
  followUser,
  unfollowUser,
  googleAuth,
  currentUser,
} = require("./auth.controller");
const router = express.Router();
const upload = require("../../configs/multer");
const { verifyAccessToken } = require("../../helpers/jwt_helper");

router.post("/google", googleAuth);

router.get("/currentuser", verifyAccessToken, currentUser);

router.patch("/follow/:id", verifyAccessToken, followUser);
router.patch("/unfollow/:id", verifyAccessToken, unfollowUser);

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
