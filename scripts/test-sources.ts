import { AIServiceError } from '@/lib/utils/errors';

const GROK_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokOptions {
  model?: 'grok-4-1-fast' | 'grok-4-1-fast-non-reasoning';
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface GrokResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

const PRICING = {
  'grok-4-1-fast': { input: 0.0000002, output: 0.0000005 },
  'grok-4-1-fast-non-reasoning': { input: 0.0000001, output: 0.0000003 },
};

/**
 * THE ONLY place that talks to Grok API.
 * All AI features must go through this client.
 */
export async function callGrok(
  messages: GrokMessage[],
  options: GrokOptions = {}
): Promise<GrokResponse> {
  const {
    model = 'grok-4-1-fast',
    temperature = 0.1,
    maxTokens = 2000,
    responseFormat = 'text',
  } = options;

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new AIServiceError('XAI_API_KEY not configured');
  }

  try {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(GROK_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new AIServiceError(`Grok API failed: ${res.status} — ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    const pricing = PRICING[model] || PRICING['grok-4-1-fast'];
    const cost =
      (usage.prompt_tokens || 0) * pricing.input +
      (usage.completion_tokens || 0) * pricing.output;

    return {
      content,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      cost,
    };
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError(
      `Grok call failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      error
    );
  }
}