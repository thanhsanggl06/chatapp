const User = require("../models/authModel");
const group = require("../models/groupModel");
const messageModel = require("../models/messageModel");
const formidable = require("formidable");
const fs = require("fs");

module.exports.getFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendsList = await user.getFriendsList();
    res.status(200).json({ success: true, friends: friendsList });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.getGroups = async (req, res) => {
  try {
    const userId = req.myId;
    const groups = await group.find({ "members.userId": userId }).exec();
    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const g = await group.findById(id).populate("members.userId", "username image");
    res.status(200).json({ success: true, members: g.members });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

// const newGroup = new group({
//   name: "test",
//   createdBy: "65b0a6707ac77151a83f6512",
//   members: [
//     { userId: "65b0a6707ac77151a83f6512", role: "admin" },
//     { userId: "65b0b35dc176625d5baea477", role: "member" },
//     { userId: "65b0b3b5c176625d5baea47a", role: "member" },
//   ],
//   image: "https://banner2.cleanpng.com/20180329/bcw/kisspng-computer-icons-online-chat-chat-room-group-5abcf76914f315.2847498915223335450858.jpg",
// });

// await newGroup.save();

module.exports.messageUploadDB = async (req, res) => {
  const { senderName, receiverId, message, groupId, senderAvatar } = req.body;
  const senderId = req.myId;
  try {
    let newMessage;
    if (receiverId) {
      newMessage = {
        senderId: senderId,
        senderName: senderName,
        receiverId: receiverId,
        message: {
          text: message,
          image: "",
        },
      };
    } else {
      newMessage = {
        senderId: senderId,
        senderName: senderName,
        groupId: groupId,
        message: {
          text: message,
          image: "",
        },
      };
    }

    const insertMessage = await messageModel.create(newMessage);

    res.status(201).json({
      success: true,
      message: insertMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.getMessage = async (req, res) => {
  const myId = req.myId; // myId from middleware
  const fdId = req.params.id;
  try {
    let getAllMessage = await messageModel.find({});
    getAllMessage = getAllMessage.filter((m) => (m.senderId === myId && m.receiverId === fdId) || (m.senderId === fdId && m.receiverId === myId));
    res.status(200).json({
      success: true,
      message: getAllMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.getMessage = async (req, res) => {
  const myId = req.myId; // myId from middleware
  const fdId = req.params.id;
  try {
    let getAllMessage = await messageModel.find({});
    getAllMessage = getAllMessage.filter((m) => (m.senderId === myId && m.receiverId === fdId) || (m.senderId === fdId && m.receiverId === myId));
    res.status(200).json({
      success: true,
      message: getAllMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.getMessageGroup = async (req, res) => {
  const groupId = req.params.id;
  try {
    let getAllMessage = await messageModel.find({});
    getAllMessage = getAllMessage.filter((m) => m.groupId == groupId); //so sanh tuong doi
    res.status(200).json({
      success: true,
      message: getAllMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.imageMessageSend = async (req, res) => {
  const form = formidable();

  form.parse(req, (err, fields, files) => {
    const senderId = req.myId;
    const { senderName, imageName, receiverId } = fields;
    //to do upload image to S3
    const newPath = __dirname + `../../../frontend/public/image/${imageName}`;
    files.image.originalFilename = imageName;

    try {
      fs.copyFile(files.image.filepath, newPath, async (err) => {
        //upload fail
        if (err) {
          res.status(500).json({
            error: {
              errorMessage: "Image upload fail",
            },
          });
        }
        // upload success
        else {
          const insertMessage = await messageModel.create({
            senderId: senderId,
            senderName: senderName,
            receiverId: receiverId,
            message: {
              text: "",
              image: files.image.originalFilename,
            },
          });

          res.status(201).json({
            success: true,
            message: insertMessage,
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        error: {
          errorMessage: "Internal Server Error",
        },
      });
    }
  });
};
