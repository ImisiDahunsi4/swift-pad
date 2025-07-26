import { NextResponse } from 'next/server';
import { supabaseAdmin, getStorageBucket } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const bucketName = getStorageBucket();
    const results = {
      bucketName,
      bucketExists: false,
      bucketsAvailable: [],
      canCreateBucket: false,
      canUpload: false,
      connectionTest: false,
      errors: [] as string[],
    };

    // Test 1: Check if connection works
    try {
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

      if (error) {
        results.errors.push(`Connection error: ${error.message}`);
      } else {
        results.connectionTest = true;
        results.bucketsAvailable = buckets.map(b => b.name);
        results.bucketExists = buckets.some(b => b.name === bucketName);
      }
    } catch (err) {
      results.errors.push(`Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Test 2: Try to create bucket if it doesn't exist
    if (results.connectionTest && !results.bucketExists) {
      try {
        const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });

        if (error) {
          results.errors.push(`Create bucket error: ${error.message}`);
        } else {
          results.canCreateBucket = true;
          results.bucketExists = true;
        }
      } catch (err) {
        results.errors.push(`Create bucket test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Test 3: Try to upload a small test file
    if (results.bucketExists) {
      try {
        const testContent = new Uint8Array([0, 1, 2, 3, 4]);
        const { data, error } = await supabaseAdmin.storage
          .from(bucketName)
          .upload('test-file.bin', testContent, {
            contentType: 'application/octet-stream',
            upsert: true,
          });

        if (error) {
          results.errors.push(`Upload test error: ${error.message}`);
        } else {
          results.canUpload = true;

          // Clean up test file
          await supabaseAdmin.storage
            .from(bucketName)
            .remove(['test-file.bin']);
        }
      } catch (err) {
        results.errors.push(`Upload test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in test-supabase API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error in Supabase test',
        error
      },
      { status: 500 }
    );
  }
}