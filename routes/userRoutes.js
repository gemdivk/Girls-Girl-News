const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);

module.exports = router;
