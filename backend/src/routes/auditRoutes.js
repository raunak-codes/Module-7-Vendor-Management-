const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true, vendor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
