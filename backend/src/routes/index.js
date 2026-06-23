const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vendorRoutes = require('./vendorRoutes');
const kycRoutes = require('./kycRoutes');
const adminRoutes = require('./adminRoutes');
const poRoutes = require('./poRoutes');
const woRoutes = require('./woRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const auditRoutes = require('./auditRoutes');
const notificationRoutes = require('./notificationRoutes');
const ratingRoutes = require('./ratingRoutes');

router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/vendors/:vendorId/kyc', kycRoutes);
router.use('/vendors/:vendorId/ratings', ratingRoutes);
router.use('/admin', adminRoutes);
router.use('/purchase-orders', poRoutes);
router.use('/work-orders', woRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
