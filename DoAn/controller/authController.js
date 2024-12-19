const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require('../service/userService')

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: "Username đã tồn tại" });

        await createUser(email, password);
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "Sai tên đăng nhập" });

        const isValid=user.password===password;
        if (!isValid) return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Đăng nhập thành công", token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    register,
    login
};
