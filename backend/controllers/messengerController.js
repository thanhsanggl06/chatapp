const User = require("../models/authModel");

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
