
let io;

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

exports.init = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    addUser(socket.userId, socket.id);
    console.log({ users });
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      removeUser(socket.id);
    });
  });
};
