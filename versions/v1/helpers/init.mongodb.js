const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    "mongodb+srv://anand:anand123@tumblrcluster.6jkrj.mongodb.net/tumblr?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("🔥 ", err.message);
  });

const db = mongoose.connection;

db.once("open", () => {
  const postCol = db.collection("posts");
  const postStream = postCol.watch();

  postStream.on("change", (change) => {
    console.log(change);
  });
});
