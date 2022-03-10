const express = require("express");
const { upload } = require("../../configs/multer");
const { verifyAccessToken } = require("../../helpers/jwt_helper");
const {
  createPost,
  deletePost,
  getPosts,
  likePost,
  dislikePost,
} = require("./post.controller");
const router = express.Router();

router.post("/create", verifyAccessToken, upload.single("file"), createPost);
router.get("/all", getPosts);
router.delete("/delete/:id", verifyAccessToken, deletePost);
router.patch("/like/:id", verifyAccessToken, likePost);
router.patch("/dislike/:id", verifyAccessToken, dislikePost);

module.exports = router;
