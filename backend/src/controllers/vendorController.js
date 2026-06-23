const prisma = require('../config/prisma');

// For Vendor themselves
const getMe = async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;
    if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { category: true, kycDocuments: true } });
    res.status(200).json({ data: vendor });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;
    if (!vendorId) return res.status(404).json({ message: 'Vendor profile not found' });
    const updated = await prisma.vendor.update({
      where: { id: vendorId },
      data: req.body
    });
    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

// For Admin
const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: { category: true, user: { select: { email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: vendors });
  } catch (error) {
    next(error);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { category: true, kycDocuments: true, user: { select: { email: true, phone: true } } }
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.status(200).json({ data: vendor });
  } catch (error) {
    next(error);
  }
};

const getPendingVendors = async (req, res, next) => {
  try {
    const vendors = await prisma.vendor.findMany({ where: { status: 'PENDING' }, include: { category: true } });
    res.status(200).json({ data: vendors });
  } catch (error) {
    next(error);
  }
};

const approveVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'ACTIVE' }
    });
    res.status(200).json({ message: 'Vendor approved', data: vendor });
  } catch (error) {
    next(error);
  }
};

const rejectVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status: 'REJECTED' }
    });
    res.status(200).json({ message: 'Vendor rejected', data: vendor });
  } catch (error) {
    next(error);
  }
};

const getVendorDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;
    if (!vendorId) return res.status(404).json({ message: 'Vendor not found' });

    const activeWorkOrders = await prisma.workOrder.count({ where: { vendorId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } });
    
    // Total unpaid/pending payments
    const pendingInvoices = await prisma.vendorInvoice.aggregate({
      where: { vendorId, status: 'SUBMITTED' },
      _sum: { totalAmount: true }
    });
    const pendingAmount = pendingInvoices._sum.totalAmount || 0;

    // Recent activity (Last 3 Work orders or invoices)
    const recentActivity = await prisma.workOrder.findMany({
      where: { vendorId },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: { woNumber: true, description: true, status: true, updatedAt: true }
    });

    const vendorRatingAgg = await prisma.vendorRating.aggregate({
      where: { vendorId },
      _avg: { rating: true }
    });
    const rating = vendorRatingAgg._avg.rating || 0;

    res.status(200).json({
      data: {
        activeWorkOrders,
        pendingAmount,
        rating,
        recentActivity: recentActivity.map(wo => ({
          title: `Work Order ${wo.woNumber}`,
          sub: wo.description,
          status: wo.status,
          date: new Date(wo.updatedAt).toLocaleDateString()
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, getVendorDashboard, getAllVendors, getVendorById, getPendingVendors, approveVendor, rejectVendor };
