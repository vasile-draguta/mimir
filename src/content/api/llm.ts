export interface SelectionContext {
  selected: string;
  before?: string;
  after?: string;
  model?: string;
  sourceUrl?: string;
}

interface BackgroundResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export async function generateContext(
  context: SelectionContext
): Promise<string> {
  try {
    const response: BackgroundResponse = await chrome.runtime.sendMessage({
      type: 'GENERATE_CONTEXT',
      payload: {
        ...context,
        sourceUrl: window.location.href,
      },
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate context');
    }

    return response.data!;
  } catch (error) {
    const errorMessage = (error as Error).message || '';

    if (
      errorMessage.includes('Extension context invalidated') ||
      errorMessage.includes('message port closed')
    ) {
      throw new Error('Extension was updated. Please refresh the page.');
    }

    throw error;
  }
}
