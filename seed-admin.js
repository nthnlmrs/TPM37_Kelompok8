const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding admin user...');

    const password_hash = await bcrypt.hash('admin123', 10);

    try {
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password_hash,
                role: 'admin'
            }
        });
        console.log('Admin user seeded:', admin);
    } catch (e) {
        console.error('Error seeding admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
