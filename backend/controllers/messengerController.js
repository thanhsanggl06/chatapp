const User = require("../models/authModel");
const messageModel = require("../models/messageModel");

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

module.exports.messageUploadDB = async (req, res) => {
  const { senderName, receiverId, message } = req.body;
  const senderId = req.myId;
  try {
    const insertMessage = await messageModel.create({
      senderId: senderId,
      senderName: senderName,
      receiverId: receiverId,
      message: {
        text: message,
        image: "",
      },
    });

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
