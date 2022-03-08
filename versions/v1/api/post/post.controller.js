const createError = require("http-errors");
const { getSocket, getIO } = require("../../helpers/socketio");
const Post = require("./post.model");

exports.createPost = (req, res, next) => {
  const newPost = new Post({
    user: req.payload.userId,
    image: req.file.path,
    caption: req.body.captionTxt,
  });
  newPost.save(async (err, post) => {
    if (err) return next(createError(500, err));
    const mPost = await Post.findById(post._id).populate(
      "user",
      "-__v -password"
    );
    getIO().emit("post", { mPost });
    console.log(getSocket());
    getSocket().broadcast.emit("post-notify", {
      msg: `${mPost.user.email} has uploaded a post`,
    });
    res.status(200).json({
      success: true,
      message: "Post created",
    });
  });
};

exports.getPosts = (req, res, next) => {
  Post.find({})
    .populate("user", "-__v -password")
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.status(200).json({
        success: true,
        message: "Get posts success",
        posts,
      });
    });
};
