const prisma = require('../config/prisma');

const getVendorRatings = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const ratings = await prisma.vendorRating.findMany({
      where: { vendorId },
      include: { reviewer: true }
    });
    res.status(200).json({ data: ratings });
  } catch (error) {
    next(error);
  }
};

const createRating = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { rating, review, eventId } = req.body;
    
    const newRating = await prisma.vendorRating.create({
      data: {
        vendorId,
        reviewerId: req.user.id,
        rating,
        review,
        eventId
      }
    });
    res.status(201).json({ data: newRating });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendorRatings, createRating };
