const express = require("express");
const {
  getNotifUser,
  readNotif,
  deleteNotif,
} = require("./notification.controller");

const router = express.Router();

router.get("/user/:id", getNotifUser);
router.put("/read", readNotif);
router.delete("/delete/:id", deleteNotif);

module.exports = router;
