const router = require("express").Router();

const { userRegister, userLogin, userLogout } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/user-logout", authMiddleware, userLogout);

module.exports = router;
