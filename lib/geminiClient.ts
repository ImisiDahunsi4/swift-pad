import { GoogleGenerativeAI, GenerativeModel } from '@google/genai';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText as aiSdkGenerateText, streamText } from 'ai';

// Initialize the Gemini client with API key (direct API)
export function getGeminiClient(apiKey?: string) {
  return new GoogleGenerativeAI(
    apiKey || process.env.GEMINI_API_KEY || ''
  );
}

// Get a specific Gemini model (direct API)
export function getGeminiModel(modelName: string = 'gemini-2.5-flash', apiKey?: string): GenerativeModel {
  const genAI = getGeminiClient(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

// Get AI SDK Google provider instance
export function getGeminiAiSdk(apiKey?: string) {
  return createGoogleGenerativeAI({
    apiKey: apiKey || process.env.GEMINI_API_KEY || '',
  });
}

// Create a streaming text generation function using direct API
export async function* streamGeminiText(
  prompt: string,
  modelName: string = 'gemini-2.5-flash',
  apiKey?: string
) {
  const model = getGeminiModel(modelName, apiKey);

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// Function to generate text without streaming using direct API
export async function generateGeminiText(
  prompt: string,
  modelName: string = 'gemini-2.5-flash',
  apiKey?: string
): Promise<string> {
  const model = getGeminiModel(modelName, apiKey);

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });

  return result.response.text();
}

// Function to generate text using AI SDK
export async function generateGeminiTextAiSdk(
  prompt: string,
  modelName: string = 'gemini-2.5-flash',
  apiKey?: string
): Promise<string> {
  const googleAi = getGeminiAiSdk(apiKey);

  const { text } = await aiSdkGenerateText({
    model: googleAi(modelName),
    prompt,
    temperature: 0.7,
    maxTokens: 2048,
  });

  return text;
}

// Function to stream text using AI SDK
export async function streamGeminiTextAiSdk(
  prompt: string,
  modelName: string = 'gemini-2.5-flash',
  apiKey?: string
) {
  const googleAi = getGeminiAiSdk(apiKey);

  return streamText({
    model: googleAi(modelName),
    prompt,
    temperature: 0.7,
    maxTokens: 2048,
  });
}