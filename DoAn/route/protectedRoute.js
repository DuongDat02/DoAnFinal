const express = require("express");
const authenticateToken= require('../middleware/authenticateToken')

const router = express.Router();

router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Đã truy cập vào endpoint bảo vệ", userEmail: req.user.userEmail });
});

module.exports = router;