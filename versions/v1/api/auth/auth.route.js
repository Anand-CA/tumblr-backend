const express = require("express");
const { login, register } = require("./auth.controller");
const router = express.Router();
const passport = require("passport");
const upload = require("../../configs/multer");

router.post("/login", login);
router.post("/register", upload.single("avatar"), register);

module.exports = router;
