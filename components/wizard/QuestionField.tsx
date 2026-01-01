import React from 'react';
import { Question } from '@/app/intakeConfig';

interface QuestionFieldProps {
    question: Question;
    value: any;
    onChange: (id: string, value: any) => void;
    error?: string;
}

export default function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {
    const [uploading, setUploading] = React.useState(false);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            // Store the full document object (id, filename) so we can link to it later
            if (data.success && data.document) {
                onChange(question.id, data.document);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-6 animate-in slide-in-from-bottom-2 duration-500">
            <label className="block text-sm font-semibold text-brand-dark mb-2">
                {question.label} {question.required && <span className="text-red-500">*</span>}
            </label>

            {/* TEXT / EMAIL / TEL / NUMBER / DATE */}
            {['text', 'email', 'tel', 'number', 'date', 'url'].includes(question.type) && (
                <input
                    type={question.type === 'url' ? 'text' : question.type}
                    value={typeof value === 'object' ? '' : (value || '')}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-400"
                    placeholder={question.placeholder || `Enter ${question.label.toLowerCase()}...`}
                />
            )}

            {/* TEXTAREA */}
            {question.type === 'textarea' && (
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-400"
                    placeholder={question.placeholder || `Enter ${question.label.toLowerCase()}...`}
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

            {/* FILE UPLOAD (Real) */}
            {question.type === 'file' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-blue transition-colors cursor-pointer bg-gray-50">
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-brand-dark font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG up to 10MB</p>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            {/* Display Value */}
                            {value && (
                                <div className="mt-4 p-3 bg-white border rounded-lg flex items-center gap-2 text-sm text-green-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-medium truncate max-w-xs">{value.filename || value.name || value}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
