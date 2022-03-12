const express = require("express");
const { getNotifUser, readNotif } = require("./notification.controller");

const router = express.Router();

router.get("/user/:id", getNotifUser);
router.put("/read", readNotif);

module.exports = router;
