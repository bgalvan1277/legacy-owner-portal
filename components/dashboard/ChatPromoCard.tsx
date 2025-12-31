"use client";

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useUI } from '@/app/UIContext';

export default function ChatPromoCard() {
    const { setIsChatOpen } = useUI();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#085035] opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl"></div>

            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-[#085035]">Meet Your 24/7 Deal Assistant</h2>
                    <span className="bg-green-100 text-[#085035] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} />
                        Powered by Gemini 3
                    </span>
                </div>

                <p className="text-gray-600 leading-relaxed max-w-2xl mb-8">
                    Selling a business comes with hundreds of questions. You don&apos;t have to wait for a meeting to get answers. Our AI is trained on Barnes Walker methodology to help you instantly understand valuation terms, tax concepts, and deal structures—completely privately.
                </p>
            </div>

            <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-2 bg-[#085035] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#06402a] transition-all self-start"
            >
                <MessageSquare size={20} />
                Open Broker Chat
            </button>
        </div>
    );
}
