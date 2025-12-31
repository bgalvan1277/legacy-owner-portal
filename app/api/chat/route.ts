import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

        // 4. Call Gemini
        // User requested Gemini 3 Flash.
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct history (simplified for now, just last message + system context)
        const prompt = `${systemPrompt}\n\nUser Question: ${lastMessage.text}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

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
