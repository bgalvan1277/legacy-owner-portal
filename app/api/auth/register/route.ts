import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewUserAlert } from '@/lib/email';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, phone } = body;

        // Validation for all fields
        if (!email || !password || !firstName || !lastName || !phone) {
            return NextResponse.json(
                { success: false, message: 'All fields (Email, Password, Name, Phone) are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Bootstrap: If this is the first user, make them ADMIN and Approved.
        const userCount = await prisma.user.count();
        const isFirstUser = userCount === 0;

        // Create user (Pending Approval by default)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: isFirstUser ? 'ADMIN' : 'USER',
                isApproved: isFirstUser ? true : false,
            },
        });

        const isApproved = isFirstUser;

        // Initialize empty Business Profile for them? 
        // Or wait until approval/login? 
        // Let's initialize it so it's ready.
        await prisma.businessProfile.create({
            data: {
                userId: user.id,
                intakeData: {},
                status: 'NOT_STARTED'
            }
        });

        // Send admin alert if user is pending approval
        if (!isApproved) {
            await sendNewUserAlert(email, `${firstName} ${lastName}`, phone);
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully. Please wait for admin approval.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
