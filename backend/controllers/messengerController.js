const User = require("../models/authModel");
const group = require("../models/groupModel");
const messageModel = require("../models/messageModel");
const formidable = require("formidable");
const fs = require("fs");
const AWS = require("aws-sdk");

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

const getLastMessage = async (myId, fdId) => {
  const msg = await messageModel
    .findOne({
      $or: [
        {
          $and: [
            {
              senderId: {
                $eq: myId,
              },
            },
            {
              receiverId: {
                $eq: fdId,
              },
            },
          ],
        },
        {
          $and: [
            {
              senderId: {
                $eq: fdId,
              },
            },
            {
              receiverId: {
                $eq: myId,
              },
            },
          ],
        },
        {
          groupId: {
            $eq: fdId,
          },
        },
      ],
    })
    .sort({
      updatedAt: -1,
    });
  return msg;
};

const DEFAULT_AVATAR_GROUP = "chatggroup.png";

module.exports.getFriends = async (req, res) => {
  try {
    const { id } = req.params;
    let fnd_msg = [];
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendsList = await user.getFriendsList();
    for (let i = 0; i < friendsList.length; i++) {
      let lmsg = await getLastMessage(id, friendsList[i]._id.toString());
      if (!lmsg) {
        lmsg = { createdAt: friendsList[i].createdAt };
      }
      fnd_msg = [
        ...fnd_msg,
        {
          fndInfo: friendsList[i],
          msgInfo: lmsg,
        },
      ];
    }
    res.status(200).json({ success: true, friends: fnd_msg });
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
    let grp_msg = [];
    for (let i = 0; i < groups.length; i++) {
      let lmsg = await getLastMessage(userId, groups[i]._id.toString());
      if (!lmsg) {
        lmsg = { message: { text: "Nhóm được tạo" }, createdAt: groups[i].createdAt };
      }
      grp_msg = [
        ...grp_msg,
        {
          fndInfo: groups[i],
          msgInfo: lmsg,
        },
      ];
    }
    res.status(200).json({ success: true, groups: grp_msg });
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

module.exports.createNewGroup = async (req, res) => {
  try {
    const myId = req.myId;
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({
          error: {
            errorMessage: "Internal Sever Error ",
          },
        });
      }

      const { name, members } = fields;
      const { image } = files;
      let imageName = DEFAULT_AVATAR_GROUP;
      const mem = JSON.parse(members);

      let newMembers = [{ userId: myId.toString(), role: "admin" }, ...mem];

      if (newMembers.length < 3) {
        return res.status(400).json({
          error: {
            errorMessage: "The group must be created from at least 3 members",
          },
        });
      }
      //no file reiceive
      if (Object.keys(files).length === 0) {
        imageName = DEFAULT_AVATAR_GROUP;
        const newGroup = new group({
          name,
          createdBy: myId.toString(),
          members: newMembers,
          image: imageName,
        });
        const response = await newGroup.save();
        return res.status(201).json({ success: true, message: { fndInfo: response, msgInfo: { message: { text: "Nhóm được tạo" }, createdAt: response.createdAt } } });
      } else {
        try {
          AWS.config.update({
            region: process.env.REGION,
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          });
          const s3 = new AWS.S3();

          imageName = Date.now() + image.originalFilename;

          const paramsS3 = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: imageName,
            Body: fs.readFileSync(files.image.filepath),
            ContentType: files.image.mimetype,
          };

          await s3.upload(paramsS3, async (err, data) => {
            //upload fail using default img
            if (err) {
              imageName = "chatggroup.png";
              console.log(err);
            } else {
              const newGroup = new group({
                name,
                createdBy: myId.toString(),
                members: newMembers,
                image: imageName,
              });
              const response = await newGroup.save();
              return res.status(201).json({ success: true, message: { fndInfo: response, msgInfo: { message: { text: "Nhóm được tạo" }, createdAt: response.createdAt } } });
            }
          });
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            error: {
              errorMessage: "Internal Server Error",
            },
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

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
    let getAllMessage = await messageModel.find({
      $or: [
        {
          $and: [
            {
              senderId: {
                $eq: myId,
              },
            },
            {
              receiverId: {
                $eq: fdId,
              },
            },
          ],
        },
        {
          $and: [
            {
              senderId: {
                $eq: fdId,
              },
            },
            {
              receiverId: {
                $eq: myId,
              },
            },
          ],
        },
      ],
    });
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
    let getAllMessage = await messageModel.find({ groupId: { $eq: groupId } });
    // getAllMessage = getAllMessage.filter((m) => m.groupId == groupId); //so sanh tuong doi
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
  const allowedExtensionsRegex = /\.(jpg|jpeg|png|gif|bmp|mp4|avi|mov|wmv|pdf|docx)$/i;
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({
        error: {
          errorMessage: "Internal Server Error",
        },
      });
    }
    const uploadedFile = files.image;

    if (uploadedFile.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "File size cannot be larger than 5Mb",
      });
    }

    if (!allowedExtensionsRegex.test(uploadedFile.originalFilename)) {
      return res.status(400).json({
        success: false,
        message: "File type not support",
      });
    }

    const senderId = req.myId;
    const { senderName, imageName, receiverId, groupId } = fields;
    AWS.config.update({
      region: process.env.REGION,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3();

    //to do upload image to S3
    const paramsS3 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageName,
      Body: fs.readFileSync(files.image.filepath),
      ContentType: files.image.mimetype,
    };
    files.image.originalFilename = imageName;
    try {
      s3.upload(paramsS3, async (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            error: {
              errorMessage: "Image upload fail",
            },
          });
        } else {
          fs.unlinkSync(files.image.filepath);
          let newMessage;
          if (receiverId) {
            newMessage = {
              senderId: senderId,
              senderName: senderName,
              receiverId: receiverId,
              message: {
                text: "",
                image: files.image.originalFilename,
              },
            };
          } else {
            newMessage = {
              senderId: senderId,
              senderName: senderName,
              groupId: groupId,
              message: {
                text: "",
                image: files.image.originalFilename,
              },
            };
          }
          const insertMessage = await messageModel.create(newMessage);
          res.status(201).json({
            success: true,
            message: insertMessage,
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: {
          errorMessage: "Internal Server Error",
        },
      });
    }
  });
};

module.exports.seenMessage = async (req, res) => {
  const messageId = req.body._id;
  await messageModel
    .findByIdAndUpdate(messageId, {
      status: "seen",
    })
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch(() => {
      res.status(500).json({
        error: {
          errorMessage: "Internal Server Error",
        },
      });
    });
};

module.exports.recallMessage = async (req, res) => {
  const messageId = req.body._id;
  await messageModel
    .findByIdAndUpdate(messageId, {
      recall: true,
    })
    .then(() => {
      res.status(200).json({
        success: true,
      });
    })
    .catch(() => {
      res.status(500).json({
        error: {
          errorMessage: "Internal Server Error",
        },
      });
    });
};

module.exports.searchUser = async (req, res) => {
  const myId = req.myId;

  const query = req.query.q;
  try {
    const users = await User.find(
      {
        $and: [
          { _id: { $ne: myId } }, // Exclude the user with the same ID
          {
            $or: [{ username: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
          },
        ],
      },
      { username: 1, email: 1, image: 1 }
    ).limit(5); // Limit to 5 results

    let results = [];

    if (users && users.length > 0) {
      // Lấy danh sách bạn bè của người dùng hiện tại
      const currentUser = await User.findById(myId);
      const friendIds = currentUser.friends.map((friend) => friend.friendId);
      // // Thêm trường statusFriend vào kết quả tìm kiếm
      results = users.map((user) => {
        const friendIndex = friendIds.findIndex((id) => id.equals(user._id));
        const status = friendIndex !== -1 && currentUser.friends[friendIndex] ? currentUser.friends[friendIndex].status : "none";
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          statusFriend: status,
        };
      });
    }

    res.status(200).json({
      users: results,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.addFriend = async (req, res) => {
  try {
    const myId = req.myId;
    const { fdId } = req.params;
    const user = await User.findById(myId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const idExist = user.friends.findIndex((f) => f.friendId.toString() === fdId);
    if (idExist !== -1) {
      return res.status(409).json({ error: "conflict" });
    }

    const response = await user.addFriend(fdId);

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.acceptFriendRequest = async (req, res) => {
  try {
    const myId = req.myId;
    const { fdId } = req.params;

    const user = await User.findByIdAndUpdate(
      myId,
      {
        $set: { "friends.$[elem].status": "accepted" },
      },
      { arrayFilters: [{ "elem.friendId": fdId }] }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.updateOne({ _id: fdId, "friends.friendId": myId }, { $set: { "friends.$.status": "accepted" } });
    const newFd = await User.findById(fdId);
    res.status(200).json({ success: true, message: { fndInfo: newFd, msgInfo: { createdAt: newFd.updatedAt } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        errorMessage: "Internal Server Error",
      },
    });
  }
};

module.exports.getRequestAddFriend = async (req, res) => {
  try {
    const id = req.myId;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendsList = await user.getRequestAddFriend();
    res.status(200).json({ success: true, request: friendsList });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.removeMember = async (req, res) => {
  const { grId, userId } = req.params;
  const myId = req.myId;

  const groupRs = await group.findById(grId);
  if (!groupRs) {
    return res.status(404).json({ message: "Group not found" });
  }

  const adminRole = groupRs.members.filter((m) => m.role === "admin" || m.role === "subadmin").map((m) => m.userId.toString());

  if (adminRole.includes(myId)) {
    groupRs.members = groupRs.members.filter((member) => member.userId.toString() !== userId);
    await groupRs.save();
    return res.status(200).json({ success: true, message: "Remove member success" });
  } else {
    return res.status(403).json({ success: false, message: "Not enough permissions" });
  }
};

module.exports.leaveGroup = async (req, res) => {
  try {
    const { grId } = req.params;
    const myId = req.myId;

    const groupRs = await group.findById(grId);
    if (!groupRs) {
      return res.status(404).json({ message: "Group not found" });
    }
    groupRs.members = groupRs.members.filter((member) => member.userId.toString() !== myId);
    await groupRs.save();
    return res.status(200).json({ success: true, message: "leave group success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.addMembersToGroup = async (req, res) => {
  try {
    const { grId } = req.params;
    const newMembers = req.body;

    const groupRs = await group.findById(grId);
    if (!groupRs) {
      return res.status(404).json({ message: "Group not found" });
    }

    newMembers.map((m) => {
      groupRs.members.push(m);
    });

    const result = await groupRs.save();
    if (result) {
      const gr = await group.findById(grId).populate("members.userId", "username image");
      return res.status(200).json({ success: true, message: "Add members success", members: gr.members });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.disbandGroup = async (req, res) => {
  try {
    const { grId } = req.params;
    const myId = req.myId;

    const groupRs = await group.findById(grId);
    if (!groupRs) {
      return res.status(404).json({ message: "Group not found" });
    }

    const adminRole = groupRs.members.filter((m) => m.role === "admin").map((m) => m.userId.toString());
    if (adminRole.includes(myId)) {
      await group.findByIdAndDelete(grId);
      return res.status(200).json({ success: true, message: "Disband group success" });
    } else {
      return res.status(403).json({ success: false, message: "Not enough permissions" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};

module.exports.promoteToSubAdmin = async (req, res) => {
  try {
    const { grId, userId } = req.params;
    const myId = req.myId;

    const groupRs = await group.findById(grId);
    if (!groupRs) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const adminRole = groupRs.members.filter((m) => m.role === "admin").map((m) => m.userId.toString());

    if (adminRole.includes(myId)) {
      const index = groupRs.members.findIndex((m) => m.userId.toString() === userId);
      if (index >= 0) {
        groupRs.members[index].role = "subadmin";
      } else {
        return res.status(400).json({ success: false, message: "Member does not exist in the group" });
      }
      await groupRs.save();
      return res.status(200).json({ success: true, message: "Promote member to subadmin success" });
    } else {
      return res.status(403).json({ success: false, message: "Not enough permissions" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: {
        errorMessage: "Internal Sever Error ",
      },
    });
  }
};
