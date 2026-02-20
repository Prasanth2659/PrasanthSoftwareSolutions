const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/authController');

router.post('/login',  login);
router.post('/logout', logout);
router.get('/me',      me);   // gateway injects x-user-id

module.exports = router;
