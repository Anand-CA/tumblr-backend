const createError = require("http-errors");
const { getIO, getUser, users } = require("../../helpers/socketio");
const Post = require("./post.model");
const User = require("../auth/auth.model");
const { cloudinary } = require("../../configs/multer");
const { createNotif } = require("../notification/notification.controller");

exports.createPost = async (req, res, next) => {
  if (req.body.postType === "text") {
    const newPost = new Post({
      user: req.payload.userId,
      image: {
        url: req.body.imageUrl,
      },
      caption: req.body.captionTxt,
    });
    newPost.save(async (err, post) => {
      if (err) return next(createError(500, err));
      const mPost = await Post.findById(post._id).populate(
        "user",
        "-__v -password"
      );

      getIO().emit("post-create", mPost);

      users.forEach((user) => {
        if (user.id !== req.payload.userId) {
          getIO()
            .to(user.socketId)
            .emit(
              "post-create-notify",
              `${mPost.user.displayName} posted a new post`
            );
        }
      });

      res.status(200).json({
        success: true,
        message: "Post created",
      });
    });
  } else {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tumblr-clone",
      transformation: [{ width: 600, crop: "scale" }, { quality: "auto" }],
    });

    const newPost = new Post({
      user: req.payload.userId,
      image: {
        url: result.url,
        public_id: result.public_id,
      },
      caption: req.body.captionTxt,
    });
    newPost.save(async (err, post) => {
      if (err) return next(createError(500, err));
      const mPost = await Post.findById(post._id).populate(
        "user",
        "-__v -password"
      );

      getIO().emit("post-create", mPost);

      users.forEach((user) => {
        if (user.userId !== req.payload.userId) {
          getIO()
            .to(user.socketId)
            .emit(
              "post-create-notify",
              `${mPost.user.displayName} posted a new post`
            );
        }
      });

      res.status(200).json({
        success: true,
        message: "Post created",
      });
    });
  }
};

exports.getPosts = (req, res, next) => {
  Post.find({})
    .populate("user", "-__v -password")
    .populate({
      path: "comments",
      populate: {
        path: "userId",
        model: "User",
        select: "-__v -password",
      },
      options: {
        sort: {
          createdAt: -1,
        },
      },
    })
    // sort comments array in descending order
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.status(200).json({
        success: true,
        message: "Get posts success",
        posts,
      });
    })
    .catch((err) => next(createError(500, err)));
};

exports.getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("user", "-__v -password");
    return post;
  } catch (error) {
    console.log(error);
  }
};

exports.deletePost = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then((post) => {
      if (!post) {
        return next(createError(404, "Post not found"));
      }
      cloudinary.uploader.destroy(post.image.public_id, (err, result) => {
        if (err) return next(createError(500, err));
      });
      getIO().emit("post-delete", { postId: post._id });
      res.status(200).json({
        success: true,
        message: "Post deleted",
      });
    })
    .catch((err) => next(createError(500, err)));
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError(404, "Post not found"));
    const user = await User.findById(req.payload.userId);
    if (!user) return next(createError(404, "User not found"));
    const newPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: { likes: user._id },
      },
      { new: true }
    ).populate("user", "-__v -password");

    const notif = await createNotif({
      user: newPost.user._id,
      msg: `${user.displayName} liked your post`,
    });

    const socketUser = getUser(newPost.user._id.toString());

    if (socketUser && socketUser.userId !== req.payload.userId) {
      getIO()
        .to(socketUser.socketId)
        .emit("post-like-notify", {
          msg: `${user.displayName} liked your post`,
          notif,
        });
    }

    getIO().emit("likesCount", {
      likesCount: newPost.likes.length,
    });

    res.status(200).json({
      success: true,
      message: "Post liked",
      userId: user._id,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

exports.dislikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(createError(404, "Post not found"));
    const user = await User.findById(req.payload.userId);
    if (!user) return next(createError(404, "User not found"));
    const newPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: user._id },
      },
      { new: true }
    );
    getIO().emit("likesCount", {
      likesCount: newPost.likes.length,
    });
    res.status(200).json({
      success: true,
      message: "Post disliked",
      userId: user._id,
    });
  } catch (error) {
    next(createError(500, error));
  }
};
