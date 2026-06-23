const express = require('express');
const router = express.Router();

const {
  getMe,
  updateMe,
  getVendorDashboard
} = require('../controllers/vendorController');

const { protect, isVendorActive } = require('../middlewares/authMiddleware');

// Vendor
router.get('/me', protect, getMe);
router.get('/me/dashboard', protect, getVendorDashboard);
router.put('/me', protect, isVendorActive, updateMe);

module.exports = router;