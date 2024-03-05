const router = require("express").Router();

const { getFriends, messageUploadDB, getMessage } = require("../controllers/messengerController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/get-friends/:id", getFriends);
router.post("/send-message", authMiddleware, messageUploadDB);
router.get("/get-message/:id", authMiddleware, getMessage);

module.exports = router;
