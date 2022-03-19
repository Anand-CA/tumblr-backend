const express = require("express");
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

router.patch("/like", likeComment);
// router.patch("/unlike");
// router.post("/reply", replyComment);

module.exports = router;
