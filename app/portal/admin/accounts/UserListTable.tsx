"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { intakePhases } from '@/app/intakeConfig';
import UserRowActions from './UserRowActions';

interface UserWithProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    isApproved: boolean;
    createdAt: Date;
    businessProfile: {
        intakeData: any;
    } | null;
}

interface UserListTableProps {
    users: UserWithProfile[];
}

export default function UserListTable({ users }: UserListTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter((u) => {
        const query = searchQuery.toLowerCase();
        const first = (u.firstName || '').toLowerCase();
        const last = (u.lastName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return first.includes(query) || last.includes(query) || email.includes(query);
    });

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">First Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Last Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Intake Progress</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Created</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => {
                                let progress = 0;
                                if (u.businessProfile?.intakeData) {
                                    const data = u.businessProfile.intakeData as Record<string, any>;
                                    const completed = intakePhases.filter(p => p.questions.some(q => data[q.id])).length;
                                    progress = Math.round((completed / intakePhases.length) * 100);
                                }

                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{u.email}</td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{u.firstName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{u.lastName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{u.phone || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-brand-gold'}`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-600 font-mono">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${u.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {u.isApproved ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <UserRowActions userId={u.id} />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                    No users found matching &quot;{searchQuery}&quot;
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
