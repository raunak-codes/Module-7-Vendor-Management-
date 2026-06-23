const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, vendorId: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

const isVendorActive = async (req, res, next) => {
  if (req.user.role === 'ADMIN') return next();
  if (!req.user.vendorId) return res.status(403).json({ message: 'No vendor profile associated' });
  
  const vendor = await prisma.vendor.findUnique({ where: { id: req.user.vendorId } });
  if (!vendor || vendor.status !== 'ACTIVE') {
    return res.status(403).json({ message: `Access denied. Vendor status is ${vendor?.status || 'UNKNOWN'}` });
  }
  next();
};

module.exports = { protect, authorize, isVendorActive };
