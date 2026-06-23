const prisma = require('../config/prisma');

const uploadDocument = async (req, res, next) => {
  try {
    res.status(201).json({ message: `Upload KYC document for vendor ${req.params.vendorId}` });
  } catch (error) {
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    res.status(200).json({ message: `Get KYC documents for vendor ${req.params.vendorId}` });
  } catch (error) {
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    res.status(200).json({ message: `Update status of document ${req.params.docId}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, updateDocumentStatus };
