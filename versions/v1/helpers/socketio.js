let io;
let s;

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

exports.init = async (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_BASE_URL,
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    socket.userId = userId;
    s = socket;
    next();
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    addUser(socket.userId, socket.id);
    console.log({ users });
    socket.on("notify-post", (data) => {
      socket.broadcast.emit("post-notify", data);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      removeUser(socket.id);
      console.log({ users });
    });
  });
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

exports.getSocket = () => {
  if (!s) {
    throw new Error("Socket.io not initialized");
  }
  return s;
};
