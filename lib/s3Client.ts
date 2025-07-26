// Direct S3 client for uploads
import { v4 as uuidv4 } from 'uuid';

// Get environment variables with fallbacks
const s3Endpoint = process.env.S3_ENDPOINT || 'https://plbihljyhvnacqoixhhh.supabase.co/storage/v1/s3';
const s3Region = process.env.S3_REGION || 'eu-central-1';
const s3AccessKey = process.env.S3_ACCESS_KEY || 'b31c6452b8e72df7f4e2b26baefe4915';
const s3SecretKey = process.env.S3_SECRET_KEY || 'f5d77fa29935d9b2dce6f4e5d10704bab9e03b4961d38bc7023e85f5607ddf8f';
const s3BucketName = process.env.S3_BUCKET_NAME || 'whispers-audios';

// Function to upload a file directly using fetch
export async function uploadFileToS3(file: File): Promise<{ url: string }> {
  try {
    // Create a unique file path using UUID and original file extension
    const fileExt = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;

    // Use direct upload to Supabase Storage REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not available');
    }

    // Construct the direct upload URL
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${s3BucketName}/${filePath}`;

    console.log('Uploading to:', uploadUrl);

    // Upload the file using direct Supabase Storage API
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'x-upsert': 'true'
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed with status: ${uploadResponse.status}, message: ${errorText}`);
    }

    const responseData = await uploadResponse.json();
    console.log('Upload response:', responseData);

    // Construct the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${s3BucketName}/${filePath}`;

    return { url: publicUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

// Alternative function that uses the get-presigned-url API endpoint
export async function uploadFileWithPresignedUrl(file: File): Promise<{ url: string }> {
  try {
    // Create a unique file path using UUID and original file extension
    const fileExt = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;

    // Create pre-signed URL for upload
    const preSignedUrl = await getPresignedUrl(filePath, file.type);

    // Upload the file using the pre-signed URL
    const uploadResponse = await fetch(preSignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    // Construct the public URL
    const publicUrl = `${s3Endpoint}/${s3BucketName}/${filePath}`;

    return { url: publicUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

// Function to get a pre-signed URL for upload
async function getPresignedUrl(filePath: string, contentType: string): Promise<string> {
  try {
    // For simplicity, we'll use a server-side API to generate the pre-signed URL
    const response = await fetch('/api/get-presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get pre-signed URL: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting pre-signed URL:', error);
    throw error;
  }
}

// Get bucket name
export function getS3BucketName(): string {
  return s3BucketName;
}