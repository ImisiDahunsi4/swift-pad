import { createAssemblyAI } from '@ai-sdk/assemblyai';
import { AssemblyAI } from 'assemblyai';

// For AI SDK integration
export const assemblyaiClient = createAssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY ?? '',
});

// For direct API usage
export function getAssemblyAIClient(apiKey?: string) {
  return new AssemblyAI({
    apiKey: apiKey || process.env.ASSEMBLYAI_API_KEY || '',
  });
}

// Dynamic client for BYOK (Bring Your Own Key)
export function assemblyaiTranscriptionClient(apiKey?: string) {
  return createAssemblyAI({
    apiKey: apiKey || process.env.ASSEMBLYAI_API_KEY || '',
  });
}