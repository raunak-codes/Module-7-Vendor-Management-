const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vendorRoutes = require('./vendorRoutes');
const kycRoutes = require('./kycRoutes');

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/vendors/:vendorId/kyc', kycRoutes);

module.exports = router;
