const User = require('../models/User');

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const updateUserProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};

module.exports = { getUserProfile, updateUserProfile };
