import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = 'test@example.com';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert: Create if not exists, Update if exists
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
                isApproved: true,
                password: hashedPassword // Ensure we have a known hashed password
            },
            create: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                isApproved: true
            }
        });

        return NextResponse.json({
            success: true,
            message: `User ${user.email} is now an ADMIN and APPROVED. Password reset to 'password'.`
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
