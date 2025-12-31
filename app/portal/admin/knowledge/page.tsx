"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Save } from 'lucide-react';

interface Snippet {
    id: string;
    content: string;
    createdAt: string;
}

export default function KnowledgeBasePage() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [newContent, setNewContent] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchSnippets = async () => {
        try {
            const res = await fetch('/api/admin/knowledge');
            if (res.ok) {
                const data = await res.json();
                setSnippets(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnippets();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        setSaving(true);
        try {
            const res = await fetch('/api/admin/knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });

            if (res.ok) {
                setNewContent('');
                fetchSnippets();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this knowledge snippet?')) return;

        try {
            await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
            setSnippets(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="font-[family-name:var(--font-geist-sans)] max-w-6xl mx-auto">
            <div className="bg-brand-dark text-white rounded-2xl p-8 mb-8 shadow-lg flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-gold flex items-center gap-3">
                        <BookOpen size={32} /> Knowledge Base
                    </h1>
                    <p className="text-gray-300 mt-2">Train the AI Assistant with custom knowledge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add New Section */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus size={20} /> Add Knowledge
                    </h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Information Snippet
                            </label>
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all resize-none"
                                placeholder="E.g., Our office hours are 9am-5pm EST."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                This text will be injected into the AI&apos;s context. Be clear and factual.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={!newContent.trim() || saving}
                            className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-medium shadow hover:bg-[#085035] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Save to Knowledge Base
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Current Knowledge ({snippets.length})</h2>

                    {loading ? (
                        <div className="p-12 flex justify-center text-gray-400">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : snippets.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
                            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No knowledge snippets added yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {snippets.map((snippet) => (
                                <div key={snippet.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between gap-4 group">
                                    <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                                        {snippet.content}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(snippet.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                                        title="Delete Snippet"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
