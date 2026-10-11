/**
 * Puter.js AI Integration Utility for EduPath
 * Free client-side access to OpenAI API models without needing an API key.
 *
 * COPPA/FERPA Compliance:
 * Any outgoing prompt is sanitized to strip emails, phone numbers, and potential student identifiers
 * before sending to external AI models.
 */

export type PuterModel =
  | 'gpt-6-astra'
  | 'gpt-5.6-sol'
  | 'gpt-5.6-terra'
  | 'gpt-5.6-luna'
  | 'gpt-5.4-nano'
  | string;

/**
 * Sanitizes prompt text by scrubbing PII (emails, phone numbers, SSNs/IDs)
 * to comply with COPPA / FERPA standards.
 */
export function sanitizePromptForPrivacy(text: string): string {
  if (!text) return '';
  return text
    // Redact email addresses
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[STUDENT_EMAIL]')
    // Redact phone numbers (various formats)
    .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[STUDENT_PHONE]')
    // Redact SSN or 9-digit national IDs
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[STUDENT_ID]')
    // Redact explicit student ID patterns
    .replace(/\b(?:student[_\s]?id|sid)\s*[:=]?\s*[A-Za-z0-9_-]+/gi, '[STUDENT_ID]');
}

/**
 * Send a chat query to Puter.js AI engine
 */
export async function askPuterAI(
  prompt: string,
  model: PuterModel = 'gpt-5.6-sol'
): Promise<string> {
  const sanitizedPrompt = sanitizePromptForPrivacy(prompt);

  try {
    // Check if Puter.js is available via CDN window.puter
    if (typeof window !== 'undefined' && (window as any).puter?.ai) {
      const response: any = await (window as any).puter.ai.chat(sanitizedPrompt, { model });
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
      const response: any = await puter.ai.chat(sanitizedPrompt, { model });
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
