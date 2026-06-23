const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, updateVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getVendors);
router.get('/:id', protect, getVendorById);
router.put('/:id', protect, updateVendor);

module.exports = router;
