import React from 'react';
import { Phase, Question } from '@/app/intakeConfig';
import QuestionField from './QuestionField';

interface StepRendererProps {
    phase: Phase;
    formData: Record<string, any>;
    onChange: (id: string, value: any) => void;
    errors: Record<string, string>;
}

export default function StepRenderer({ phase, formData, onChange, errors }: StepRendererProps) {

    const shouldShowQuestion = (question: Question): boolean => {
        if (!question.conditional) return true;

        const { dependsOn, value } = question.conditional;
        const dependentValue = formData[dependsOn];

        return dependentValue === value;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-2">{phase.title}</h2>
            <p className="text-gray-600 mb-8">{phase.description}</p>

            <div className="space-y-2">
                {phase.questions.map((q) => {
                    if (!shouldShowQuestion(q)) return null;
                    return (
                        <QuestionField
                            key={q.id}
                            question={q}
                            value={formData[q.id]}
                            onChange={onChange}
                            error={errors[q.id]}
                        />
                    );
                })}
            </div>
        </div>
    );
}
