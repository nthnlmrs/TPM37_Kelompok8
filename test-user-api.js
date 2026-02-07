const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function main() {
    try {
        // 1. Get a valid team from DB
        const team = await prisma.team.findFirst();
        if (!team) {
            console.error('No teams found in DB. Run seed-dummies.js first.');
            return;
        }
        console.log(`Found team: ${team.team_name}`);

        // 2. Login
        console.log('Logging in...');
        // We assume the password is 'password123' as per seed-dummies.js
        const loginRes = await client.post('http://localhost:3000/login', {
            team_name: team.team_name,
            password: 'password123'
        });

        if (!loginRes.data.success) {
            console.error('Login failed:', loginRes.data);
            return;
        }
        console.log('Login successful.');

        // 3. Test GET /me
        console.log('\nTesting GET /me...');
        const resMe = await client.get('http://localhost:3000/me');
        const data = resMe.data.data;

        console.log('Team Name:', data.team_name);
        if (data.leader) {
            console.log('Leader Name:', data.leader.full_name);
            console.log('CV Path:', data.leader.cv_path);
            console.log('ID Path:', data.leader.id_card_path);

            if (data.leader.cv_path && data.leader.cv_path.includes('\\')) {
                console.error('ERROR: Path contains backslashes!');
            } else {
                console.log('Path normalization verified.');
            }
        } else {
            console.error('Leader data missing!');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    } finally {
        await prisma.$disconnect();
    }
}

main();
