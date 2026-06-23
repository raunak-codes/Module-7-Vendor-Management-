const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, vendorId: true, passwordHash: true }
  });
  console.log('=== ALL USERS ===');
  users.forEach(u => {
    console.log(`Email: ${u.email}, Role: ${u.role}, VendorId: ${u.vendorId}, HasPassword: ${!!u.passwordHash}, HashPrefix: ${u.passwordHash ? u.passwordHash.substring(0, 10) : 'NONE'}`);
  });

  const vendors = await prisma.vendor.findMany({
    select: { id: true, businessName: true, status: true }
  });
  console.log('\n=== ALL VENDORS ===');
  vendors.forEach(v => {
    console.log(`ID: ${v.id}, Name: ${v.businessName}, Status: ${v.status}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
