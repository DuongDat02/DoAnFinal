const express = require("express");
const { register, login } = require('../controller/authController');
const authenticateToken= require('../middleware/authenticateToken')

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Đã truy cập vào endpoint bảo vệ", userId: req.user.userId });
});

module.exports = router;
