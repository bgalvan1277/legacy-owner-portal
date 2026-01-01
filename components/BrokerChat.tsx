"use client";

import { useState, useEffect, useRef } from 'react';
import { useUI } from '@/app/UIContext';
import { usePathname } from 'next/navigation';
import { X, Send, Bot } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function BrokerChat() {
    const { isChatOpen, setIsChatOpen } = useUI();
    const pathname = usePathname();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Hello, I'm your Barnes Walker assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const pageName = getPageName(pathname);
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    pageContext: pageName
                })
            });

            const data = await res.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "Sorry, I couldn't reach the server.",
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting to my brain right now.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const getPageName = (path: string) => {
        if (path === '/') return 'Login';
        if (path === '/portal/dashboard') return 'Mission Control';
        if (path.includes('/portal/intake')) return 'Incubator Intake';
        if (path.includes('/portal/documents')) return 'Legal Documents';
        if (path.includes('/portal/admin')) return 'Admin Console';
        if (path.includes('/portal/profile')) return 'Settings';
        return 'Owner Portal';
    };

    if (!isChatOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={() => setIsChatOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[40%] bg-[#FAF9F6] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="bg-[#1a2f27] text-white p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-gold/20 p-2 rounded-full">
                            <Bot size={24} className="text-brand-gold" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Business Concierge</h2>
                            <p className="text-xs text-brand-gold/80">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                                ${msg.sender === 'user'
                                    ? 'bg-[#2c4a3e] text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
                            `}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f27] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-800"
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="bg-[#1a2f27] text-white p-3 rounded-xl hover:bg-[#2c4a3e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
