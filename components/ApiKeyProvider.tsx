"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useLocalStorage from "./hooks/useLocalStorage";

interface ApiKeyContextType {
  assemblyAiKey: string | null;
  geminiKey: string | null;
  setAssemblyAiKey: (key: string | null) => void;
  setGeminiKey: (key: string | null) => void;
  hasCustomKeys: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [assemblyAiKey, setAssemblyAiKey] = useLocalStorage<string | null>(
    "assemblyai-api-key",
    null
  );
  const [geminiKey, setGeminiKey] = useLocalStorage<string | null>(
    "gemini-api-key",
    null
  );

  // Determine if user has provided custom API keys
  const hasCustomKeys = !!(assemblyAiKey || geminiKey);

  return (
    <ApiKeyContext.Provider
      value={{
        assemblyAiKey,
        geminiKey,
        setAssemblyAiKey,
        setGeminiKey,
        hasCustomKeys,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKeys must be used within an ApiKeyProvider");
  }
  return context;
}

// Legacy support for code that still uses the old provider name
export const useTogetherApiKey = () => {
  console.warn(
    "useTogetherApiKey is deprecated. Please use useApiKeys instead."
  );
  const { assemblyAiKey: apiKey, hasCustomKeys: isBYOK } = useApiKeys();
  return { apiKey, isBYOK };
};