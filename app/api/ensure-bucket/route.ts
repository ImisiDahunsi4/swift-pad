import { NextResponse } from 'next/server';
import { ensureBucketExists, getStorageBucket } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const bucketExists = await ensureBucketExists();

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: `Bucket ${getStorageBucket()} exists or was created successfully`
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create bucket ${getStorageBucket()}`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in ensure-bucket API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error ensuring bucket exists'
      },
      { status: 500 }
    );
  }
}