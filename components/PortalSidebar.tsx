"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, Scale, ChevronDown, ShieldCheck, LogOut, BookOpen } from 'lucide-react';
import { intakePhases } from '@/app/intakeConfig';
import React, { useState, useEffect } from 'react';
import { useUI } from '@/app/UIContext';

export default function PortalSidebar({ role }: { role?: string, email?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsChatOpen } = useUI();
    const [intakeExpanded, setIntakeExpanded] = useState(false);

    // Auto-expand if in intake section
    useEffect(() => {
        if (pathname.includes('/portal/intake')) {
            setIntakeExpanded(true);
        }
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const isAdmin = role === 'ADMIN';

    return (
        <aside className="w-64 bg-brand-dark text-white flex flex-col fixed h-full shadow-xl z-20">
            {/* Logo Area */}
            <div className="p-8 border-b border-[#2c4a3e]">
                <div className="relative w-48 h-12">
                    <Image
                        src="/assets/logo-v2.png"
                        alt="Barnes Walker"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">

                {/* --- ADMIN LINKS --- */}
                {isAdmin && (
                    <>
                        <div className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Portal</div>
                        <SidebarLink href="/portal/admin" icon={<ShieldCheck size={20} />} label="Pending Approvals" active={pathname === '/portal/admin'} />
                        <SidebarLink href="/portal/admin/accounts" icon={<FileText size={20} />} label="Accounts" active={pathname === '/portal/admin/accounts'} />
                        <SidebarLink href="/portal/admin/knowledge" icon={<BookOpen size={20} />} label="Knowledge Base" active={pathname === '/portal/admin/knowledge'} />
                    </>
                )}

                {/* --- USER LINKS --- */}
                {!isAdmin && (
                    <>
                        <SidebarLink href="/portal/dashboard" icon={<LayoutDashboard size={20} />} label="Mission Control" active={pathname === '/portal/dashboard'} />

                        {/* Business Intake Section */}
                        <div>
                            <button
                                onClick={() => setIntakeExpanded(!intakeExpanded)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                ${pathname.includes('/portal/intake') ? 'bg-[#2c4a3e] text-white' : 'text-gray-300 hover:bg-[#2c4a3e] hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={20} />
                                    <span>Business Intake</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${intakeExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {intakeExpanded && (
                                <div className="mt-2 ml-4 space-y-1 pl-4 border-l border-[#2c4a3e]">
                                    <Link href="/portal/intake" className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors mb-2 ${pathname === '/portal/intake' ? 'text-brand-gold bg-[#2c4a3e]/50' : 'text-gray-400 hover:text-white'}`}>
                                        Main Overview Page
                                    </Link>
                                    {intakePhases.map((phase, index) => {
                                        const isActiveStep = pathname.includes('/portal/intake/wizard') && searchParams?.get('step') === index.toString();
                                        return (
                                            <Link
                                                key={phase.id}
                                                href={`/portal/intake/wizard?step=${index}`}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors group mb-0.5
                                                    ${isActiveStep
                                                        ? 'bg-[#2c4a3e] text-white shadow-sm ring-1 ring-brand-gold/20'
                                                        : 'text-gray-400 hover:text-white hover:bg-[#2c4a3e]/30'
                                                    }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-colors
                                                    ${isActiveStep
                                                        ? 'border-brand-gold text-brand-gold bg-brand-gold/10'
                                                        : 'border-gray-600 group-hover:border-brand-gold group-hover:text-brand-gold'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span className={`truncate ${isActiveStep ? 'text-white font-medium' : ''}`}>{phase.title}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <SidebarLink href="/portal/resources" icon={<BookOpen size={20} />} label="Seller Resources" active={pathname === '/portal/resources'} />

                        <SidebarLink href="/portal/documents" icon={<Scale size={20} />} label="Legal Documents" active={pathname === '/portal/documents'} />

                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:bg-[#2c4a3e] hover:text-white"
                        >
                            <MessageSquare size={20} />
                            <span>Business Concierge</span>
                        </button>
                    </>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-red-300 hover:bg-red-900/30 hover:text-red-200 mt-8"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>

                {/* DEBUG INFO */}


            </nav>

            {/* Profile Footer */}
            <Link href="/portal/profile" className="p-4 border-t border-[#2c4a3e] hover:bg-[#2c4a3e] transition-colors block cursor-pointer group">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2c4a3e]/50 group-hover:bg-[#2c4a3e]">
                    <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs">BW</div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-medium truncate">Update Profile</div>
                        <div className="text-xs text-gray-400 truncate group-hover:text-brand-gold">View Settings</div>
                    </div>
                </div>
            </Link>
        </aside>
    );
}

function SidebarLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-[#2c4a3e] text-white shadow-lg shadow-[#000000]/10 ring-1 ring-brand-gold/10' : 'text-gray-300 hover:bg-[#2c4a3e] hover:text-white'}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
