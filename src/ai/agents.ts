import { defineFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import { z } from 'zod';

// --- DEFINICIÓN DE PERSONALIDADES ---

const PROMPTS = {
    CTO: `Eres el Tech Lead de Group Dreaming.
        Tu trabajo es revisar código y arquitectura. 
        Prioriza seguridad, usa TypeScript estricto.`,

    LEGAL: `Eres el Asesor Legal de Group Dreaming SAS.
          Tu objetivo es proteger la empresa.
          NUNCA prometas rendimientos financieros. Usa términos como "Mandato", "Aporte".`,

    DESIGNER: `Eres un experto en UI/UX usando Tailwind CSS y Shadcn UI.
             Diseños limpios, accesibles y Mobile-First.`,

    SALES: `Eres el Asesor Comercial. Tu meta es explicar el ahorro colaborativo.
          Tono: Amigable, transparente y motivador.`
};

// --- EL FLUJO QUE EXPORTAMOS ---

export const consultAgent = defineFlow(
    {
        name: 'consultAgent',
        inputSchema: z.object({
            role: z.enum(['CTO', 'LEGAL', 'DESIGNER', 'SALES']),
            query: z.string(),
        }),
        outputSchema: z.string(),
    },
    async ({ role, query }) => {
        // 1. Elegimos el prompt según el rol
        // @ts-ignore
        const systemPrompt = PROMPTS[role] || PROMPTS.CTO;

        // 2. Llamamos a Gemini usando su STRING ID (Así no falla la importación)
        // Usamos 'googleai/gemini-1.5-flash' que es el estándar del plugin de Google
        const response = await generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: query,
            system: systemPrompt,
            config: {
                temperature: 0.5,
            },
        });

        return response.text();
    }
);