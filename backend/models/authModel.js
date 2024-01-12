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

module.exports = model("user", registerSchema);
