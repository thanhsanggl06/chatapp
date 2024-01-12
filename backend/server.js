const express = require("express");
const app = express();
const dotenv = require("dotenv");

const dbConnect = require("./config/database");
const authRouter = require("./routes/authRoute");

dotenv.config({
  path: "backend/config/config.env",
});

app.use("/api", authRouter);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("This is from backend");
});

dbConnect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
