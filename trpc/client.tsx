"use client";

import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { appRouter } from "./routers/_app";
import { useApiKeys } from "@/components/ApiKeyProvider";

export const trpc = createTRPCReact<typeof appRouter>({});

export function TRPCReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            return {
              // Include custom headers for API keys here
              // They will be added by the useTRPC hook below
            };
          },
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Custom hook to use TRPC with API keys
export function useTRPC() {
  const { assemblyAiKey, geminiKey } = useApiKeys();

  return {
    ...trpc,
    // Override mutation options to include API keys in headers
    whisper: {
      ...trpc.whisper,
      transcribeFromS3: {
        ...trpc.whisper.transcribeFromS3,
        mutationOptions: () => ({
          mutation: {
            onMutate: async (variables) => {
              const headers: HeadersInit = {};
              if (assemblyAiKey) {
                headers["AssemblyAIToken"] = assemblyAiKey;
              }
              if (geminiKey) {
                headers["GeminiAPIToken"] = geminiKey;
              }

              return trpc.whisper.transcribeFromS3.mutate(variables, {
                headers,
              });
            },
          },
        }),
      },
    },
  };
}
