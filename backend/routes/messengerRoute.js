const router = require("express").Router();

const {
  getFriends,
  messageUploadDB,
  getMessage,
  imageMessageSend,
  getGroups,
  getMessageGroup,
  getGroupMembers,
  seenMessage,
  searchUser,
  addFriend,
  acceptFriendRequest,
  getRequestAddFriend,
  createNewGroup,
  removeMember,
  leaveGroup,
  addMembersToGroup,
  recallMessage,
  disbandGroup,
  promoteToSubAdmin,
} = require("../controllers/messengerController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/get-friends/:id", authMiddleware, getFriends);
router.get("/get-groups", authMiddleware, getGroups);
router.post("/send-message", authMiddleware, messageUploadDB);
router.get("/get-message/:id", authMiddleware, getMessage);
router.get("/get-message-group/:id", authMiddleware, getMessageGroup);
router.get("/get-member-group/:id", authMiddleware, getGroupMembers);
router.post("/image-message-send", authMiddleware, imageMessageSend);
router.post("/seen-message", authMiddleware, seenMessage);
router.post("/recall-message", authMiddleware, recallMessage);
router.post("/add-friend/:fdId", authMiddleware, addFriend);
router.post("/accept-friend-request/:fdId", authMiddleware, acceptFriendRequest);
router.get("/get-requestAddFriends", authMiddleware, getRequestAddFriend);
router.get("/search", authMiddleware, searchUser);
router.post("/create-new-group", authMiddleware, createNewGroup);
router.delete("/group/:grId/remove-member/:userId", authMiddleware, removeMember);
router.delete("/leave-group/:grId", authMiddleware, leaveGroup);
router.post("/group/:grId/add-members", authMiddleware, addMembersToGroup);
router.post("/group/:grId/promote-subadmin/:userId", authMiddleware, promoteToSubAdmin);
router.delete("/disband-group/:grId", authMiddleware, disbandGroup);

module.exports = router;
