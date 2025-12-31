import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { intakePhases } from '@/app/intakeConfig';
import ConciergeBanner from '@/components/dashboard/ConciergeBanner';

export const dynamic = 'force-dynamic';

async function getProfile(userId: string) {
    try {
        const profile = await prisma.businessProfile.findUnique({
            where: { userId },
        });
        return profile;
    } catch {
        return { status: 'NOT_STARTED', intakeData: {} };
    }
}

export default async function Dashboard() {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('auth_user')?.value;

        if (!userId) {
            return <ClientRedirect to="/" />;
        }

        const profile = await getProfile(userId);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true }
        });
        const intakeData = (profile?.intakeData as Record<string, any>) || {};

        // Calculate Progress
        let completedPhasesCount = 0;
        const totalPhases = intakePhases.length;

        intakePhases.forEach(phase => {
            const hasData = phase.questions.some(q => {
                const val = intakeData[q.id];
                return val !== undefined && val !== null && val !== '';
            });
            if (hasData) completedPhasesCount++;
        });

        const progressPercent = Math.round((completedPhasesCount / totalPhases) * 100);

        return (
            <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-[#FAF9F6]">
                <div className="max-w-6xl mx-auto pt-12 px-6">
                    {/* Welcome Banner */}
                    <div className="bg-brand-dark rounded-2xl p-10 shadow-lg text-white mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                        <h1 className="text-4xl font-bold text-brand-gold mb-4 relative z-10">{user?.firstName ? `Welcome ${user.firstName}, to Mission Control` : 'Mission Control'}</h1>
                        <p className="text-xl text-gray-300 max-w-none relative z-10">
                            Welcome to your Business command center. This portal manages the secure exchange of information for your business sale.
                        </p>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 items-stretch">

                        {/* Left Column: Video (Span 2) */}
                        <div className="lg:col-span-2 h-full">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full flex flex-col justify-center">
                                <h2 className="text-2xl font-bold text-[#085035] mb-6">A Message from Barnes Walker</h2>
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/9dSN4VzI50A"
                                        title="Barnes Walker Welcome"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Progress & Advice (Span 1) */}
                        <div className="flex flex-col h-full gap-3">

                            {/* Intake Progress Card */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Intake Progress</h3>
                                </div>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-4xl font-bold text-[#085035]">{progressPercent}%</span>
                                    <span className="text-gray-400 text-sm font-medium">Complete</span>
                                </div>
                                <Link
                                    href="/portal/intake"
                                    className="block w-full text-center bg-[#085035] text-white font-bold py-2.5 rounded-lg hover:bg-[#06402a] transition-colors text-sm"
                                >
                                    Continue Business Intake
                                </Link>
                            </div>

                            {/* Seller Resources Card */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                                <h3 className="text-[#085035] text-lg font-bold mb-2">Seller Resources</h3>
                                <Link
                                    href="/portal/resources"
                                    className="block w-full text-center bg-white text-[#085035] font-bold py-2.5 rounded-lg border-2 border-[#085035] hover:bg-green-50 transition-colors text-sm"
                                >
                                    View Resources
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* Concierge Highlight Banner */}
                    <ConciergeBanner />
                </div>
            </div>
        );
    } catch (error) {
        if ((error as any)?.message === 'NEXT_REDIRECT') throw error;
        return <ClientRedirect to="/" />;
    }
}
