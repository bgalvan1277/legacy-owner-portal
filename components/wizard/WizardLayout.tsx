import React from 'react';
import { intakePhases } from '@/app/intakeConfig';

interface WizardLayoutProps {
    currentPhaseId: string;
    children: React.ReactNode;
}

export default function WizardLayout({ currentPhaseId, children }: WizardLayoutProps) {
    const currentPhaseIndex = intakePhases.findIndex(p => p.id === currentPhaseId);
    // Progress calculation removed as bar is no longer used here.

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#FDFBF7]">
            {/* Main Wizard Content */}
            <div className="max-w-3xl mx-auto pt-8">
                {/* Progress Bar removed per user request */}
                <div className="mb-8">
                    <span className="md:hidden text-sm font-bold text-brand-dark opacity-60">Phase {currentPhaseIndex + 1} of {intakePhases.length}</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 min-h-[50vh]">
                    {children}
                </div>
            </div>
        </div>

    );
}
