const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        console.log("Login request received:", req.body); 

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ accessToken });
    } catch (err) {
        console.error("Login error:", err); 
        next(err);
    }
};

const refreshToken = (req, res) => {
    console.log("Incoming refresh token:", req.cookies.refreshToken);
    const token = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!token) {
        console.log("No refresh token found!");
        return res.status(401).json({ message: 'Access Denied' });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            console.log("Invalid refresh token:", err);
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }

        console.log("Verified refresh token for user:", user.id);

        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    });
};


module.exports = { register, login, refreshToken };

