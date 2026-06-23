const prisma = require('../config/prisma');

const uploadDocument = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No document file provided' });
    }

    const documentUrl = `/uploads/${req.file.filename}`;

    const doc = await prisma.vendorKycDocument.create({
      data: {
        vendorId,
        type,
        documentUrl,
        status: 'PENDING'
      }
    });
    res.status(201).json({ message: 'Document uploaded successfully', data: doc });
  } catch (error) {
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const docs = await prisma.vendorKycDocument.findMany({ where: { vendorId } });
    res.status(200).json({ data: docs });
  } catch (error) {
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { status } = req.body; // VERIFIED, REJECTED
    const doc = await prisma.vendorKycDocument.update({
      where: { id: docId },
      data: { status }
    });
    res.status(200).json({ message: 'Document status updated', data: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, updateDocumentStatus };
