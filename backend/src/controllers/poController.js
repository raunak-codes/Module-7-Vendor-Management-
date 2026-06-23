const prisma = require('../config/prisma');

const getAllPOs = async (req, res, next) => {
  try {
    const where = req.user.role === 'VENDOR' ? { vendorId: req.user.vendorId } : {};
    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: { vendor: true, lines: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: pos });
  } catch (error) {
    next(error);
  }
};

const getPOById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { vendor: true, lines: true, workOrders: true, invoices: true }
    });
    if (!po) return res.status(404).json({ message: 'PO not found' });
    res.status(200).json({ data: po });
  } catch (error) {
    next(error);
  }
};

const createPO = async (req, res, next) => {
  try {
    const { vendorId, eventId, totalAmount, lines, currency, issueDate, expectedDeliveryDate } = req.body;
    
    // Auto-generate PO Number
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        eventId,
        totalAmount,
        currency,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        lines: {
          create: lines.map(line => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.quantity * line.unitPrice
          }))
        }
      },
      include: { lines: true }
    });
    res.status(201).json({ message: 'PO created', data: po });
  } catch (error) {
    next(error);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });
    res.status(200).json({ message: 'PO status updated', data: po });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPOs, getPOById, createPO, updatePOStatus };
