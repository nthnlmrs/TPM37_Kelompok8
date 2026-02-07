const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function main() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await client.post('http://localhost:3000/admin/login', {
            username: 'admin',
            password: 'admin123'
        });

        if (!loginRes.data.success) {
            console.error('Login failed:', loginRes.data);
            return;
        }
        console.log('Login successful.');

        // Test Sort ID ASC
        console.log('\nTesting Sort ID ASC...');
        const resAsc = await client.get('http://localhost:3000/api/admin/teams', {
            params: { sortBy: 'id', order: 'asc' }
        });
        const teamsAsc = resAsc.data.data;
        console.log('First 3 teams:', teamsAsc.slice(0, 3).map(t => `${t.id}: ${t.team_name}`));

        // Test Sort ID DESC
        console.log('\nTesting Sort ID DESC...');
        const resDesc = await client.get('http://localhost:3000/api/admin/teams', {
            params: { sortBy: 'id', order: 'desc' }
        });
        const teamsDesc = resDesc.data.data;
        console.log('First 3 teams:', teamsDesc.slice(0, 3).map(t => `${t.id}: ${t.team_name}`));

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

main();
