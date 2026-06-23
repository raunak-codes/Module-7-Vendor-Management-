const express = require('express');
const router = express.Router({ mergeParams: true });
const { getVendorRatings, createRating } = require('../controllers/ratingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, getVendorRatings);
router.post('/', protect, authorize('ADMIN'), createRating);

module.exports = router;
