const router = require("express").Router();

const { getFriends, messageUploadDB, getMessage, imageMessageSend, getGroups, getMessageGroup, getGroupMembers } = require("../controllers/messengerController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/get-friends/:id", getFriends);
router.get("/get-groups", authMiddleware, getGroups);
router.post("/send-message", authMiddleware, messageUploadDB);
router.get("/get-message/:id", authMiddleware, getMessage);
router.get("/get-message-group/:id", authMiddleware, getMessageGroup);
router.get("/get-member-group/:id", authMiddleware, getGroupMembers);
router.post("/image-message-send", authMiddleware, imageMessageSend);

module.exports = router;
