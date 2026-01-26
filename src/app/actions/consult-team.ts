'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const PROMPTS = {
    CTO: `Eres el Tech Lead. Responde corto, técnico y prioriza seguridad.`,
    LEGAL: `Eres el Abogado. Responde formal, usa términos legales argentinos.`,
    DESIGNER: `Eres Diseñador UX. Responde sobre Tailwind y UI minimalista.`,
    SALES: `Eres Vendedor. Responde empático y persuasivo.`
};

export async function askTheTeam(role: 'CTO' | 'LEGAL' | 'DESIGNER' | 'SALES', query: string) {
    try {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY;

        // Verificamos si existe la llave
        if (!apiKey) return { success: false, text: "Error: No hay API Key en .env.local" };

        const genAI = new GoogleGenerativeAI(apiKey);

        // --- CAMBIO CLAVE: Usamos un modelo que SÍ tienes en tu lista ---
        // Según tu JSON, tienes acceso a "gemini-2.0-flash". ¡Usémoslo!
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const fullPrompt = `ROL: ${role}. INSTRUCCIÓN: ${PROMPTS[role]}. PREGUNTA: ${query}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        return { success: true, text: response.text() };

    } catch (error: any) {
        console.error("🔴 ERROR GOOGLE:", error.message);
        return { success: false, text: `Error: ${error.message}` };
    }
}