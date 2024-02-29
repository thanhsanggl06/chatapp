const router = require("express").Router();

const { getFriends } = require("../controllers/messengerController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.get("/get-friends/:id", getFriends);

module.exports = router;
