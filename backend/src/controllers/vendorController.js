const prisma = require('../config/prisma');

const getVendors = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Get vendors list' });
  } catch (error) {
    next(error);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    res.status(200).json({ message: `Get vendor ${req.params.id}` });
  } catch (error) {
    next(error);
  }
};

const updateVendor = async (req, res, next) => {
  try {
    res.status(200).json({ message: `Update vendor ${req.params.id}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendors, getVendorById, updateVendor };
