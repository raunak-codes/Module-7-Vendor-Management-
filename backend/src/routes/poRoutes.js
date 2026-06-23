const express = require('express');
const router = express.Router();
const { getAllPOs, getPOById, createPO, updatePOStatus } = require('../controllers/poController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('ADMIN'), getAllPOs);
router.get('/:id', protect, getPOById); // Both admin and vendor can view their PO
router.post('/', protect, authorize('ADMIN'), createPO);
router.put('/:id/status', protect, updatePOStatus);

module.exports = router;
