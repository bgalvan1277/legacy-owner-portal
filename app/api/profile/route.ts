import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.businessProfile.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!profile) {
            return NextResponse.json({ intakeData: {} });
        }

        return NextResponse.json({ intakeData: profile.intakeData });
    } catch (error) {
        console.warn('Error fetching profile:', error);
        return NextResponse.json({ intakeData: {} });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { intakeData } = body;

        // Ensure user exists (should already be there from login)
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const profile = await prisma.businessProfile.upsert({
            where: {
                userId: userId,
            },
            update: {
                intakeData,
                status: 'DRAFT'
            },
            create: {
                userId: userId,
                intakeData,
                status: 'DRAFT'
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error saving profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
