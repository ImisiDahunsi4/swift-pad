import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Testing Supabase connection with the following details:');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon key available:', !!supabaseAnonKey);
    console.log('Service key available:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, message: 'Supabase credentials not available' },
        { status: 500 }
      );
    }

    // Create Supabase client with anon key
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

    // Test anon connection by getting user
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser();

    // Create Supabase client with service role key
    const supabaseAdmin = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

    // Test admin connection by listing buckets
    let bucketsData = null;
    let bucketsError = null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      bucketsData = data;
      bucketsError = error;
    }

    return NextResponse.json({
      success: true,
      anonConnection: {
        success: !userError,
        error: userError ? userError.message : null,
        data: userData
      },
      adminConnection: supabaseAdmin ? {
        success: !bucketsError,
        error: bucketsError ? bucketsError.message : null,
        buckets: bucketsData
      } : 'Not tested (no service key)'
    });

  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error testing connection',
        error
      },
      { status: 500 }
    );
  }
}