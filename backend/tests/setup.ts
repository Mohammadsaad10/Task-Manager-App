import prisma from '../src/lib/prisma';

/** Clean up all test data from the database */
export async function cleanDatabase() {
  // Delete in order that respects foreign key constraints
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

/** Disconnect Prisma after all tests */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
