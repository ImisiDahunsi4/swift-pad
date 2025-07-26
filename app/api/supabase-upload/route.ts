import { NextResponse } from 'next/server';
import { supabaseAdmin, getStorageBucket } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const bucketName = getStorageBucket();

    console.log(`Server-side upload: bucket=${bucketName}, file=${fileName}, type=${file.type}`);

    // Upload file to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Server upload error:', error);
      return NextResponse.json(
        { success: false, message: error.message, error },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully via server',
      path: fileName,
      url: urlData?.publicUrl,
      data
    });

  } catch (error) {
    console.error('Error in supabase-upload API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error in server upload',
        error
      },
      { status: 500 }
    );
  }
}

// Increase body size limit for file uploads (default is 4MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};