const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email }, include: { vendor: true } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id });
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        vendorId: user.vendorId,
        status: user.vendor?.status
      }
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { businessName, contactName, email, password, phone, address, vendorCategory, gstNumber, panNumber, bankName, accountNumber } = req.body;

    if (!businessName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let category = await prisma.vendorCategory.findFirst({ where: { name: vendorCategory || 'Other' } });
    if (!category) {
      category = await prisma.vendorCategory.create({ data: { name: vendorCategory || 'Other' } });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.create({
        data: {
          businessName,
          contactPersonName: contactName,
          address,
          gstNumber,
          panNumber,
          bankAccountNumber: accountNumber,
          categoryId: category.id,
          status: 'PENDING'
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          role: 'VENDOR',
          vendorId: vendor.id
        }
      });

      return { user, vendor };
    });

    res.status(201).json({ message: 'Vendor registered successfully. Await admin verification.', data: result });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };
