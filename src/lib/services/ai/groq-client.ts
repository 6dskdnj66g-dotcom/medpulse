import Groq from 'groq-sdk';
import { AIServiceError } from '@/lib/utils/errors';

const MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface GroqResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

/**
 * THE ONLY place that calls GROQ (groq-sdk, llama-3.3-70b-versatile).
 * Never use xAI / api.x.ai / XAI_API_KEY anywhere in the codebase.
 */
export async function callGroq(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<GroqResponse> {
  const {
    model = MODEL,
    temperature = 0.1,
    maxTokens = 2000,
    responseFormat = 'text',
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIServiceError('GROQ_API_KEY not configured');
  }

  try {
    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat === 'json_object'
        ? { response_format: { type: 'json_object' } }
        : {}),
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const usage = completion.usage;

    return {
      content,
      usage: {
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
      cost: 0,
    };
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError(
      `GROQ call failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      error
    );
  }
}

export async function streamGroq(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const { model = MODEL, temperature = 0.1, maxTokens = 2000 } = options;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new AIServiceError('GROQ_API_KEY not configured');

  try {
    const client = new Groq({ apiKey });
    const stream = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });
    return stream.toReadableStream() as ReadableStream<Uint8Array>;
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError(
      `GROQ stream failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      error
    );
  }
}
