# Swift Pad

Swift Pad is a web application for audio transcription and transformation. Record or upload audio files, get accurate transcriptions, and transform them into various formats like summaries, blog posts, emails, and more.

## Features

- 🎙️ **Audio Recording**: Record audio directly in your browser
- 📤 **File Upload**: Upload existing audio files (MP3, WAV, M4A, etc.)
- 🔤 **Accurate Transcription**: Powered by AssemblyAI's state-of-the-art speech recognition
- 🌐 **Multi-language Support**: Transcribe audio in multiple languages
- 🔄 **Text Transformations**: Convert transcriptions into summaries, blog posts, emails, and more
- 👥 **Speaker Diarization**: Identify different speakers in conversations
- 📊 **Auto Highlights**: Automatically extract key moments from transcriptions
- 🔒 **Secure Storage**: Files stored securely with Supabase Storage

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API routes, tRPC
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Clerk Auth
- **Storage**: Supabase Storage
- **AI Services**:
  - AssemblyAI for speech-to-text
  - Google Gemini for text transformations
- **Rate Limiting**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- AssemblyAI API key
- Google Gemini API key
- Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/swift-pad.git
   cd swift-pad
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.example.env`:
   ```bash
   cp .example.env .env
   ```

4. Fill in the environment variables in `.env`:
   ```
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. Set up the database:
   ```bash
   pnpm db:push
   ```

6. Run the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.example.env` for all required environment variables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
