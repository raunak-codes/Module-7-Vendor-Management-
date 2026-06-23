const express = require('express');
const router = express.Router();
const { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getAllInvoices);
router.get('/:id', protect, getInvoiceById); // Both admin and vendor can view their invoices
router.post('/', protect, createInvoice); // Vendors can submit invoices
router.put('/:id/status', protect, authorize('ADMIN'), updateInvoiceStatus);

module.exports = router;
