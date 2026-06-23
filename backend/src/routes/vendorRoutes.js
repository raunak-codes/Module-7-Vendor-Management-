const express = require('express');
const router = express.Router();

const {
  getMe,
  updateMe
} = require('../controllers/vendorController');

const { protect, isVendorActive } = require('../middlewares/authMiddleware');

// Vendor
router.get('/me', protect, getMe);
router.put('/me', protect, isVendorActive, updateMe);

module.exports = router;