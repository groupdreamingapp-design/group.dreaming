import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins = [];
// In production, the googleAI plugin is only added if the GEMINI_API_KEY is set.
if (process.env.NODE_ENV !== 'production' || process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.5-flash',
});
