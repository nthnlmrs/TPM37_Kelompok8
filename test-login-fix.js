const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

async function main() {
    try {
        console.log('Testing login for tim_test...');
        const loginRes = await client.post('http://localhost:3000/login', {
            team_name: 'tim_test',
            password: 'password123'
        });

        if (loginRes.data.success) {
            console.log('SUCCESS: Login worked for tim_test/password123');
        } else {
            console.error('FAILURE: Login failed:', loginRes.data);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

main();
