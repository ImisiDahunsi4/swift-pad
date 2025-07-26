"use client";

import { useState, useEffect } from "react";

interface SupabaseWrapperProps {
  children: React.ReactNode;
}

export function SupabaseWrapper({ children }: SupabaseWrapperProps) {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plbihljyhvnacqoixhhh.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmlobGp5aHZuYWNxb2l4aGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ3NzEsImV4cCI6MjA2ODQzMDc3MX0.yI_u4SklTimjyDiq09VQo6khx8__WEDJzllKn6mNowY';

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase environment variables are missing. Please check your .env file.");
      return;
    }

    setIsSupabaseReady(true);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">
            Make sure you have the following environment variables in your .env file:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isSupabaseReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}