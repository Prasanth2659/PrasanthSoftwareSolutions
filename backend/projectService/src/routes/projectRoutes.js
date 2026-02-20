const express = require('express');
const router = express.Router();
const c = require('../controllers/projectController');

router.get('/',            c.getProjects);
router.post('/',           c.createProject);
router.get('/:id',         c.getProjectById);
router.put('/:id',         c.updateProject);
router.put('/:id/assign',  c.assignEmployees);
router.delete('/:id',      c.deleteProject);

module.exports = router;
