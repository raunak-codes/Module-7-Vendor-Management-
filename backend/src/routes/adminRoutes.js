const express = require('express');
const router = express.Router();
const { getAllVendors, getVendorById, getPendingVendors, approveVendor, rejectVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/vendors', protect, authorize('ADMIN'), getAllVendors);
router.get('/vendors/pending', protect, authorize('ADMIN'), getPendingVendors);
router.get('/vendors/:vendorId', protect, authorize('ADMIN'), getVendorById);
router.put('/vendors/:vendorId/approve', protect, authorize('ADMIN'), approveVendor);
router.put('/vendors/:vendorId/reject', protect, authorize('ADMIN'), rejectVendor);

module.exports = router;
