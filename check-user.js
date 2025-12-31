
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'info@briangalvan.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log(`User ${email} exists:`, !!user);
    if (user) console.log('User ID:', user.id);
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
