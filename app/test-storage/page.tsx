"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase, getStorageBucket } from '@/lib/supabaseClient';

export default function TestStoragePage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isUploading, setUploading] = useState(false);
  const [directUploadResult, setDirectUploadResult] = useState<any>(null);
  const [isDirectUploading, setDirectUploading] = useState(false);
  const [createBucketResult, setCreateBucketResult] = useState<any>(null);
  const [isCreatingBucket, setCreatingBucket] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [isTestingConnection, setTestingConnection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function runTests() {
      try {
        setLoading(true);

        // Call our test API
        const response = await fetch('/api/test-supabase');
        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        console.error('Error testing Supabase:', error);
        setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    }

    runTests();
  }, []);

  const handleTestUpload = async () => {
    try {
      setUploading(true);
      setUploadResult(null);

      // Create a small test file
      const testContent = new Blob(['Test file content'], { type: 'text/plain' });
      const file = new File([testContent], 'test-upload.txt', { type: 'text/plain' });

      // Upload to Supabase
      const bucketName = getStorageBucket();
      const filePath = `test-${Date.now()}.txt`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'text/plain',
        });

      if (error) {
        setUploadResult({ success: false, error: error.message });
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        setUploadResult({
          success: true,
          path: filePath,
          url: urlData?.publicUrl || 'URL not available',
        });
      }
    } catch (error) {
      console.error('Test upload error:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDirectUploadTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.length) {
      alert('Please select a file first');
      return;
    }

    try {
      setDirectUploading(true);
      setDirectUploadResult(null);

      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/direct-upload-test', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setDirectUploadResult(result);

    } catch (error) {
      console.error('Direct upload test error:', error);
      setDirectUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setDirectUploading(false);
    }
  };

  const handleCreateBucket = async () => {
    try {
      setCreatingBucket(true);
      setCreateBucketResult(null);

      const response = await fetch('/api/create-bucket', {
        method: 'POST',
      });

      const result = await response.json();
      setCreateBucketResult(result);

      // Refresh the test results if bucket was created successfully
      if (result.success) {
        const testResponse = await fetch('/api/test-supabase');
        const testData = await testResponse.json();
        setTestResults(testData);
      }

    } catch (error) {
      console.error('Create bucket error:', error);
      setCreateBucketResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setCreatingBucket(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionResult(null);

      const response = await fetch('/api/test-connection');
      const result = await response.json();
      setConnectionResult(result);

    } catch (error) {
      console.error('Test connection error:', error);
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Supabase Storage Test</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
        <button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isTestingConnection ? 'Testing Connection...' : 'Test Supabase Connection'}
        </button>

        {connectionResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">
              {connectionResult.success ? '✅ Connection Test Successful' : '❌ Connection Test Failed'}
            </h3>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(connectionResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Storage Configuration</h2>
        {isLoading ? (
          <div className="p-4 bg-gray-100 rounded">Loading...</div>
        ) : (
          <div className="p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(testResults, null, 2)}</pre>

            <div className="mt-4">
              <button
                onClick={handleCreateBucket}
                disabled={isCreatingBucket}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
              >
                {isCreatingBucket ? 'Creating Bucket...' : 'Create Bucket via API'}
              </button>

              {createBucketResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
                  <h3 className="font-semibold mb-2">
                    {createBucketResult.success ? '✅ Bucket Created/Updated' : '❌ Bucket Creation Failed'}
                  </h3>
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(createBucketResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Upload (Supabase Client)</h2>
        <button
          onClick={handleTestUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Test Upload'}
        </button>

        {uploadResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(uploadResult, null, 2)}</pre>
            {uploadResult.success && (
              <div className="mt-4">
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View uploaded file
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Direct Upload Test (Server-Side)</h2>
        <form onSubmit={handleDirectUploadTest} className="space-y-4">
          <div>
            <label htmlFor="file" className="block mb-2 text-sm font-medium">
              Select a file to upload:
            </label>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              className="block w-full text-sm border border-gray-300 rounded p-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isDirectUploading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {isDirectUploading ? 'Uploading...' : 'Test Direct Upload'}
          </button>
        </form>

        {directUploadResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="whitespace-pre-wrap">{JSON.stringify(directUploadResult, null, 2)}</pre>
            {directUploadResult.success && directUploadResult.url && (
              <div className="mt-4">
                <a
                  href={directUploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View uploaded file
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">Back to Home</a>
      </div>
    </div>
  );
}