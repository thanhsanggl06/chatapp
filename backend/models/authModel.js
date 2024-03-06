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
          status: { type: String, enum: ["pending", "accepted"], default: "pending" },
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
      .select("username image email");
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

module.exports = model("user", registerSchema);
