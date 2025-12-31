"use client";

import { useState, useEffect } from 'react';
import { Scale, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';

interface Doc {
    id: string;
    filename: string;
    fileType: string;
    size: number;
    createdAt: string;
}

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchDocs = async () => {
        try {
            const res = await fetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setSelectedFile(null);
                fetchDocs(); // Refresh list
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploaded file');
        } finally {
            setUploading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="font-[family-name:var(--font-geist-sans)] max-w-6xl mx-auto">
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold flex items-center gap-3">
                        <Scale size={32} /> Legal Documents
                    </h1>
                    <p className="text-gray-300 mt-2">Upload and manage necessary legal files for your case.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.png"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-brand-dark">Click to select file</span>
                                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="flex items-center gap-2 p-3 bg-brand-gold/10 rounded-lg text-sm text-brand-dark">
                                <FileText size={16} />
                                <span className="truncate flex-1">{selectedFile.name}</span>
                                <CheckCircle size={16} className="text-green-600" />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#085035] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Uploading...
                                </>
                            ) : (
                                'Upload File'
                            )}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Your Files</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center text-gray-400">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <FileText size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Variable</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {docs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-medium text-gray-900">{doc.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatBytes(doc.size)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
