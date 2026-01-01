"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { intakePhases, LogicRule } from '@/app/intakeConfig';
import WizardLayout from '@/components/wizard/WizardLayout';
import StepRenderer from '@/components/wizard/StepRenderer';
import { useSearchParams } from 'next/navigation';

function WizardContent() {
    const searchParams = useSearchParams();
    const stepParam = searchParams.get('step');
    const initialStep = stepParam ? parseInt(stepParam) : 0;

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialStep);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attorneyFlag, setAttorneyFlag] = useState<string | null>(null);

    const currentPhase = intakePhases[currentPhaseIndex];

    // Load draft on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (!res.ok) throw new Error('Failed to load profile');
                const data = await res.json();
                if (data.intakeData) {
                    setFormData(data.intakeData);
                }
            } catch (e) {
                console.error("Failed to load draft", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Also sync step if URL param changes? 
    // For now initialStep is enough, but effectively if we navigate via Link we want it to update.
    useEffect(() => {
        const step = searchParams.get('step');
        if (step !== null) {
            setCurrentPhaseIndex(parseInt(step));
        }
    }, [searchParams]);

    // Save draft
    const saveDraft = async (data: any) => {
        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intakeData: data })
            });
        } catch (e) {
            console.error("Failed to save draft", e);
        }
    };

    const handleDataChange = (id: string, value: any) => {
        const newData = { ...formData, [id]: value };
        setFormData(newData);

        // Clear error if exists
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const processLogic = (): boolean => {
        let nextPhaseIndex = currentPhaseIndex + 1;

        // Check logic for all answered questions in current phase
        currentPhase.questions.forEach(q => {
            const answer = formData[q.id];
            if (answer !== undefined && q.logic) {
                q.logic.forEach((rule: LogicRule) => {
                    const isMatch = Array.isArray(answer)
                        ? answer.includes(rule.triggerValue)
                        : answer === rule.triggerValue;

                    if (isMatch) {
                        if (rule.action === 'flag_attorney') {
                            setAttorneyFlag(rule.message || "Attorney Review Required");
                            alert(`Notice: ${rule.message || "Attorney Review Required"}`);
                        }
                        if (rule.action === 'jump_to_phase' && rule.targetIds) {
                            const targetPhaseId = rule.targetIds[0];
                            const targetIndex = intakePhases.findIndex(p => p.id === targetPhaseId);
                            if (targetIndex !== -1) {
                                nextPhaseIndex = targetIndex;
                            }
                        }
                    }
                });
            }
        });

        // Proceed
        if (nextPhaseIndex < intakePhases.length) {
            setCurrentPhaseIndex(nextPhaseIndex);
        } else {
            alert("Intake Submitted!");
        }
        return true;
    };

    const validatePhase = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        currentPhase.questions.forEach(q => {
            if (q.conditional) {
                if (formData[q.conditional.dependsOn] !== q.conditional.value) return;
            }

            if (q.required && (formData[q.id] === undefined || formData[q.id] === '')) {
                newErrors[q.id] = 'This field is required';
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validatePhase()) {
            saveDraft(formData);
            processLogic();
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentPhaseIndex > 0) {
            setCurrentPhaseIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <WizardLayout currentPhaseId={currentPhase.id}>
            {attorneyFlag && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">⚠️</div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <strong>Attention Needed:</strong> {attorneyFlag}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <StepRenderer
                phase={currentPhase}
                formData={formData}
                onChange={handleDataChange}
                errors={errors}
            />

            <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button
                    onClick={handleBack}
                    disabled={currentPhaseIndex === 0}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${currentPhaseIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="bg-brand-dark text-brand-white px-8 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-[#2c4a3e] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {currentPhaseIndex === intakePhases.length - 1 ? 'Submit' : 'Next Step'}
                </button>
            </div>
        </WizardLayout>
    );
}

export default function IntakePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Wizard...</div>}>
            <WizardContent />
        </Suspense>
    );
}
