const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect("mongodb://localhost:27017/tumblr", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("🔥 ", err.message);
  });
