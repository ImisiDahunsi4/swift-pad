import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json(
        { success: false, message: 'Failed to list buckets', error: bucketsError },
        { status: 500 }
      );
    }

    // Get RLS policies
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc('get_policies_for_table', {
      table_name: 'objects',
      schema_name: 'storage'
    });

    if (policiesError) {
      return NextResponse.json(
        { success: false, message: 'Failed to get policies', error: policiesError },
        { status: 500 }
      );
    }

    // Try to create a test file to check if anon uploads work
    const testContent = 'Test file to check RLS policies';
    const testFilePath = `rls-test-${Date.now()}.txt`;
    const bucketName = 'whispers-audios';

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(testFilePath, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    return NextResponse.json({
      success: true,
      buckets,
      policies,
      testUpload: {
        success: !uploadError,
        error: uploadError ? uploadError.message : null,
        data: uploadData
      }
    });
  } catch (error) {
    console.error('Error checking RLS:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error checking RLS'
      },
      { status: 500 }
    );
  }
}