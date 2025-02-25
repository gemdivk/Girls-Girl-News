const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
    let token = req.header("Authorization")?.split(" ")[1] || req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            res.clearCookie("token");
            req.user = null;
        }

        next();
    } catch (error) {
        console.log("❌ Invalid Token:", error.message);
        res.clearCookie("token");
        req.user = null;
        next();
    }
};


const authorizeAdmin = async (req, res, next) => {
    if (!req.user || (req.user.role && req.user.role !== "admin")) {
        console.log("❌ Unauthorized access attempt by:", req.user ? req.user.email : "Unknown");
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
