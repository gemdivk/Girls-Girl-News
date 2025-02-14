const bcrypt = require('bcrypt');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login"); 
    }

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect("/login"); 
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.redirect("/login"); 
    }
};


const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only!" });
    }
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
