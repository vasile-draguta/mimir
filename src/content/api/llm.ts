export interface SelectionContext {
  selected: string;
  before?: string;
  after?: string;
}

interface ContextResponse {
  context: string;
}

interface ErrorResponse {
  error: string;
}

export async function generateContext(
  context: SelectionContext
): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'API configuration missing. Please set VITE_API_URL and VITE_API_KEY in your .env file.'
    );
  }

  const response = await fetch(`${apiUrl}/api/context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to generate context');
  }

  const data: ContextResponse = await response.json();
  return data.context;
}
