const express = require('express');
const router = express.Router();
const { login, me, logout } = require('./authController');
const { verifyToken } = require('../../middlewares/auth');

router.post('/login',  login);
router.post('/logout', verifyToken, logout);
router.get('/me',      verifyToken, me);

module.exports = router;


