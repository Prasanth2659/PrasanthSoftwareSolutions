const express = require('express');
const router  = express.Router();
const c = require('./serviceRequestController');
router.get('/',              c.getAll);
router.post('/',             c.create);
router.get('/:id',           c.getById);
router.put('/:id/approve',   c.approve);
router.put('/:id/reject',    c.reject);
module.exports = router;

