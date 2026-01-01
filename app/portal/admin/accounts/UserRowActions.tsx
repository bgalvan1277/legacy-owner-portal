"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserRowActionsProps {
    userId: string;
}

export default function UserRowActions({ userId }: UserRowActionsProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh(); // Refresh the server component to remove the row
            } else {
                alert('Failed to delete user');
            }
        } catch {
            alert('An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex justify-end gap-3">
            {/* Placeholder for View - logic handled elsewhere or we can add link here */}
            <Link
                href={`/portal/admin/accounts/${userId}`}
                className="text-brand-dark hover:text-brand-gold font-medium text-sm inline-flex items-center gap-1"
            >
                View <ExternalLink size={14} />
            </Link>

            <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-800 font-medium text-sm inline-flex items-center gap-1 disabled:opacity-50"
                title="Delete User"
            >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
            </button>
        </div>
    );
}
