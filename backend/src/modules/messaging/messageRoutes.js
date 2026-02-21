const express = require('express');
const router  = express.Router();
const c = require('./messageController');
router.get('/conversations', c.getConversations);
router.get('/:userId',       c.getThread);
router.post('/',             c.sendMessage);
module.exports = router;

