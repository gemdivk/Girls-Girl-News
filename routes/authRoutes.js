const express = require('express');  
const router = express.Router(); 

const { register, login, refreshToken } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

console.log("Auth routes are being loaded...");

router.post('/test', (req, res) => {
    res.json({ message: "Test route working" });
});

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);

console.log("Auth routes loaded!");  

module.exports = router;
