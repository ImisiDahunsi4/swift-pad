# Google Generative AI Integration

This document outlines the changes made to properly integrate Google Generative AI with the Swift Pad application.

## Changes Made

1. **Added AI SDK Integration**
   - Added `@ai-sdk/google` package (version 1.2.22) to `package.json`
   - Kept the direct `@google/genai` package for backward compatibility

2. **Updated Gemini Client**
   - Created dual implementation supporting both direct API and AI SDK
   - Added new functions:
     - `getGeminiAiSdk()`: Returns AI SDK Google provider
     - `generateGeminiTextAiSdk()`: Uses AI SDK for text generation
     - `streamGeminiTextAiSdk()`: Uses AI SDK for streaming text

3. **Fixed Model Names**
   - Corrected model name from `gemini-2.5-flash-flash` to `gemini-2.5-flash`
   - Updated to use latest Gemini models

4. **Updated Environment Variables**
   - Added `GOOGLE_GENERATIVE_AI_API_KEY` to `.example.env`
   - This is the environment variable expected by the AI SDK

## Usage Examples

### Text Generation with AI SDK

```typescript
import { getGeminiAiSdk } from "@/lib/geminiClient";
import { generateText } from "ai";

// Get the AI SDK Google provider
const googleAi = getGeminiAiSdk(apiKey);

// Generate text
const { text } = await generateText({
  model: googleAi('gemini-2.5-flash'),
  prompt: "Your prompt here",
  temperature: 0.7,
  maxTokens: 2048,
});
```

### Streaming Text with AI SDK

```typescript
import { getGeminiAiSdk } from "@/lib/geminiClient";
import { streamText } from "ai";

// Get the AI SDK Google provider
const googleAi = getGeminiAiSdk(apiKey);

// Stream text
const { textStream } = await streamText({
  model: googleAi('gemini-2.5-flash'),
  prompt: "Your prompt here",
  temperature: 0.7,
  maxTokens: 2048,
});

// Process the stream
for await (const chunk of textStream) {
  console.log(chunk);
}
```

## Benefits of Using AI SDK

1. **Standardized Interface**: Consistent API across different AI providers
2. **Type Safety**: Better TypeScript support and error checking
3. **Streaming Support**: Built-in streaming capabilities
4. **Tool Calling**: Support for function calling and tools
5. **Multi-modal Support**: Handle images and other file types

## Available Models

The following Gemini models are available:

- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-pro-preview-05-06`
- `gemini-2.5-flash-preview-04-17`
- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-pro-latest`
- `gemini-1.5-flash`
- `gemini-1.5-flash-latest`
- `gemini-1.5-flash-8b`
- `gemini-1.5-flash-8b-latest`