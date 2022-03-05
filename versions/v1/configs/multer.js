const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // eslint-disable-next-line no-undef
//     const dirPath = path.join(__dirname, "../../../public/uploads");
//     cb(null, dirPath);
//   },

//   filename: function (req, file, cb) {
//     cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`);
//   },
// });

cloudinary.config({
  cloud_name: "dmuf2mah5",
  api_key: "247842512978931",
  api_secret: "7seFVRibeZ7pZ0LXsHzaJo03Yc4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tumblr-clone",
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
