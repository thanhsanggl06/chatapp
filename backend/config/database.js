const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Mongodb Connected");
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = dbConnect;
