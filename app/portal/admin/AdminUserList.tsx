"use client";

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    createdAt: Date;
}

export default function AdminUserList({ users }: { users: User[] }) {
    const router = useRouter();
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setLoadingMap(prev => ({ ...prev, [userId]: true }));
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                body: JSON.stringify({ userId, action }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Action failed");
            }
        } catch (e) {
            console.error(e);
            alert("Error");
        } finally {
            setLoadingMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <div className="space-y-4">
            {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <div className="font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-sm text-gray-600">{user.phone}</div>
                        <div className="text-xs text-gray-500 mt-1">Requested: {new Date(user.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(user.id, 'reject')}
                            disabled={loadingMap[user.id]}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                            title="Reject"
                        >
                            {loadingMap[user.id] ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        </button>
                        <button
                            onClick={() => handleAction(user.id, 'approve')}
                            disabled={loadingMap[user.id]}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                            title="Approve"
                        >
                            {loadingMap[user.id] ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
