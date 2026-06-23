const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead, createNotification } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, createNotification); // In a real system, usually triggered internally, but fine for now

module.exports = router;
