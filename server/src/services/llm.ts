import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from './system-prompt.js';
import type { SelectionContext } from '../types/index.js';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    'GROQ_API_KEY is not configured. Please set it in your .env file.'
  );
}

const groq = createGroq({ apiKey });

function buildPrompt(context: SelectionContext): string {
  let prompt =
    'User task: Provide a contextual explanation for the highlighted text below.\n\n';

  if (context.before) {
    prompt += `[Preceding context]: ...${context.before}\n\n`;
  }

  prompt += `[Selected text]: ${context.selected}`;

  if (context.after) {
    prompt += `\n\n[Following context]: ${context.after}...`;
  }

  return prompt;
}

export async function generateContext(
  context: SelectionContext
): Promise<string> {
  const prompt = buildPrompt(context);

  const response = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: SYSTEM_PROMPT,
    prompt,
  });

  return response.text;
}
