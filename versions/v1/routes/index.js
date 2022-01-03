var express = require("express");
var router = express.Router();
const authRoute = require("../api/auth/auth.route");

router.use("/auth", authRoute);

module.exports = router;
