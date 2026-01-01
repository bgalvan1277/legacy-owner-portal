import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ClientRedirect from '@/components/ClientRedirect';
import { ArrowLeft, Download, FileText, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { intakePhases, Question } from '@/app/intakeConfig';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const currentUserId = cookieStore.get('auth_user')?.value;

    if (!currentUserId) {
        return <ClientRedirect to="/" />;
    }

    // Verify Admin
    const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return <ClientRedirect to="/portal/dashboard" />;
    }

    // Fetch Target User
    const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            businessProfile: true,
            documents: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!targetUser) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">User Not Found</h1>
                <Link href="/portal/admin/accounts" className="text-brand-blue hover:underline mt-4 inline-block">Return to Accounts</Link>
            </div>
        );
    }

    const { businessProfile } = targetUser;
    const intakeData = (businessProfile?.intakeData as Record<string, any>) || {};

    const renderAnswer = (question: Question) => {
        const val = intakeData[question.id];

        if (val === undefined || val === null || val === '') {
            return <span className="text-gray-400 italic">Not answered</span>;
        }

        if (question.type === 'file') {
            // Check if it's a real file object (from new upload) or mock string
            if (typeof val === 'object' && val.id) {
                return (
                    <a
                        href={`/api/documents/${val.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-brand-blue rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        target="_blank"
                    >
                        <Download size={14} />
                        Download {val.filename || 'File'}
                    </a>
                );
            }
            // Legacy/Mock string
            return (
                <span className="inline-flex items-center gap-2 text-gray-600">
                    <FileText size={14} />
                    {String(val)} <span className="text-xs bg-gray-100 px-1.5 rounded text-gray-500">(Legacy/Mock)</span>
                </span>
            );
        }

        if (question.type === 'boolean') {
            return val ? 'Yes' : 'No';
        }

        if (Array.isArray(val)) {
            return val.join(', ');
        }

        if (typeof val === 'object') {
            return JSON.stringify(val);
        }

        return String(val);
    };

    return (
        <div className="font-[family-name:var(--font-geist-sans)] w-full px-6 pb-20">
            {/* Header */}
            <div className="mb-8">
                <Link href="/portal/admin/accounts" className="text-gray-500 hover:text-brand-dark inline-flex items-center gap-1 mb-4 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} /> Back to Accounts
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark mb-1">{targetUser.firstName} {targetUser.lastName}</h1>
                        <div className="flex items-center gap-4 text-gray-600 text-sm">
                            <span className="flex items-center gap-1"><UserIcon size={14} /> {targetUser.email}</span>
                            <span>•</span>
                            <span>{targetUser.phone || 'No Phone'}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${targetUser.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {targetUser.isApproved ? 'Active' : 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Documents Section */}
            <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                            <FileText size={20} className="text-brand-gold" />
                            Legal Documents & Uploads
                        </h3>
                        <p className="text-sm text-gray-500">All files uploaded by this user.</p>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{targetUser.documents.length} Files</span>
                </div>

                {targetUser.documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p>No documents found for this user.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Uploaded</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {targetUser.documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                                            <FileText size={16} className="text-brand-blue" />
                                            {doc.filename}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {(doc.size / 1024).toFixed(2)} KB
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <a
                                                href={`/api/documents/${doc.id}`}
                                                className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-dark font-medium transition-colors"
                                                target="_blank"
                                            >
                                                <Download size={14} /> Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Intake Data Grid */}
            <div className="space-y-8">
                {intakePhases.map((phase) => {
                    // Filter questions that have answers or are relevant? 
                    // For Admin view, let's show all questions that have answers, 
                    // or maybe just iterate all and show "Not answered" to be thorough.
                    // Let's hide questions that were conditional and NOT met? 
                    // That's hard to calculate without re-running logic. 
                    // Simplest: Show phase if at least one answer exists.

                    const hasAnswers = phase.questions.some(q => intakeData[q.id]);
                    if (!hasAnswers && phase.id !== 'phase-1') return null; // Always show phase 1 at least? Or just hide empty phases.

                    return (
                        <div key={phase.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-brand-dark">{phase.title}</h3>
                                <p className="text-sm text-gray-500">{phase.description}</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {phase.questions.map((q) => {
                                    // Optional: Hide questions logic based on answers could be complex. 
                                    // For now, let's just show them if they have a value OR if they are top-level.
                                    // If a conditional question has no value, it might be irrelevant.
                                    const val = intakeData[q.id];
                                    if ((val === undefined || val === null || val === '') && q.conditional) return null;

                                    return (
                                        <div key={q.id} className="break-inside-avoid">
                                            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                                {q.label}
                                            </dt>
                                            <dd className="text-gray-900 font-medium text-sm leading-relaxed">
                                                {renderAnswer(q)}
                                            </dd>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {!businessProfile && (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">User has not started the intake process.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
