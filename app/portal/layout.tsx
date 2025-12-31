import React from 'react';
import PortalSidebar from '@/components/PortalSidebar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const userId = cookieStore.get('auth_user')?.value;

    let userRole = 'USER';
    let userEmail = '';
    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            userRole = user.role;
            userEmail = user.email;
        }
    }

    return (
        <div className="flex min-h-screen bg-brand-white">
            <PortalSidebar role={userRole} email={userEmail} />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 bg-[#FDFBF7]">
                {children}
            </main>
        </div>
    );
}
