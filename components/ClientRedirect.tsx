'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientRedirect({ to }: { to: string }) {
    const router = useRouter();
    useEffect(() => {
        router.push(to);
    }, [router, to]);
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
}
