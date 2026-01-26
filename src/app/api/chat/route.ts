import { commercialAdvisorFlow } from '@/ai/chatbot';

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set. Please check .env.local');
        }
        const { prompt, history } = await req.json();
        const response = await commercialAdvisorFlow({ prompt, history });
        return Response.json({ text: response });
    } catch (error: any) {
        console.error('Error in chat route detailed:', error);
        if (error.message) console.error('Error message:', error.message);
        if (error.stack) console.error('Error stack:', error.stack);

        // Check for missing API key indication (safe check)
        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is not set in environment variables.');
        }

        return Response.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
