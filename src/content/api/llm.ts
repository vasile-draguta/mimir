import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from './system-prompt';

export interface SelectionContext {
  selected: string;
  before?: string;
  after?: string;
}

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

export async function generateContext(context: SelectionContext) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Please set VITE_GROQ_API_KEY in your .env file.'
    );
  }

  const groq = createGroq({
    apiKey: apiKey,
  });

  const prompt = buildPrompt(context);

  const response = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: SYSTEM_PROMPT,
    prompt,
  });

  return response.text;
}
