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

const findFriend = (id) => {
  return users.find((u) => u.userId === id);
};

const userLogout = (userId) => {
  users = users.filter((u) => u.userId !== userId);
};

io.on("connection", (socket) => {
  // console.log("Socket is connecting...");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUsers", users);
  });
  socket.on("sendMessage", (data) => {
    if (data.groupId) {
      const membersActive = users.filter((u) => {
        return data.memberIds.includes(u.userId);
      });
      //   console.log(membersActive);
      if (membersActive && membersActive.length > 0) {
        membersActive.map((ma) => {
          socket.to(ma.socketId).emit("getMessage", data);
        });
      }
    } else {
      const user = findFriend(data.receiverId);
      if (user !== undefined) {
        socket.to(user.socketId).emit("getMessage", data);
      }
    }
  });

  socket.on("typingMessage", (data) => {
    const user = findFriend(data.receiverId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("typingMessageGet", {
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.msg,
      });
    }
  });

  socket.on("messageSeen", (msg) => {
    const user = findFriend(msg.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("msgSeenResponse", msg);
    }
  });

  socket.on("callUser", (data) => {
    const user = findFriend(data.userToCall);
    if (user !== undefined) {
      io.to(user.socketId).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    }
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("logout", (userId) => {
    userLogout(userId);
    io.emit("getUsers", users);
  });

  socket.on("disconnect", () => {
    // console.log("user disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
