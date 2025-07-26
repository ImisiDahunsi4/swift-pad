"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SupabaseInitializer() {
  const [isInitialized, setInitialized] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeSupabase() {
      try {
        setLoading(true);

        // Call our setup API
        const response = await fetch('/api/setup-supabase');
        const data = await response.json();

        if (data.success) {
          console.log('Supabase storage initialized successfully');
          setInitialized(true);
        } else {
          console.error('Failed to initialize Supabase storage:', data.errors);
          // Don't show error toast to users by default - only for development
          if (process.env.NODE_ENV === 'development') {
            toast.error('Storage setup issue. Check console for details.');
          }
        }
      } catch (error) {
        console.error('Error initializing Supabase:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeSupabase();
  }, []);

  // This component doesn't render anything visible
  return null;
}