import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { getStorageBucket } from '@/lib/supabaseClient';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: Error | null;
}

export function useSupabaseUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
    error: null,
  });

  const uploadToSupabase = useCallback(
    async (file: File): Promise<{ url: string }> => {
      try {
        setUploadProgress({
          progress: 0,
          isUploading: true,
          error: null,
        });

        // Create a unique file path using UUID and original file extension
        const fileExt = file.name.split('.').pop();
        const filePath = `${uuidv4()}.${fileExt}`;
        const bucketName = getStorageBucket();

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              if (progress.totalBytes > 0) {
                const percent = Math.round((progress.uploadedBytes / progress.totalBytes) * 100);
                setUploadProgress((prev) => ({
                  ...prev,
                  progress: percent,
                }));
              }
            },
          });

        if (error) {
          throw error;
        }

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        setUploadProgress({
          progress: 100,
          isUploading: false,
          error: null,
        });

        return { url: urlData.publicUrl };
      } catch (error) {
        setUploadProgress({
          progress: 0,
          isUploading: false,
          error: error instanceof Error ? error : new Error('Unknown upload error'),
        });
        throw error;
      }
    },
    []
  );

  return {
    uploadToSupabase,
    uploadProgress,
  };
}

export default useSupabaseUpload;