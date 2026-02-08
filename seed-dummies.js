const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const teamPrefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Cyber', 'Tech', 'Code', 'Data', 'Web', 'Net', 'Soft', 'Byte', 'Pixel'];
const teamSuffixes = ['Squad', 'Team', 'Group', 'Force', 'Alliance', 'Union', 'Labs', 'Solutions', 'Systems', 'Devs', 'Crew', 'Gang', 'Clan', 'Corp', 'Inc', 'Ltd', 'Innovations', 'Dynamics', 'Logics', 'Works'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('Seeding 25 dummy teams...');
    const password_hash = await bcrypt.hash('password123', 10);

    const teams = [];

    for (let i = 0; i < 25; i++) {
        const teamName = `${getRandomElement(teamPrefixes)} ${getRandomElement(teamSuffixes)} ${Math.floor(Math.random() * 1000)}`;
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 10000)}@example.com`;

        teams.push({
            teamName,
            fullName,
            email,
            password_hash,
            is_binusian: Math.random() < 0.5,
            createdAt: getRandomDate(new Date(2025, 0, 1), new Date()),
            whatsapp: `08${Math.floor(Math.random() * 1000000000)}`
        });
    }






    for (const t of teams) {
        try {
            await prisma.$transaction(async (tx) => {
                const team = await tx.team.create({
                    data: {
                        team_name: t.teamName,
                        password_hash: t.password_hash,
                        is_binusian: t.is_binusian,
                        created_at: t.createdAt
                    }
                });

                await tx.teamLeader.create({
                    data: {
                        team_id: team.id,
                        full_name: t.fullName,
                        email: t.email,
                        whatsapp: t.whatsapp,
                        birth_date: new Date('2000-01-01'),
                        is_binusian: t.is_binusian,
                        created_at: t.createdAt
                    }
                });
            });
            console.log(`Created: ${t.teamName} (${t.createdAt.toISOString().split('T')[0]})`);
        } catch (e) {
            console.error(`Failed to create ${t.teamName}:`, e.message);
        }
    }

    console.log('Seeding complete.');
    await prisma.$disconnect();
}

main();
