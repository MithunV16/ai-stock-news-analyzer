import OpenAI from 'openai';
import { config } from '@/config/env';

let client: OpenAI | null = null;

/** Returns OpenAI client when API key is configured, otherwise null */
export function getOpenAIClient(): OpenAI | null {
  if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY.startsWith('sk-your-')) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  return client;
}

export function isOpenAiConfigured(): boolean {
  return getOpenAIClient() !== null;
}
