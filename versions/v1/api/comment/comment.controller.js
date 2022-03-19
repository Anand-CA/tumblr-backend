const createError = require("http-errors");
const Comment = require("./comment.model");
const Post = require("../post/post.model");
const { getIO } = require("../../helpers/socketio");

exports.getallComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({});
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    next(createError(500, err));
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { postId, userId, content } = req.body;
    const comment = await Comment.create({
      postId,
      userId,
      content,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    Comment.findById(comment._id)
      .populate("userId")
      .exec(function (err, comment) {
        if (err) return next(createError(500, err));
        getIO().emit("comment-added", comment);
        res.status(200).json({
          success: true,
        });
      });
  } catch (err) {
    next(createError(500, err));
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    await getIO().emit("comment-delete", {
      commentId: comment._id,
      postId: comment.postId,
    });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(createError(500, err));
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { commentId, content } = req.body;
    const comment = await Comment.findByIdAndUpdate(commentId, {
      content,
    });
    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(createError(500, err));
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.body;
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $inc: { likes: 1 },
    });
    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(createError(500, err));
  }
};
