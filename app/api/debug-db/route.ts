import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Safe Environment Check (Don't expose secrets completely)
        const envCheck = {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
            databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : 'MISSING',
        };

        // Database Connection Check
        const start = Date.now();
        const userCount = await prisma.user.count();
        const duration = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            message: 'Database connection successful',
            tables: {
                users: userCount
            },
            env: envCheck,
            latency: `${duration}ms`
        });

    } catch (error: any) {
        console.error('Debug DB Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        }, { status: 500 });
    }
}
