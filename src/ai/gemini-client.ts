import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
  Content,
} from '@google/generative-ai';
import type { GeminiResponse, PersonaMode } from '@/types/game';

// ─── Constants ──────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.0-flash';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ─── Singleton Client ───────────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your environment variables.'
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function getModel(): GenerativeModel {
  if (!model) {
    const client = getClient();
    const generationConfig: GenerationConfig = {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    };
    model = client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
    });
  }
  return model;
}

// ─── JSON Parsing ───────────────────────────────────────────────────────────

function extractJSON(rawText: string): string {
  // Remove markdown code fences if present
  let cleaned = rawText.trim();

  // Handle ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Sometimes the model wraps in extra text before/after JSON
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return cleaned;
}

function parseGeminiJSON(rawText: string): GeminiResponse {
  const jsonStr = extractJSON(rawText);

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and normalize the response
    const validPersonas: PersonaMode[] = [
      'analyst',
      'entertainer',
      'cocky',
      'panicked',
      'dramatic',
    ];

    const response: GeminiResponse = {
      question: typeof parsed.question === 'string' ? parsed.question : '',
      intent: typeof parsed.intent === 'string' ? parsed.intent : '',
      confidence:
        typeof parsed.confidence === 'number'
          ? Math.min(100, Math.max(0, parsed.confidence))
          : 0,
      personaMode: validPersonas.includes(parsed.personaMode)
        ? parsed.personaMode
        : 'analyst',
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      isGuess: typeof parsed.isGuess === 'boolean' ? parsed.isGuess : false,
      guess:
        typeof parsed.guess === 'string' && parsed.guess.length > 0
          ? parsed.guess
          : null,
      eliminatedCount:
        typeof parsed.eliminatedCount === 'number'
          ? parsed.eliminatedCount
          : undefined,
      remainingCount:
        typeof parsed.remainingCount === 'number'
          ? parsed.remainingCount
          : undefined,
    };

    return response;
  } catch (parseError) {
    console.error('[GeminiClient] JSON parse error:', parseError);
    console.error('[GeminiClient] Raw text was:', rawText);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

// ─── Retry Helper ───────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Main Query Function ────────────────────────────────────────────────────

export async function queryGemini(
  systemPrompt: string,
  conversationHistory: Content[]
): Promise<GeminiResponse> {
  const generativeModel = getModel();

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const chat = generativeModel.startChat({
        history: conversationHistory,
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      });

      // Send a continuation prompt to get the next question
      const result = await chat.sendMessage(
        'Based on the conversation so far, provide your next response in the required JSON format.'
      );

      const responseText = result.response.text();

      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      return parseGeminiJSON(responseText);
    } catch (error: unknown) {
      lastError =
        error instanceof Error ? error : new Error('Unknown Gemini error');
      console.error(
        `[GeminiClient] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError.message
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt); // Exponential-ish backoff
      }
    }
  }

  throw new Error(
    `Gemini query failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}

// ─── Direct Single-Shot Query ───────────────────────────────────────────────

export async function queryGeminiDirect(
  systemPrompt: string,
  userMessage: string
): Promise<GeminiResponse> {
  const generativeModel = getModel();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await generativeModel.generateContent({
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      });

      const responseText = result.response.text();

      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      return parseGeminiJSON(responseText);
    } catch (error: unknown) {
      lastError =
        error instanceof Error ? error : new Error('Unknown Gemini error');
      console.error(
        `[GeminiClient] Direct attempt ${attempt}/${MAX_RETRIES} failed:`,
        lastError.message
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    `Gemini direct query failed after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}
