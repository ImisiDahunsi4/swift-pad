import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'whispers-audios';

    console.log('Creating bucket with the following details:');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Bucket name:', bucketName);
    console.log('Service key available:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Supabase credentials not available' },
        { status: 500 }
      );
    }

    // Try to create the bucket using the Supabase REST API
    const createUrl = `${supabaseUrl}/storage/v1/bucket`;
    console.log('POST request to:', createUrl);

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        name: bucketName,
        public: true,
        file_size_limit: 52428800, // 50MB
      }),
    });

    console.log('Create bucket response status:', response.status);
    const responseData = await response.json();
    console.log('Create bucket response data:', responseData);

    if (!response.ok) {
      // If bucket already exists, try to update it instead
      if (response.status === 409) {
        console.log('Bucket already exists, trying to update it...');

        const updateUrl = `${supabaseUrl}/storage/v1/bucket/${bucketName}`;
        console.log('PUT request to:', updateUrl);

        const updateResponse = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            public: true,
            file_size_limit: 52428800, // 50MB
          }),
        });

        console.log('Update bucket response status:', updateResponse.status);
        const updateData = await updateResponse.json();
        console.log('Update bucket response data:', updateData);

        if (!updateResponse.ok) {
          return NextResponse.json(
            {
              success: false,
              message: 'Failed to update bucket',
              error: updateData,
              statusCode: updateResponse.status
            },
            { status: updateResponse.status }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Bucket updated successfully',
          data: updateData
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create bucket',
          error: responseData,
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bucket created successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error in create-bucket API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error creating bucket',
        error
      },
      { status: 500 }
    );
  }
}