import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import AdminUserList from './AdminUserList'; // Separate client component for interactivity

export const dynamic = 'force-dynamic';

// Server Component for fetching data
export default async function AdminPage() {
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
                <p>You do not have permission to view this page.</p>
                <div className="mt-4"><ClientRedirect to="/portal/dashboard" /></div>
            </div>
        );
    }

    // Fetch Pending Users
    const pendingUsers = await prisma.user.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="font-[family-name:var(--font-geist-sans)] max-w-4xl mx-auto">
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg">
                <h1 className="text-3xl font-bold text-brand-gold">Admin Console</h1>
                <p className="text-gray-300 mt-2">Manage user access and approvals.</p>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                    Pending Approvals
                    <span className="bg-brand-gold text-brand-dark text-xs px-2 py-1 rounded-full">{pendingUsers.length}</span>
                </h2>

                {pendingUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No pending requests.</p>
                    </div>
                ) : (
                    <AdminUserList users={pendingUsers} />
                )}
            </div>
        </div>
    );
}
