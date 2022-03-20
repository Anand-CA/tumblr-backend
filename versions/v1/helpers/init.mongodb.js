const mongoose = require("mongoose");
const { getPostById } = require("../api/post/post.controller");
const { getIO } = require("../helpers/socketio");

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

// db.once("open", () => {
//   const postCol = db.collection("posts");
//   const postStream = postCol.watch();

//   postStream.on("change", (change) => {
//     console.log(change);

//     if (change.operationType === "insert") {
//       getPostById(change.documentKey._id)
//         .then((post) => {
//           getIO().emit("new-post", post);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }

//     if (change.operationType === "delete") {
//       const deletedId = change.documentKey._id;
//       getIO().emit("delete-post", {
//         postId: deletedId,
//       });
//     }
//   });
// });
