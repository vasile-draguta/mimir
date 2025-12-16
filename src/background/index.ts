export interface SelectionContext {
  selected: string;
  before?: string;
  after?: string;
  model?: string;
}

interface ContextResponse {
  context: string;
}

interface ErrorResponse {
  error: string;
}

interface GenerateContextMessage {
  type: 'GENERATE_CONTEXT';
  payload: SelectionContext;
}

type Message = GenerateContextMessage;

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'GENERATE_CONTEXT') {
      handleGenerateContext(message.payload)
        .then((result) => sendResponse({ success: true, data: result }))
        .catch((error) =>
          sendResponse({ success: false, error: (error as Error).message })
        );

      return true;
    }
  }
);

async function handleGenerateContext(
  context: SelectionContext
): Promise<string> {
  if (!API_URL || !API_KEY) {
    throw new Error(
      'API configuration missing. Please set VITE_API_URL and VITE_API_KEY in your .env file.'
    );
  }

  const storage = await chrome.storage.local.get({ model: DEFAULT_MODEL });
  const model = storage.model as string;

  const response = await fetch(`${API_URL}/api/context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ ...context, model }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to generate context');
  }

  const data: ContextResponse = await response.json();
  return data.context;
}
