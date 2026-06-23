const prisma = require('../config/prisma');

const getAllWOs = async (req, res, next) => {
  try {
    const where = req.user.role === 'VENDOR' ? { vendorId: req.user.vendorId } : {};
    const wos = await prisma.workOrder.findMany({
      where,
      include: { vendor: true, purchaseOrder: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: wos });
  } catch (error) {
    next(error);
  }
};

const getWOById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: { vendor: true, purchaseOrder: true }
    });
    if (!wo) return res.status(404).json({ message: 'WO not found' });
    res.status(200).json({ data: wo });
  } catch (error) {
    next(error);
  }
};

const createWO = async (req, res, next) => {
  try {
    const { vendorId, purchaseOrderId, eventId, description, startDate, endDate } = req.body;
    
    const woCount = await prisma.workOrder.count();
    const woNumber = `WO-${new Date().getFullYear()}-${String(woCount + 1).padStart(4, '0')}`;

    const wo = await prisma.workOrder.create({
      data: {
        woNumber,
        vendorId,
        purchaseOrderId,
        eventId,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });
    res.status(201).json({ message: 'WO created', data: wo });
  } catch (error) {
    next(error);
  }
};

const updateWOStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const wo = await prisma.workOrder.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ message: 'WO status updated', data: wo });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllWOs, getWOById, createWO, updateWOStatus };
