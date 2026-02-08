const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding test team...');
    const password_hash = await bcrypt.hash('password123', 10);

    try {

        const team = await prisma.team.upsert({
            where: { team_name: 'tim_test' },
            update: {
                password_hash
            },

            create: {
                team_name: 'tim_test',
                password_hash,
                is_binusian: false
            }
        });


        const existingLeader = await prisma.teamLeader.findUnique({ where: { email: 'test@example.com' } });
        if (!existingLeader) {
            await prisma.teamLeader.create({
                data: {
                    team_id: team.id,
                    full_name: 'Test Leader',
                    email: 'test@example.com',
                    whatsapp: '08123456789',
                    birth_date: new Date('2000-01-01'),
                    is_binusian: false,
                    cv_path: 'uploads/dummy_cv.pdf',
                    id_card_path: 'uploads/dummy_id.jpg'

                }
            });
        }

        console.log('Test team seeded: tim_test / password123');

    } catch (e) {
        console.error('Error seeding team:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
