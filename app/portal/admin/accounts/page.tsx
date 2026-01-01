import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { ShieldAlert, Users } from 'lucide-react';
import UserListTable from './UserListTable';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
    const cookieStore = cookies();
    const userId = cookieStore.get('auth_user')?.value;

    if (!userId) {
        return <ClientRedirect to="/" />;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="p-8 text-center text-red-600">
                <ShieldAlert size={48} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <div className="mt-4"><ClientRedirect to="/portal/dashboard" /></div>
            </div>
        );
    }

    // Fetch All Users matching role USER (or all?)
    const allUsers = await prisma.user.findMany({
        where: { email: { not: 'admin' } },
        orderBy: { createdAt: 'desc' },
        include: { businessProfile: true },
    });

    return (
        <div className="font-[family-name:var(--font-geist-sans)] w-full px-6">
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Account Management</h1>
                    <p className="text-gray-300 mt-2">View and manage all registered accounts.</p>
                </div>
                <Users size={48} className="text-brand-gold opacity-50" />
            </div>

            <UserListTable users={allUsers} />
        </div>
    );
}
