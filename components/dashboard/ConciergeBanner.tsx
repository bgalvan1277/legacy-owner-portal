"use client";

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useUI } from '@/app/UIContext';

export default function ConciergeBanner() {
    const { setIsChatOpen } = useUI();

    return (
        <div className="bg-[#0B3D2E] rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#FAF9F6] mb-4">Business Concierge: Your 24/7 Deal Expert</h2>
                <p className="text-[#FAF9F6]/90 leading-relaxed max-w-3xl">
                    Instantly decode complex Business terms, get clarification on valuation concepts, or understand tax implications. Our AI is specifically trained on Barnes Walker insights to provide confidential, immediate answers.
                </p>
            </div>

            <button
                onClick={() => setIsChatOpen(true)}
                className="bg-[#FAF9F6] text-[#0B3D2E] px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-3 shrink-0"
            >
                <MessageSquare size={20} />
                Ask a Question Now
            </button>
        </div>
    );
}
