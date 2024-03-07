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

io.on("connection", (socket) => {
  console.log("Socket is connecting...");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUsers", users);
  });
  socket.on("sendMessage", (data) => {
    if (data.groupId) {
      console.log(data.memberIds);
      const membersActive = users.filter((u) => {
        return data.memberIds.includes(u.userId);
      });
      //   console.log(membersActive);
      if (membersActive && membersActive.length > 0) {
        membersActive.map((ma) => {
          socket.to(ma.socketId).emit("getMessage", {
            senderId: data.senderId,
            senderName: data.senderName,
            groupId: data.groupId,
            createAt: data.time,
            message: {
              text: data.message.text,
              image: data.message.image,
            },
          });
        });
      }
    } else {
      const user = findFriend(data.receiverId);
      if (user !== undefined) {
        socket.to(user.socketId).emit("getMessage", {
          senderId: data.senderId,
          senderName: data.senderName,
          receiverId: data.receiverId,
          createAt: data.time,
          message: {
            text: data.message.text,
            image: data.message.image,
          },
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
