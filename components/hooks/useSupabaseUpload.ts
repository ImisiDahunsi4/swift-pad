import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { getStorageBucket } from '@/lib/supabaseClient';
import { uploadFileToS3 } from '@/lib/s3Client';
import { toast } from 'sonner';

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
  const [isBucketReady, setBucketReady] = useState<boolean | null>(null);

  // Check if bucket exists on component mount
  useEffect(() => {
    async function checkBucket() {
      try {
        // Call our API endpoint to ensure the bucket exists
        const response = await fetch('/api/ensure-bucket');
        const data = await response.json();

        if (data.success) {
          setBucketReady(true);
        } else {
          console.error('Bucket check failed:', data.message);
          setBucketReady(false);
          toast.error('Storage setup failed. Please try again later.');
        }
      } catch (error) {
        console.error('Error checking bucket:', error);
        setBucketReady(false);
      }
    }

    checkBucket();
  }, []);

  const uploadToSupabase = useCallback(
    async (file: File) => {
      if (isBucketReady === false) {
        const error = new Error('Storage is not available. Please try again later.');
        setUploadProgress({
          progress: 0,
          isUploading: false,
          error,
        });
        throw error;
      }

      try {
        setUploadProgress({
          progress: 0,
          isUploading: true,
          error: null,
        });

        // Log file details for debugging
        console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

        // Try direct S3 upload first
        try {
          const result = await uploadFileToS3(file);
          console.log("File uploaded successfully via S3, URL:", result.url);

          setUploadProgress({
            progress: 100,
            isUploading: false,
            error: null,
          });

          return result;
        } catch (s3Error) {
          // Log S3 error but don't throw yet - we'll try the server-side API next
          console.warn("S3 upload failed, falling back to server-side API:", s3Error);

          // Try server-side upload API
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/supabase-upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Server upload failed: ${errorData.message || response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.url) {
              throw new Error('Server upload failed to return a valid URL');
            }

            console.log("File uploaded successfully via server API, URL:", result.url);

            setUploadProgress({
              progress: 100,
              isUploading: false,
              error: null,
            });

            return { url: result.url };
          } catch (serverError) {
            console.warn("Server upload failed, falling back to Supabase client:", serverError);

            // Fall back to Supabase client as last resort
            // Create a unique file path using UUID and original file extension
            const fileExt = file.name.split('.').pop();
            const filePath = `${uuidv4()}.${fileExt}`;
            const bucketName = getStorageBucket();

            console.log(`Falling back to Supabase client upload: bucket=${bucketName}, file=${filePath}`);

            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
              .from(bucketName)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Changed to true to overwrite if file exists
                contentType: file.type, // Add content type
              });

            if (error) {
              console.error('Supabase upload error:', error);
              throw error;
            }

            // Get the public URL for the uploaded file
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
              throw new Error('Failed to get public URL for uploaded file');
            }

            setUploadProgress({
              progress: 100,
              isUploading: false,
              error: null,
            });

            return { url: urlData.publicUrl };
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress({
          progress: 0,
          isUploading: false,
          error: error instanceof Error ? error : new Error('Unknown upload error'),
        });
        throw error;
      }
    },
    [isBucketReady]
  );

  return {
    uploadToSupabase,
    uploadProgress,
    isBucketReady,
  };
}

export default useSupabaseUpload;