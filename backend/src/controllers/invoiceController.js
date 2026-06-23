const prisma = require('../config/prisma');

const getAllInvoices = async (req, res, next) => {
  try {
    const where = req.user.role === 'VENDOR' ? { vendorId: req.user.vendorId } : {};
    const invoices = await prisma.vendorInvoice.findMany({
      where,
      include: { vendor: true, lines: true, purchaseOrder: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: invoices });
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.vendorInvoice.findUnique({
      where: { id },
      include: { vendor: true, lines: true, purchaseOrder: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { vendorId, purchaseOrderId, totalAmount, currency, lines, dueDate } = req.body;
    
    const invoiceCount = await prisma.vendorInvoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.vendorInvoice.create({
      data: {
        invoiceNumber,
        vendorId,
        purchaseOrderId,
        totalAmount,
        currency,
        dueDate: dueDate ? new Date(dueDate) : null,
        lines: {
          create: lines?.map(line => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.quantity * line.unitPrice
          })) || []
        }
      },
      include: { lines: true }
    });
    res.status(201).json({ message: 'Invoice created', data: invoice });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const invoice = await prisma.vendorInvoice.update({
      where: { id },
      data: { 
        status,
        paymentDate: status === 'PAID' ? new Date() : undefined
      }
    });
    res.status(200).json({ message: 'Invoice status updated', data: invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllInvoices, getInvoiceById, createInvoice, updateInvoiceStatus };
