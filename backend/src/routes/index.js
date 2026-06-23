const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vendorRoutes = require('./vendorRoutes');
const kycRoutes = require('./kycRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/vendors/:vendorId/kyc', kycRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
