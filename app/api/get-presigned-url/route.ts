import { NextResponse } from 'next/server';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-central-1',
  endpoint: process.env.S3_ENDPOINT || 'https://plbihljyhvnacqoixhhh.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'b31c6452b8e72df7f4e2b26baefe4915',
    secretAccessKey: process.env.S3_SECRET_KEY || 'f5d77fa29935d9b2dce6f4e5d10704bab9e03b4961d38bc7023e85f5607ddf8f',
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
});

export async function POST(request: Request) {
  try {
    const { filePath, contentType } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'filePath is required' },
        { status: 400 }
      );
    }

    const bucketName = process.env.S3_BUCKET_NAME || 'whispers-audios';

    // Create presigned URL for upload
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketName,
      Key: filePath,
      Conditions: [
        ['content-length-range', 0, 52428800], // Max 50MB
      ],
      Fields: {
        'Content-Type': contentType || 'application/octet-stream',
      },
      Expires: 600, // 10 minutes
    });

    return NextResponse.json({ url, fields });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}