const { model, Schema } = require("mongoose");

const messageSchema = new Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: false,
    },
    message: {
      text: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "group",
      required: false,
    },
    status: {
      type: String,
      default: "unseen",
    },
    recall: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("message", messageSchema);
