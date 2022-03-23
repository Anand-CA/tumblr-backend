const createError = require("http-errors");
const Comment = require("./comment.model");
const Post = require("../post/post.model");
const User = require("../auth/auth.model");
const { getIO, getUser } = require("../../helpers/socketio");
const { createNotif } = require("../notification/notification.controller");

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

    const updatedPost = await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    Comment.findById(comment._id)
      .populate("userId")
      .exec(async function (err, comment) {
        if (err) return next(createError(500, err));
        getIO().emit("comment-added", comment);

        const notif = await createNotif({
          user: updatedPost.user,
          msg: `${comment.userId.displayName} commented on your post`,
        });
        if (comment.userId != userId) {
          const socketuser = getUser(updatedPost.user.toString());
          if (socketuser) {
            getIO()
              .to(socketuser.socketId)
              .emit("comment-notify", {
                msg: `${comment.userId.displayName} commented on your post`,
                notif,
              });
          }
        }

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
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $addToSet: { likes: req.payload.userId },
      },
      { new: true }
    );

    await getIO().emit("comment-like", {
      commentId: comment._id,
      userId: req.payload.userId,
      postId: comment.postId,
    });

    if (comment.userId != req.payload.userId) {
      const likePerson = await User.findById(req.payload.userId);
      const notif = await createNotif({
        user: comment.userId,
        msg: `${likePerson.displayName} liked your comment`,
      });

      const socketuser = getUser(comment.userId.toString());
      if (socketuser) {
        getIO()
          .to(socketuser.socketId)
          .emit("comment-like-notify", {
            msg: `${likePerson.displayName} liked your comment`,
            notif,
          });
      }
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(createError(500, err));
  }
};

exports.unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: req.payload.userId },
    });

    await getIO().emit("comment-dislike", {
      commentId: comment._id,
      userId: req.payload.userId,
      postId: comment.postId,
    });

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    next(createError(500, err));
  }
};
