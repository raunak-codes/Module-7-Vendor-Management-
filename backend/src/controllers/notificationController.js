const prisma = require('../config/prisma');

const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.status(200).json({ data: notification });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, type, title, message }
    });
    res.status(201).json({ data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserNotifications, markAsRead, createNotification };
