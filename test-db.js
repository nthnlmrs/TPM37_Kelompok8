const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected!');

        console.log('Checking for existing teams...');
        const teams = await prisma.team.findMany({ take: 1 });
        console.log('Teams found:', teams);

        console.log('Database connection and query successful.');
    } catch (e) {
        console.error('Error connecting or querying database:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
