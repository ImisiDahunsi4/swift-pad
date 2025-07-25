# Swift Pad Migration Plan: Together AI → AssemblyAI & AWS S3 → Supabase Storage

## Overview

This document outlines the detailed migration plan for transitioning Swift Pad from Together AI to AssemblyAI for speech-to-text transcription, and from AWS S3 to Supabase Storage for audio file storage.

## Current Architecture

### Speech-to-Text (STT)
- **Provider**: Together AI (using OpenAI Whisper model)
- **Integration Points**:
  - `lib/apiClients.ts`: Together AI client initialization
  - `trpc/routers/whisper.ts`: Transcription logic in `transcribeFromS3` mutation
  - `app/api/transform/route.ts`: Text transformation using Together AI LLMs

### Storage
- **Provider**: AWS S3 (via `next-s3-upload` package)
- **Integration Points**:
  - `app/api/s3-upload/route.ts`: S3 upload endpoint
  - `components/RecordingModal.tsx`: Audio recording upload
  - `components/UploadModal.tsx`: File upload handling

### Text Generation
- **Provider**: Together AI (Meta Llama models)
- **Usage**: Title generation and text transformations

## Migration Plan

### Phase 1: Replace Together AI with AssemblyAI for STT

#### 1.1 Install AssemblyAI SDK
```bash
pnpm add @ai-sdk/assemblyai assemblyai
pnpm remove together-ai @ai-sdk/togetherai
```

#### 1.2 Update Environment Variables
Replace in `.env`:
```env
# Remove
TOGETHER_API_KEY=your_together_api_key

# Add
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

#### 1.3 Create New API Client (`lib/assemblyaiClient.ts`)
```typescript
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
```

#### 1.4 Update Transcription Logic (`trpc/routers/whisper.ts`)

Key changes:
1. Replace Together AI transcription with AssemblyAI's two-step process:
   - Upload audio to AssemblyAI
   - Poll for transcription results
2. Update the `transcribeFromS3` mutation to handle AssemblyAI's async workflow
3. Add support for AssemblyAI-specific features (speaker labels, auto highlights, etc.)

```typescript
// New transcription flow:
1. Upload audio URL to AssemblyAI
2. Get transcript ID
3. Poll for completion
4. Extract transcription text and metadata
```

#### 1.5 Update Provider Context
- Rename `TogetherApiKeyProvider` to `ApiKeyProvider`
- Support both AssemblyAI and Gemini API keys
- Update all imports and usages

### Phase 2: Replace AWS S3 with Supabase Storage

#### 2.1 Install Supabase Client
```bash
pnpm add @supabase/supabase-js
pnpm remove next-s3-upload
```

#### 2.2 Update Environment Variables
Replace in `.env`:
```env
# Remove
S3_UPLOAD_KEY=
S3_UPLOAD_SECRET=
S3_UPLOAD_BUCKET=
S3_UPLOAD_REGION=

# Add
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=audio-recordings
```

#### 2.3 Create Supabase Client (`lib/supabaseClient.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

// Browser client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client with service role
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 2.4 Create New Upload API Route (`app/api/supabase-upload/route.ts`)
```typescript
// Handle file uploads to Supabase Storage
// Return public URL for the uploaded file
```

#### 2.5 Create Upload Hook (`hooks/useSupabaseUpload.ts`)
```typescript
// Replace useS3Upload with useSupabaseUpload
// Handle file upload progress and errors
```

#### 2.6 Update Components
- `RecordingModal.tsx`: Replace `useS3Upload` with `useSupabaseUpload`
- `UploadModal.tsx`: Replace `useS3Upload` with `useSupabaseUpload`

### Phase 3: Replace Together AI LLMs with Google Gemini

#### 3.1 Install Gemini SDK
```bash
pnpm add @google/genai
```

#### 3.2 Update Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
```

#### 3.3 Create Gemini Client (`lib/geminiClient.ts`)
```typescript
import { GoogleGenerativeAI } from '@google/genai';

export function getGeminiClient(apiKey?: string) {
  return new GoogleGenerativeAI(
    apiKey || process.env.GEMINI_API_KEY || ''
  );
}
```

#### 3.4 Update Transform Route (`app/api/transform/route.ts`)
- Replace Together AI LLM calls with Gemini
- Use Gemini Flash 2.0 for fast transformations
- Maintain streaming response capability

### Phase 4: Database Schema Updates

No schema changes required - the existing schema supports the migration:
- `AudioTrack.fileUrl`: Will store Supabase URLs instead of S3 URLs
- `Whisper.fullTranscription`: Compatible with AssemblyAI output
- `Transformation`: No changes needed

### Phase 5: Feature Enhancements

#### 5.1 AssemblyAI Advanced Features
1. **Speaker Diarization**: Add speaker labels to transcriptions
2. **Auto Highlights**: Extract key moments
3. **Sentiment Analysis**: Add emotion detection
4. **Chapter Generation**: Auto-generate chapters for long recordings
5. **Entity Detection**: Identify people, places, organizations
6. **Content Safety**: Filter inappropriate content

#### 5.2 Supabase Storage Features
1. **Resumable Uploads**: Support for large files
2. **Direct Browser Uploads**: Reduce server load
3. **Automatic File Expiration**: Clean up old files
4. **CDN Integration**: Faster file delivery

## Implementation Steps

### Step 1: Setup Development Environment
1. Create new branch: `feature/assemblyai-supabase-migration`
2. Install new dependencies
3. Update environment variables
4. Create Supabase project and storage bucket

### Step 2: Implement AssemblyAI Integration
1. Create AssemblyAI client utilities
2. Update transcription logic
3. Add polling mechanism for async transcription
4. Update error handling
5. Test with sample audio files

### Step 3: Implement Supabase Storage
1. Create Supabase client utilities
2. Implement upload API route
3. Create upload hook
4. Update components
5. Test file uploads

### Step 4: Update Text Generation
1. Create Gemini client utilities
2. Update transform route
3. Maintain streaming capability
4. Test all transformation types

### Step 5: Testing & Migration
1. Unit tests for new utilities
2. Integration tests for full workflow
3. Migration script for existing S3 URLs (optional)
4. Performance testing
5. Security review

### Step 6: Deployment
1. Update production environment variables
2. Deploy to staging
3. Run acceptance tests
4. Deploy to production
5. Monitor for issues

## Technical Considerations

### AssemblyAI Integration
1. **Async Processing**: AssemblyAI uses async transcription, requiring polling
2. **Rate Limits**: Handle rate limiting appropriately
3. **File Size Limits**: AssemblyAI supports files up to 5GB
4. **Supported Formats**: MP3, MP4, WAV, FLAC, AAC, M4A, WebM

### Supabase Storage
1. **File Size Limits**: Default 50MB, configurable up to 5GB
2. **CORS Configuration**: Set up proper CORS for browser uploads
3. **Security**: Use RLS policies for secure access
4. **Bucket Structure**: Organize by user ID and date

### Performance Optimizations
1. **Parallel Processing**: Upload to storage and submit to AssemblyAI simultaneously
2. **Caching**: Cache transcription results
3. **Progress Indicators**: Show upload and transcription progress
4. **Error Recovery**: Implement retry logic

## Rollback Plan

If issues arise:
1. **Feature Flags**: Use environment variables to toggle between old/new implementations
2. **Database Compatibility**: No schema changes, so rollback is straightforward
3. **Dual Support Period**: Keep both implementations during transition
4. **Gradual Rollout**: Test with subset of users first

## Cost Analysis

### AssemblyAI Pricing
- Best model: $0.00025 per second
- Nano model: $0.000083 per second
- Additional features may incur extra costs

### Supabase Storage Pricing
- Storage: $0.021 per GB/month
- Bandwidth: $0.09 per GB
- No upload fees

### Comparison with Current
- Together AI: Variable pricing based on model
- AWS S3: Storage + bandwidth + API calls
- Potential cost savings with Supabase for storage

## Timeline

- **Week 1**: Environment setup, AssemblyAI client implementation
- **Week 2**: Transcription logic migration, testing
- **Week 3**: Supabase storage implementation
- **Week 4**: Gemini integration, comprehensive testing
- **Week 5**: Deployment preparation, documentation
- **Week 6**: Production deployment, monitoring

## Success Metrics

1. **Transcription Accuracy**: Equal or better than current
2. **Processing Speed**: Target < 30s for 5-minute audio
3. **Upload Reliability**: 99.9% success rate
4. **Cost Reduction**: Target 20% reduction
5. **User Satisfaction**: No degradation in UX

## Risks and Mitigations

1. **API Differences**: Thoroughly test edge cases
2. **Migration Complexity**: Implement gradually with feature flags
3. **Data Loss**: Backup all data before migration
4. **Performance Issues**: Load test before production
5. **User Disruption**: Communicate changes clearly