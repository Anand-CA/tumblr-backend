const createError = require("http-errors");
const { getSocket, getIO, s } = require("../../helpers/socketio");
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
    await getIO().emit("post", { mPost });
    res.status(200).json({
      success: true,
      message: "Post created",
      user: {
        email: mPost.user.email,
      },
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

exports.deletePost = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then((post) => {
      if (!post) {
        return next(createError(404, "Post not found"));
      }
      getIO().emit("post-delete", { post });
      res.status(200).json({
        success: true,
        message: "Post deleted",
      });
    })
    .catch((err) => next(createError(500, err)));
};
