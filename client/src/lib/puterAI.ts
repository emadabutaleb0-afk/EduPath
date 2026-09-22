/**
 * Puter.js AI Integration Utility for EduPath
 * Free client-side access to OpenAI API models without needing an API key.
 *
 * Supported Models:
 * - "gpt-6-astra": Newest & most capable model
 * - "gpt-5.6-sol": Flagship model
 * - "gpt-5.6-terra": Mid-tier model
 * - "gpt-5.6-luna": Smallest and cheapest model
 * - "gpt-5.4-nano": Fast text generation model
 */

export type PuterModel =
  | 'gpt-6-astra'
  | 'gpt-5.6-sol'
  | 'gpt-5.6-terra'
  | 'gpt-5.6-luna'
  | 'gpt-5.4-nano'
  | string;

/**
 * Send a chat query to Puter.js AI engine
 */
export async function askPuterAI(
  prompt: string,
  model: PuterModel = 'gpt-5.6-sol'
): Promise<string> {
  try {
    // Check if Puter.js is available via CDN window.puter
    if (typeof window !== 'undefined' && (window as any).puter?.ai) {
      const response: any = await (window as any).puter.ai.chat(prompt, { model });
      if (typeof response === 'string') return response;
      if (typeof response?.message?.content === 'string') return response.message.content;
      if (response?.message?.content) return JSON.stringify(response.message.content);
      if (response?.text) return String(response.text);
      return String(response);
    }

    // Try dynamic import of @heyputer/puter.js npm module
    const puterModule: any = await import('@heyputer/puter.js');
    const puter = puterModule.puter || puterModule.default || puterModule;
    if (puter?.ai) {
      const response: any = await puter.ai.chat(prompt, { model });
      if (typeof response === 'string') return response;
      if (typeof response?.message?.content === 'string') return response.message.content;
      if (response?.message?.content) return JSON.stringify(response.message.content);
      if (response?.text) return String(response.text);
      return String(response);
    }
  } catch (error) {
    console.warn(`Puter.js AI call with model '${model}' encountered an issue:`, error);
  }

  throw new Error('Puter.js AI engine unavailable');
}
