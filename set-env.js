// This script sets environment variables for development
// Run with: node set-env.js

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env');

// Environment variables to set
const envVars = `# Supabase Storage Credentials
NEXT_PUBLIC_SUPABASE_URL=https://plbihljyhvnacqoixhhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmlobGp5aHZuYWNxb2l4aGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTQ3NzEsImV4cCI6MjA2ODQzMDc3MX0.yI_u4SklTimjyDiq09VQo6khx8__WEDJzllKn6mNowY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmlobGp5aHZuYWNxb2l4aGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg1NDc3MSwiZXhwIjoyMDY4NDMwNzcxfQ.e5U4vxc89cssjO-FApvEzxZ3BJGpzfmgd0j08ifnvX4
SUPABASE_STORAGE_BUCKET=whispers-audios

# S3 Connection (Alternative for direct S3 access)
S3_BUCKET_NAME=whispers-audios
S3_ENDPOINT=https://plbihljyhvnacqoixhhh.supabase.co/storage/v1/s3
S3_REGION=eu-central-1
S3_ACCESS_KEY=b31c6452b8e72df7f4e2b26baefe4915
S3_SECRET_KEY=f5d77fa29935d9b2dce6f4e5d10704bab9e03b4961d38bc7023e85f5607ddf8f

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_rpblg0neI5NL@ep-holy-math-abbn5t0e-pooler.eu-west-2.aws.neon.tech/swift_pad_db?channel_binding=require&sslmode=require
`;

// Read existing .env file if it exists
let existingEnv = '';
try {
  existingEnv = fs.readFileSync(envFile, 'utf8');
  console.log('Existing .env file found');
} catch (err) {
  console.log('No existing .env file found, creating new one');
}

// Function to update or append environment variables
function updateEnvFile(existing, newVars) {
  // Parse existing env vars
  const existingLines = existing.split('\n');
  const existingVars = {};

  existingLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        existingVars[key.trim()] = line;
      }
    }
  });

  // Parse new env vars
  const newLines = newVars.split('\n');
  const updatedEnv = [...existingLines];

  let currentSection = '';

  newLines.forEach(line => {
    if (line.startsWith('#')) {
      currentSection = line;
    } else if (line.trim()) {
      const [key] = line.split('=');
      if (key) {
        const trimmedKey = key.trim();

        // Check if this key already exists in the env file
        const existingIndex = existingLines.findIndex(l =>
          l.startsWith(trimmedKey + '=') || l.startsWith(trimmedKey + ' =')
        );

        if (existingIndex >= 0) {
          // Update existing variable
          updatedEnv[existingIndex] = line;
        } else {
          // Add new variable
          // First check if section header exists
          const sectionIndex = updatedEnv.findIndex(l => l === currentSection);
          if (sectionIndex >= 0) {
            // Add after section header
            updatedEnv.splice(sectionIndex + 1, 0, line);
          } else {
            // Add to the end
            if (updatedEnv[updatedEnv.length - 1] !== '') {
              updatedEnv.push('');
            }
            updatedEnv.push(currentSection);
            updatedEnv.push(line);
          }
        }
      }
    }
  });

  return updatedEnv.join('\n');
}

// Update or create .env file
const updatedEnv = existingEnv ? updateEnvFile(existingEnv, envVars) : envVars;

// Write to .env file
fs.writeFileSync(envFile, updatedEnv);

console.log('.env file has been updated with database connection string');