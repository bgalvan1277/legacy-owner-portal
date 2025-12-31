import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { intakePhases } from '@/app/intakeConfig';
import {
    ClipboardCheck, Building2, TrendingUp, Package, Users, Handshake,
    Scale, ShieldCheck, Home, Target, FileText, ArrowRight, Info
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProfile(userId: string) {
    try {
        const profile = await prisma.businessProfile.findUnique({
            where: { userId },
        });
        return profile;
    } catch (e) {
        console.warn("Failed to load profile (returning mock):", e);
        return { status: 'NOT_STARTED', intakeData: {} };
    }
}

// Icon mapping for phases
const phaseIcons: Record<string, any> = {
    "phase-1": ClipboardCheck,
    "phase-2": Info,
    "phase-3": Building2,
    "phase-4": TrendingUp,
    "phase-5": Package,
    "phase-6": Users,
    "phase-7": Handshake,
    "phase-8": Scale,
    "phase-9": ShieldCheck,
    "phase-10": Home,
    "phase-11": Target,
    "phase-12": FileText
};

export default async function IntakeOverview() {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return <ClientRedirect to="/" />;
        }

        const profile = await getProfile(userId);
        // const status = profile?.status || 'NOT_STARTED'; // Removed as unused per lint
        const intakeData = (profile?.intakeData as Record<string, any>) || {};

        // Calculate Progress
        let completedPhasesCount = 0;
        const totalPhases = intakePhases.length;

        const phasesWithStatus = intakePhases.map(phase => {
            // Check if ANY question in this phase has a value in intakeData
            // We iterate through questions of this phase
            const hasData = phase.questions.some(q => {
                const val = intakeData[q.id];
                return val !== undefined && val !== null && val !== '';
            });

            if (hasData) completedPhasesCount++;

            return {
                ...phase,
                isDone: hasData
            };
        });

        const progressPercent = Math.round((completedPhasesCount / totalPhases) * 100);

        return (
            <div className="font-[family-name:var(--font-geist-sans)]">
                {/* Header Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-brand-dark">Business Intake</h1>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm max-w-none mb-6">
                        Complete all {totalPhases} modules below to build your deal room. You can start with any module, but sequential order is recommended.
                    </p>

                    {/* Global Progress Bar */}
                    <div className="w-full">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-brand-dark">Total Completion</span>
                            <span className="text-sm font-medium text-brand-blue">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                                className="bg-brand-blue h-3 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {phasesWithStatus.map((phase, index) => {
                        const Icon = phaseIcons[phase.id] || ClipboardCheck;
                        const isDone = phase.isDone;

                        return (
                            <Link
                                href={`/portal/intake/wizard?step=${index}`}
                                key={phase.id}
                                className={`group bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 flex flex-col h-full ${isDone ? 'border-green-100 hover:border-green-300' : 'border-gray-100 hover:shadow-md hover:border-brand-gold/50'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDone ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-brand-dark group-hover:bg-brand-gold/10 group-hover:text-brand-dark'}`}>
                                        <Icon size={20} />
                                    </div>

                                    {isDone ? (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-100 px-2 py-1 rounded">
                                            Done
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                            Open
                                        </span>
                                    )}
                                </div>

                                <div className="mb-8 flex-1">
                                    <h3 className="font-bold text-brand-dark text-lg mb-2">
                                        {index + 1}. {phase.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        {phase.description}
                                    </p>
                                </div>

                                <div className={`flex items-center text-sm font-semibold transition-colors ${isDone ? 'text-green-600' : 'text-brand-blue group-hover:text-brand-gold'}`}>
                                    {isDone ? 'Edit Module' : 'Start Module'}
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    } catch (error) {
        if ((error as any)?.message === 'NEXT_REDIRECT') throw error;
        return <ClientRedirect to="/" />;
    }
}
