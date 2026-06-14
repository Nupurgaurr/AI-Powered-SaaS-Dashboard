import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashed = await bcrypt.hash('Demo1234!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@trackai.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@trackai.dev',
      password: hashed,
      bio: 'CS student looking for SWE internships at top tech companies.',
      skills: ['TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
      targetRoles: ['SWE Intern', 'Frontend Engineer', 'Full-Stack Engineer'],
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);

  // Seed applications
  const applications = [
    { companyName: 'Google', role: 'SWE Intern L3', status: 'INTERVIEW' as const, location: 'Mountain View, CA', salary: '$52/hr', appliedDate: new Date('2025-06-02'), priority: 'HIGH' as const, source: 'linkedin' },
    { companyName: 'Meta', role: 'Frontend Engineer Intern', status: 'OA' as const, location: 'Menlo Park, CA', salary: '$50/hr', appliedDate: new Date('2025-06-05'), priority: 'HIGH' as const, source: 'company-site' },
    { companyName: 'Stripe', role: 'Full-Stack Engineer Intern', status: 'OFFER' as const, location: 'Remote', salary: '$55/hr', appliedDate: new Date('2025-05-28'), priority: 'HIGH' as const, source: 'referral', notes: 'Referral from college senior. Went through 3 rounds.' },
    { companyName: 'Amazon', role: 'SDE Intern', status: 'REJECTED' as const, location: 'Seattle, WA', salary: '$46/hr', appliedDate: new Date('2025-05-15'), priority: 'MEDIUM' as const, source: 'linkedin' },
    { companyName: 'Linear', role: 'Product Engineer Intern', status: 'APPLIED' as const, location: 'San Francisco, CA', appliedDate: new Date('2025-06-09'), priority: 'HIGH' as const, source: 'company-site' },
    { companyName: 'Vercel', role: 'Frontend Engineer Intern', status: 'APPLIED' as const, location: 'Remote', appliedDate: new Date('2025-06-08'), priority: 'MEDIUM' as const, source: 'company-site' },
    { companyName: 'Notion', role: 'SWE Intern', status: 'INTERVIEW' as const, location: 'San Francisco, CA', appliedDate: new Date('2025-05-20'), priority: 'HIGH' as const, source: 'linkedin' },
    { companyName: 'Figma', role: 'SWE Intern', status: 'REJECTED' as const, location: 'San Francisco, CA', appliedDate: new Date('2025-05-10'), priority: 'MEDIUM' as const, source: 'linkedin' },
    { companyName: 'Airbnb', role: 'Frontend Intern', status: 'APPLIED' as const, location: 'San Francisco, CA', appliedDate: new Date('2025-06-07'), priority: 'MEDIUM' as const, source: 'company-site' },
    { companyName: 'Databricks', role: 'SWE Intern', status: 'INTERVIEW' as const, location: 'San Francisco, CA', appliedDate: new Date('2025-05-25'), priority: 'HIGH' as const, source: 'handshake' },
  ];

  for (const app of applications) {
    await prisma.application.create({
      data: { ...app, userId: user.id },
    });
  }

  console.log(`✅ Created ${applications.length} demo applications`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
