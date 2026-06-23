const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { getAllVendors, getVendorById, getPendingVendors, approveVendor, rejectVendor } = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/vendors', protect, authorize('ADMIN'), getAllVendors);
router.get('/vendors/pending', protect, authorize('ADMIN'), getPendingVendors);
router.get('/vendors/:vendorId', protect, authorize('ADMIN'), getVendorById);
router.put('/vendors/:vendorId/approve', protect, authorize('ADMIN'), approveVendor);
router.put('/vendors/:vendorId/reject', protect, authorize('ADMIN'), rejectVendor);

router.get('/analytics', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const totalVendors = await prisma.vendor.count();
    const approvedVendors = await prisma.vendor.count({ where: { status: 'ACTIVE' } });
    const pendingVendors = await prisma.vendor.count({ where: { status: 'PENDING' } });
    const rejectedVendors = await prisma.vendor.count({ where: { status: 'REJECTED' } });
    
    const totalWorkOrders = await prisma.workOrder.count();
    const pendingInvoices = await prisma.vendorInvoice.count({ where: { status: 'SUBMITTED' } });
    
    // Category spend
    const invoices = await prisma.vendorInvoice.findMany({
      where: { status: 'PAID' },
      include: { vendor: { include: { category: true } } }
    });

    const categorySpendMap = {};
    let totalSpend = 0;
    for (let inv of invoices) {
      const catName = inv.vendor?.category?.name || 'Uncategorized';
      if (!categorySpendMap[catName]) categorySpendMap[catName] = 0;
      const amt = parseFloat(inv.totalAmount || 0);
      categorySpendMap[catName] += amt;
      totalSpend += amt;
    }

    const categorySpend = Object.keys(categorySpendMap).map(cat => ({
      label: cat,
      value: categorySpendMap[cat]
    }));

    res.status(200).json({ 
      data: {
        totalVendors,
        approvedVendors,
        pendingVendors,
        rejectedVendors,
        totalWorkOrders,
        pendingInvoices,
        categorySpend,
        totalSpend
      } 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
