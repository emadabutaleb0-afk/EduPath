/**
 * Puter.js AI Integration Utility for EduPath
 * Free client-side access to AI models without needing an API key.
 *
 * Supported Models:
 * - "gpt-5.6-sol": Standard fast model
 * - "gpt-4o-mini": Lightweight and fast
 * - "gpt-4o": High intelligence
 * - "claude-3-5-sonnet": High reasoning
 */

export type PuterModel =
  | 'gpt-5.6-sol'
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'claude-3-5-sonnet'
  | 'deepseek-chat'
  | string;

/**
 * Check if Puter.js is loaded in the browser
 */
export function isPuterAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).puter?.ai?.chat === 'function';
}

/**
 * Wait for Puter.js to finish loading from CDN if called immediately on startup
 */
export async function waitForPuter(timeoutMs: number = 3000): Promise<boolean> {
  if (isPuterAvailable()) return true;
  if (typeof window === 'undefined') return false;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isPuterAvailable()) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return isPuterAvailable();
}

/**
 * Send a chat query to Puter.js AI engine
 */
export async function askPuterAI(
  prompt: string,
  model: PuterModel = 'gpt-5.6-sol'
): Promise<string> {
  try {
    const ready = await waitForPuter(2500);
    if (ready && (window as any).puter?.ai?.chat) {
      const response: any = await (window as any).puter.ai.chat(prompt, { model });
      if (typeof response === 'string') return response;
      if (typeof response?.message?.content === 'string') return response.message.content;
      if (response?.message?.content) return JSON.stringify(response.message.content);
      if (response?.text) return String(response.text);
      return String(response);
    }
  } catch (error) {
    console.warn(`Puter.js AI call with model '${model}' failed:`, error);
    // If the primary model failed, try a lightweight fallback model like gpt-4o-mini
    if (model !== 'gpt-4o-mini' && isPuterAvailable()) {
      try {
        const fallbackRes: any = await (window as any).puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
        if (typeof fallbackRes === 'string') return fallbackRes;
        if (typeof fallbackRes?.message?.content === 'string') return fallbackRes.message.content;
      } catch (fallbackError) {
        console.warn('Fallback model call also failed:', fallbackError);
      }
    }
  }

  throw new Error('Puter.js AI engine unavailable');
}
