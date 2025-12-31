import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('LetsRoll2025!', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin' },
        update: {
            password: password,
            role: 'ADMIN',
            isApproved: true,
        },
        create: {
            email: 'admin',
            password: password,
            firstName: 'System',
            lastName: 'Admin',
            role: 'ADMIN',
            isApproved: true,
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
