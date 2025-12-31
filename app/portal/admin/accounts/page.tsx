import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { ShieldAlert, Users, ExternalLink } from 'lucide-react';
import { intakePhases } from '@/app/intakeConfig';

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
        orderBy: { createdAt: 'desc' },
        include: { businessProfile: true },
    });

    return (
        <div className="font-[family-name:var(--font-geist-sans)] max-w-6xl mx-auto">
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold">Account Management</h1>
                    <p className="text-gray-300 mt-2">View and manage all registered accounts.</p>
                </div>
                <Users size={48} className="text-brand-gold opacity-50" />
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">First Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Last Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Intake Progress</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Created</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allUsers.map((u) => {
                            let progress = 0;
                            if (u.businessProfile?.intakeData) {
                                const data = u.businessProfile.intakeData as Record<string, any>;
                                const completed = intakePhases.filter(p => p.questions.some(q => data[q.id])).length;
                                progress = Math.round((completed / intakePhases.length) * 100);
                            }

                            return (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{u.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{u.firstName || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{u.lastName || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{u.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-brand-gold'}`} style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-600 font-mono">{progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${u.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {u.isApproved ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{u.createdAt.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-dark hover:text-brand-gold font-medium text-sm inline-flex items-center gap-1">
                                            View <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
