const express = require('express');
const router = express.Router();
const { getAllWOs, getWOById, createWO, updateWOStatus } = require('../controllers/woController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getAllWOs);
router.get('/:id', protect, getWOById); // Both admin and vendor can view their WO
router.post('/', protect, authorize('ADMIN'), createWO);
router.put('/:id/status', protect, updateWOStatus);

module.exports = router;
