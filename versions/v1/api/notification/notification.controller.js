const createError = require("http-errors");
const Notification = require("./notification.model");

const getNotifUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifications = await Notification.find({ user: id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

const readNotif = async (req, res, next) => {
  try {
    const notificationIds = req.body.notifications;
    await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { read: true } },
      { multi: true }
    );
    const updatedNotifications = await Notification.find({
      _id: { $in: notificationIds },
    });

    res.json({
      success: true,
      notifications: updatedNotifications,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

const createNotif = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.log(error);
  }
};

const deleteNotif = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({
      success: true,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

module.exports = {
  getNotifUser,
  readNotif,
  createNotif,
  deleteNotif,
};
