import { initTRPC, TRPCError } from "@trpc/server";
import { getAuth } from "@clerk/nextjs/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export interface AuthContext {
  auth: {
    userId: string;
  };
  assemblyAiKey?: string;
  geminiKey?: string;
}

export async function createContext({
  req,
}: FetchCreateContextFnOptions): Promise<AuthContext> {
  const auth = getAuth(req);
  if (!auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated",
    });
  }

  // Extract API keys from headers if present
  const assemblyAiKey = req.headers.get("AssemblyAIToken") || undefined;
  const geminiKey = req.headers.get("GeminiAPIToken") || undefined;

  return {
    auth: {
      userId: auth.userId,
    },
    assemblyAiKey,
    geminiKey,
  };
}

export const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;
