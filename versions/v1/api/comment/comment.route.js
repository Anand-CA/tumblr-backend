const express = require("express");
const { verifyAccessToken } = require("../../helpers/jwt_helper");
const router = express.Router();
const {
  getallComments,
  unlikeComment,
  addComment,
  deleteComment,
  updateComment,
  likeComment,
} = require("./comment.controller");

router.get("/all", getallComments);
router.post("/add", addComment);
router.delete("/delete/:id", deleteComment);
router.post("/update", updateComment);
router.patch("/like/:commentId", verifyAccessToken, likeComment);
router.patch("/dislike/:commentId", verifyAccessToken, unlikeComment);
// router.post("/reply", replyComment);

module.exports = router;
