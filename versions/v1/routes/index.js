var express = require("express");
var router = express.Router();
const authRoute = require("../api/auth/auth.route");
const postRouter = require("../api/post/post.route");

router.use("/auth", authRoute);
router.use("/post", postRouter);
router.use("/notification", require("../api/notification/notification.route"));

module.exports = router;
