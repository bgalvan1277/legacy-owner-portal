import React from 'react';
import { Question } from '@/app/intakeConfig';

interface QuestionFieldProps {
    question: Question;
    value: any;
    onChange: (id: string, value: any) => void;
    error?: string;
}

export default function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onChange(question.id, e.target.value);
    };

    const handleBooleanChange = (val: boolean) => {
        onChange(question.id, val);
    };

    const handleCheckboxChange = (optionValue: string, checked: boolean) => {
        const currentValues = Array.isArray(value) ? value : [];
        if (checked) {
            onChange(question.id, [...currentValues, optionValue]);
        } else {
            onChange(question.id, currentValues.filter((v: string) => v !== optionValue));
        }
    };

    return (
        <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
                {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>

            {/* TEXT / EMAIL / TEL / NUMBER / DATE */}
            {['text', 'email', 'tel', 'number', 'date'].includes(question.type) && (
                <input
                    type={question.type}
                    value={value || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-400"
                    placeholder={`Enter ${question.label.toLowerCase()}...`}
                />
            )}

            {/* TEXTAREA */}
            {question.type === 'textarea' && (
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-400"
                    placeholder={`Enter ${question.label.toLowerCase()}...`}
                />
            )}

            {/* SELECT */}
            {question.type === 'select' && (
                <select
                    value={value || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all bg-white"
                >
                    <option value="">Select an option...</option>
                    {question.options?.map((opt) => {
                        const label = typeof opt === 'string' ? opt : opt.label;
                        const val = typeof opt === 'string' ? opt : opt.value;
                        return <option key={val} value={val}>{label}</option>
                    })}
                </select>
            )}

            {/* BOOLEAN */}
            {question.type === 'boolean' && (
                <div className="flex gap-4">
                    <button
                        onClick={() => handleBooleanChange(true)}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${value === true ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'}`}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleBooleanChange(false)}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${value === false ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'}`}
                    >
                        No
                    </button>
                </div>
            )}

            {/* CHECKBOX GROUP */}
            {question.type === 'checkbox-group' && (
                <div className="space-y-2">
                    {question.options?.map((opt) => {
                        const label = typeof opt === 'string' ? opt : opt.label;
                        const val = typeof opt === 'string' ? opt : opt.value;
                        const isChecked = Array.isArray(value) && value.includes(val);

                        return (
                            <label key={val} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleCheckboxChange(val, e.target.checked)}
                                    className="w-5 h-5 text-brand-blue rounded focus:ring-brand-blue"
                                />
                                <span className="text-gray-700">{label}</span>
                            </label>
                        )
                    })}
                </div>
            )}

            {/* FILE UPLOAD (Mock) */}
            {question.type === 'file' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-blue transition-colors cursor-pointer bg-gray-50">
                    <p className="text-brand-dark font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG up to 10MB</p>
                    <input type="file" className="hidden" onChange={(e) => onChange(question.id, e.target.files?.[0]?.name || 'mock_file.pdf')} />
                    {value && <div className="mt-2 text-sm text-green-600 font-semibold ">{value} (Mock Uploaded)</div>}
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
