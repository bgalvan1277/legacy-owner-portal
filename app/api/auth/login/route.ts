import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        let isValid = false;
        // Legacy plain text processing for test user if needed, or migration
        // If the stored password isn't a bcrypt hash (doesn't start with $2), assume plain text?
        // Risky for prod, but helpful for dev "password" usage.
        if (user.password && !user.password.startsWith('$')) {
            isValid = user.password === password;
        } else {
            isValid = await bcrypt.compare(password, user.password);
        }

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check Approval
        if (!user.isApproved) {
            return NextResponse.json(
                { error: 'Your account is pending admin approval.' },
                { status: 403 }
            );
        }

        // Set auth cookie
        cookies().set('auth_user', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        return NextResponse.json({ success: true, userId: user.id, role: user.role });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
