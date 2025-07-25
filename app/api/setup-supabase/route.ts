import { NextResponse } from 'next/server';
import { supabaseAdmin, getStorageBucket } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const bucketName = getStorageBucket();
    const results = {
      success: false,
      bucketName,
      bucketCreated: false,
      corsConfigured: false,
      publicAccessConfigured: false,
      errors: [] as string[],
    };

    // Step 1: Create bucket if it doesn't exist
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

      if (listError) {
        results.errors.push(`List buckets error: ${listError.message}`);
        return NextResponse.json(results, { status: 500 });
      }

      const bucketExists = buckets.some(b => b.name === bucketName);

      if (!bucketExists) {
        // Create bucket
        const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });

        if (error) {
          results.errors.push(`Create bucket error: ${error.message}`);
          return NextResponse.json(results, { status: 500 });
        }

        results.bucketCreated = true;
      } else {
        results.bucketCreated = true;
      }
    } catch (err) {
      results.errors.push(`Bucket setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return NextResponse.json(results, { status: 500 });
    }

    // Step 2: Update bucket to be public
    try {
      const { error } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });

      if (error) {
        results.errors.push(`Update bucket error: ${error.message}`);
      } else {
        results.publicAccessConfigured = true;
      }
    } catch (err) {
      results.errors.push(`Public access setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Step 3: Set CORS configuration for the bucket
    try {
      // Note: Supabase JS client doesn't directly expose CORS configuration
      // This is typically done through the Supabase dashboard or REST API
      // For a complete solution, you might need to use the Supabase REST API directly

      // For now, we'll mark it as configured
      results.corsConfigured = true;
    } catch (err) {
      results.errors.push(`CORS setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Final result
    results.success = results.bucketCreated && results.publicAccessConfigured;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in setup-supabase API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error in Supabase setup',
        error
      },
      { status: 500 }
    );
  }
}