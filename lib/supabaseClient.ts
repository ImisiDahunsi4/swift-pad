import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks and validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plbihljyhvnacqoixhhh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmlobGp5aHZuYWNxb2l4aGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ3NzEsImV4cCI6MjA2ODQzMDc3MX0.yI_u4SklTimjyDiq09VQo6khx8__WEDJzllKn6mNowY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmlobGp5aHZuYWNxb2l4aGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg1NDc3MSwiZXhwIjoyMDY4NDMwNzcxfQ.e5U4vxc89cssjO-FApvEzxZ3BJGpzfmgd0j08ifnvX4';


// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file.');
}

// Browser client with anonymous key (limited permissions)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Server client with service role (full access)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    }
  }
);

// Get bucket name from environment or use default
export const getStorageBucket = () =>
  process.env.SUPABASE_STORAGE_BUCKET || 'whispers-audios';

// Ensure bucket exists (for server-side usage)
export const ensureBucketExists = async () => {
  const bucketName = getStorageBucket();

  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true, // Make bucket public
        fileSizeLimit: 52428800, // 50MB limit
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }

      console.log(`Bucket ${bucketName} created successfully`);
    }

    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};