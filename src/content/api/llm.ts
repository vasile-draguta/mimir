import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from './system-prompt';

export async function generateContext(text: string) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Please set VITE_GROQ_API_KEY in your .env file.'
    );
  }

  const groq = createGroq({
    apiKey: apiKey,
  });

  const response = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: SYSTEM_PROMPT,
    prompt: `User task: Provide a contextual explanation for the text below.\n\nText: ${text}`,
  });

  console.log(response);

  return response.text;
}
