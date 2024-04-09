const { model, Schema } = require("mongoose");

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: [
        {
          _id: false,
          userId: { type: Schema.Types.ObjectId, ref: "user" },
          role: { type: String, enum: ["admin", "member", "subadmin"], default: "member" },
        },
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = model("group", groupSchema);
