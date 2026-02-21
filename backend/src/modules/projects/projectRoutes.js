const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const c = require('./projectController');

// Configure Multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save locally to the projectService/uploads directory
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Append timestamp to prevent name collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/',            c.getProjects);
router.post('/',           c.createProject);
router.get('/:id',         c.getProjectById);
router.put('/:id',         c.updateProject);
router.put('/:id/assign',  c.assignEmployees);
router.delete('/:id',      c.deleteProject);

// Bonus Features
router.post('/:id/files',  upload.array('files', 10), c.uploadFiles);
router.put('/:id/payments', c.addPayment);

// Phase 8: Razorpay Integration
router.post('/:id/razorpay-order', c.createRazorpayOrder);
router.post('/:id/razorpay-verify', c.verifyRazorpayPayment);

module.exports = router;

