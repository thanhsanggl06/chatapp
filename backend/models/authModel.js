const { model, Schema } = require("mongoose");

const registerSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    image: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    friends: {
      type: [
        {
          _id: false,
          friendId: { type: Schema.Types.ObjectId, ref: "user" },
          status: { type: String, enum: ["pending", "accepted", "request"], default: "pending" },
        },
      ],
      default: [], // Mảng rỗng là giá trị mặc định
    },
  },
  { timestamps: true }
);

// Middleware to convert birthday from string to timestamp
registerSchema.pre("save", function (next) {
  // 'this' refers to the current document being saved
  if (this.birthday && typeof this.birthday === "string") {
    // Convert the string to a Date object
    this.birthday = new Date(this.birthday);
  }
  next();
});

registerSchema.methods.getFriendsList = async function () {
  try {
    const friendIds = this.friends.map((friend) => friend.friendId);

    const friendsList = await this.model("user")
      .find({ _id: { $in: friendIds } })
      .select("_id username image email createdAt");
    const acceptedFriends = this.friends.filter((friend) => friend.status === "accepted");

    const finalList = acceptedFriends.map((friend) => {
      const friendInfo = friendsList.find((user) => user._id.toString() === friend.friendId.toString());
      return friendInfo;
    });

    return finalList;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting friends list");
  }
};

registerSchema.methods.getRequestAddFriend = async function () {
  try {
    const friendIds = this.friends.filter((friend) => friend.status === "pending").map((friend) => friend.friendId);

    const requestFriendsList = await this.model("user")
      .find({ _id: { $in: friendIds } })
      .select("_id username image email createdAt");

    return requestFriendsList;
  } catch (error) {
    console.error(error);
    throw new Error("Error getting friends list");
  }
};

registerSchema.methods.addFriend = async function (friendId) {
  try {
    const senderUserId = this._id; // ID của người gửi
    const senderFriend = {
      friendId: friendId,
      status: "request",
    };

    // Thêm người bạn với status "request" cho người gửi
    this.friends.push(senderFriend);

    // Tìm người nhận và thêm người gửi vào danh sách bạn bè của họ với status "pending"
    const recipientUser = await this.model("user").findById(friendId);
    if (recipientUser) {
      const recipientFriend = {
        friendId: senderUserId,
        status: "pending",
      };
      recipientUser.friends.push(recipientFriend);
      await recipientUser.save();
    } else {
      throw new Error("Recipient user not found.");
    }

    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
};

module.exports = model("user", registerSchema);
