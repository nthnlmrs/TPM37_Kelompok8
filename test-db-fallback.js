const { PrismaClient } = require('./generated/prisma');

async function testConnection(url) {
    console.log(`Testing connection to ${url}...`);
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    });

    try {
        await prisma.$connect();
        console.log(`Success: Connected to ${url}`);

        // Check if table exists (this might fail if db is empty but connection is good)
        try {
            await prisma.team.count();
            console.log('Table Team exists.');
        } catch (err) {
            console.log('Connection successful but table query failed (might need migration): ' + err.message.split('\n')[0]);
        }
        return true;
    } catch (e) {
        console.log(`Failed to connect to ${url}: ${e.message.split('\n')[0]}`);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    // Try common local defaults
    const urls = [
        'mysql://root:@localhost:3306/finpro_tpm',
        'mysql://root:root@localhost:3306/finpro_tpm',
        'mysql://root:password@localhost:3306/finpro_tpm'
    ];

    for (const url of urls) {
        if (await testConnection(url)) {
            console.log('Found working connection!');
            process.exit(0);
        }
    }

    console.log('All attempts failed.');
    process.exit(1);
}

main();
