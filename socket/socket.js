const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];
const addUser = (userId, socketId, userInfo) => {
  const checkUser = users.some((u) => u.userId === userId);
  if (!checkUser) {
    users.push({ userId, socketId, userInfo });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("Socket is connecting...");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUsers", users);
  });
  socket.on("disconnect", () => {
    console.log("user disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
