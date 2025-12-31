import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApprovalEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
    try {
        // 1. Verify Admin Auth
        const cookieStore = cookies();
        const requesterId = cookieStore.get('auth_user')?.value;

        if (!requesterId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
        });

        if (!requester || requester.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        // 2. Process Action
        const { userId, action } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
        }

        if (action === 'approve') {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isApproved: true },
            });

            // Send Approval Email
            try {
                const userName = updatedUser.firstName || 'User';
                await sendApprovalEmail(updatedUser.email, userName);
            } catch (e) {
                console.error("Failed to send email", e);
            }

            return NextResponse.json({ success: true, message: 'User approved' });
        }

        if (action === 'reject') {
            // Delete user or just leave unapproved? User said "Deny". 
            // Deleting allows them to try again if it was a mistake, or clears spam.
            // Let's DELETE for now to keep DB clean.

            // Note: need to cascade delete profile if it exists.
            // Our schema doesn't explicitly cascade, but let's try delete. 
            // If BusinessProfile exists, we might need to delete it first.

            const profile = await prisma.businessProfile.findUnique({ where: { userId } });
            if (profile) {
                await prisma.businessProfile.delete({ where: { userId } });
            }

            await prisma.user.delete({
                where: { id: userId },
            });
            return NextResponse.json({ success: true, message: 'User rejected and removed' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
