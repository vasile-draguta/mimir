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

const ALLOWED_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'moonshotai/kimi-k2-instruct-0905',
] as const;

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

const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export async function generateContext(
  context: SelectionContext
): Promise<string> {
  const prompt = buildPrompt(context);
  const modelId = context.model || DEFAULT_MODEL;

  if (!ALLOWED_MODELS.includes(modelId as typeof ALLOWED_MODELS[number])) {
    throw new Error(`Model "${modelId}" is not allowed. Allowed models: ${ALLOWED_MODELS.join(', ')}`);
  }

  const response = await generateText({
    model: groq(modelId),
    system: SYSTEM_PROMPT,
    prompt,
  });

  return response.text;
}
