'use server';

/**
 * @fileOverview Generates a daily encouragement message related to the user's savings goal.
 *
 * - dailySavingEncouragement - A function that generates the encouragement message.
 * - DailySavingEncouragementInput - The input type for the dailySavingEncouragement function.
 * - DailySavingEncouragementOutput - The return type for the dailySavingEncouragement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailySavingEncouragementInputSchema = z.object({
  savingsGoal: z
    .string()
    .describe('The user\'s savings goal, e.g., \'a down payment on a house\'.'),
  currentSavings: z
    .number()
    .describe('The user\'s current savings amount, in US dollars.'),
});
export type DailySavingEncouragementInput = z.infer<
  typeof DailySavingEncouragementInputSchema
>;

const DailySavingEncouragementOutputSchema = z.object({
  encouragementMessage: z
    .string()
    .describe('A short, motivational message to encourage the user to save.'),
});
export type DailySavingEncouragementOutput = z.infer<
  typeof DailySavingEncouragementOutputSchema
>;

export async function dailySavingEncouragement(
  input: DailySavingEncouragementInput
): Promise<DailySavingEncouragementOutput> {
  return dailySavingEncouragementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailySavingEncouragementPrompt',
  input: {schema: DailySavingEncouragementInputSchema},
  output: {schema: DailySavingEncouragementOutputSchema},
  prompt: `You are a motivational coach. Generate a short, encouraging message to motivate the user to continue saving towards their goal.

Savings Goal: {{{savingsGoal}}}
Current Savings: \${{{currentSavings}}}

Encouragement Message:`,
});

const dailySavingEncouragementFlow = ai.defineFlow(
  {
    name: 'dailySavingEncouragementFlow',
    inputSchema: DailySavingEncouragementInputSchema,
    outputSchema: DailySavingEncouragementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
