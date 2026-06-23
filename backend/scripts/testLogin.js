const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Test 1: Admin login
  console.log('=== TEST 1: Admin Login ===');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@eventhub.com' }, include: { vendor: true } });
  if (!admin) {
    console.log('FAIL: Admin user not found');
  } else {
    console.log('Admin found:', admin.email);
    console.log('PasswordHash exists:', !!admin.passwordHash);
    console.log('Hash value:', admin.passwordHash);
    const match = await bcrypt.compare('password123', admin.passwordHash);
    console.log('Password "password123" matches:', match);
  }

  // Test 2: Vendor login
  console.log('\n=== TEST 2: Vendor Login ===');
  const vendor = await prisma.user.findUnique({ where: { email: 'vendorcompan1@gmail.com' }, include: { vendor: true } });
  if (!vendor) {
    console.log('FAIL: Vendor user not found');
  } else {
    console.log('Vendor found:', vendor.email);
    console.log('PasswordHash exists:', !!vendor.passwordHash);
    console.log('Hash value:', vendor.passwordHash);
    // We don't know the password, let's try checking what was stored
    console.log('Vendor status:', vendor.vendor?.status);
    console.log('VendorId:', vendor.vendorId);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
