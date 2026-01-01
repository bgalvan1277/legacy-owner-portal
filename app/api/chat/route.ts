import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateContentWithRetry(model: any, prompt: string) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            return await model.generateContent(prompt);
        } catch (error: any) {
            attempts++;
            const isRateLimit = error.message?.includes('429') ||
                error.message?.includes('Rate exceeded') ||
                error.message?.includes('quota') ||
                error.status === 429;

            if (isRateLimit && attempts < maxAttempts) {
                console.warn(`Gemini Rate Limit hit. Sleeping 5 seconds... (Attempt ${attempts}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            throw error;
        }
    }
}

export async function POST(request: Request) {
    try {
        const { messages, pageContext } = await request.json();
        const lastMessage = messages[messages.length - 1];

        // 2. Fetch Knowledge Base
        const snippets = await prisma.knowledgeSnippet.findMany();
        const knowledgeText = snippets.map(s => `- ${s.content}`).join('\n');

        // 3. Construct System Prompt
        const systemPrompt = `
You are the Barnes Walker Assistant, a helpful AI for the "Owner Portal" application.
Your goal is to assist users with navigating the portal and answering general questions about Barnes Walker.

### CRITICAL GUARDRAILS:
1. **NO LEGAL ADVICE**: You are NOT a lawyer. Do not give legal advice. If asked, explicitly state you cannot provide legal advice and recommend consulting a professional.
2. **NO VALUATIONS**: Do not attempt to provide business valuations or financial advice.
3. **TONE**: Professional, helpful, concise, and polite.

### KNOWLEDGE BASE (Use this to answer questions):
${knowledgeText}

### CONTEXT:
The user is currently viewing the page: "${pageContext}". Use this to be helpful.

Answer the user's question based on the above.
`;

        // Construct full prompt for caching
        const prompt = `${systemPrompt}\n\nUser Question: ${lastMessage.text}`;

        // --- CACHE CHECK ---
        const promptHash = crypto.createHash('md5').update(prompt).digest('hex');
        const cachedEntry = await prisma.chatCache.findUnique({
            where: { promptHash },
        });

        if (cachedEntry) {
            console.log('CACHE HIT:', promptHash);
            return NextResponse.json({ reply: cachedEntry.response });
        }
        console.log('CACHE MISS:', promptHash);
        // -------------------

        // 4. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const result = await generateContentWithRetry(model, prompt);
        const response = result.response;
        const text = response.text();

        // --- CACHE SAVE ---
        try {
            await prisma.chatCache.create({
                data: {
                    promptHash,
                    prompt: prompt.substring(0, 5000), // Truncate if too long, just for debug
                    response: text,
                },
            });
        } catch (e) {
            console.error('Failed to save to cache:', e);
        }
        // ------------------

        return NextResponse.json({ reply: text });

    } catch (error: any) {
        console.error('Chat API Error - Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
        console.error('Chat API Error - Details:', error);

        let errorMessage = "I'm having trouble connecting to my brain right now. Please try again later.";

        if (error.message?.includes('404') || error.message?.includes('Not Found')) {
            errorMessage += " (Model not found or API Key invalid).";
        }

        return NextResponse.json({ reply: errorMessage });
    }
}
