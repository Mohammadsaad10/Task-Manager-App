import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';


async function main() {
  console.log('🌱 Seeding database...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user: ${admin.email} (password: password123)`);

  // Create regular user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@test.com',
      passwordHash: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Regular user: ${user.email} (password: password123)`);

  // Create sample tasks for the regular user
  const tasks = [
    {
      title: 'Set up project repository',
      description: 'Initialize Git repo, add README, set up CI/CD pipeline',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      dueDate: new Date('2026-06-10'),
      userId: user.id,
    },
    {
      title: 'Design database schema',
      description: 'Define tables for users, tasks, attachments, and activity logs',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      dueDate: new Date('2026-06-11'),
      userId: user.id,
    },
    {
      title: 'Implement authentication',
      description: 'Add JWT-based signup/login with password hashing',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: new Date('2026-06-15'),
      userId: user.id,
    },
    {
      title: 'Build task CRUD API',
      description: 'Create endpoints for creating, reading, updating, and deleting tasks',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: new Date('2026-06-18'),
      userId: user.id,
    },
    {
      title: 'Add search and filtering',
      description: 'Implement search by title, filter by status, sort by various fields',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: new Date('2026-06-20'),
      userId: user.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }
  console.log(`✅ Created ${tasks.length} sample tasks for ${user.email}`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
