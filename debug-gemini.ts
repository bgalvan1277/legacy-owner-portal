
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    console.log('--- GEMINI DEBUG ---');
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        console.error('ERROR: GEMINI_API_KEY is not set in environment.');
        return;
    }
    console.log('API Key Found:', key.substring(0, 8) + '...');

    try {
        const genAI = new GoogleGenerativeAI(key);
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Listing models...');
        // Note: listModels is not directly on genAI instance usually? 
        // Documentation says: 
        // const { GoogleGenerativeAI } = require("@google/generative-ai");
        // const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        // But for node, we might need to use a different approach or just try 'gemini-1.0-pro'

        // Actually, let's try 'gemini-1.0-pro' which is often the stable one.
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        console.log('Sending test prompt...');
        const result = await model.generateContent("Hello, are you alive?");
        const response = await result.response;
        const text = response.text();

        console.log('SUCCESS! Response received:');
        console.log(text);
    } catch (error) {
        console.error('CONNECTION FAILED:');
        console.error(error);
    }
}

main();
