const router = require("express").Router();

const { userRegister, userLogin, userLogout, checkVerification, sendVerifyCode, checkVerificationCode } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/check-verification/:id", checkVerification);
router.post("/send-verify-code", authMiddleware, sendVerifyCode);
router.post("/check-verification-code", authMiddleware, checkVerificationCode);
router.post("/user-logout", authMiddleware, userLogout);

module.exports = router;
