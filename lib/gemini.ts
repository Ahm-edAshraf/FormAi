import { GoogleGenAI } from '@google/genai'

/**
 * Server-only Gemini client factory.
 * Ensure GEMINI_API_KEY is set in the server environment.
 */
export function getGeminiClient() {
  if (typeof window !== 'undefined') {
    throw new Error('getGeminiClient must be called on the server only')
  }
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY in environment')
  }
  return new GoogleGenAI({ apiKey: key })
}


