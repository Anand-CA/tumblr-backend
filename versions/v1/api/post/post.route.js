const express = require("express");
const upload = require("../../configs/multer");
const { verifyAccessToken } = require("../../helpers/jwt_helper");
const { createPost, deletePost, getPosts } = require("./post.controller");
const router = express.Router();

router.post("/create", verifyAccessToken, upload.single("file"), createPost);
router.get("/all", getPosts);
router.delete("/delete/:id", verifyAccessToken, deletePost);

module.exports = router;
