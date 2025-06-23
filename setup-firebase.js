#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Firebase Setup for Royal Shisha Bar');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Firebase Configuration (REQUIRED)
# Replace these values with your actual Firebase config from the Firebase Console
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=royalsb-4a698.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=royalsb-4a698
VITE_FIREBASE_STORAGE_BUCKET=royalsb-4a698.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Social Login Providers (Optional - for Phase 2)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id

# Google Services (Optional - for Phase 2)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_ANALYTICS_ID=your_google_analytics_id

# Email Service (Optional - for Phase 2)
VITE_SENDGRID_API_KEY=your_sendgrid_api_key
VITE_SENDGRID_FROM_EMAIL=noreply@royalshisha.de

# Payment Processing (Optional - for Phase 2)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key

# Spotify Integration (Optional - for Phase 2)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Error Monitoring (Optional - for Phase 2)
VITE_SENTRY_DSN=your_sentry_dsn
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com');
console.log('2. Select your project: royalsb-4a698');
console.log('3. Go to Project Settings (gear icon)');
console.log('4. Scroll down to "Your apps" section');
console.log('5. Click "Add app" → Web app (</>)');
console.log('6. Register app with nickname: "Royal Shisha Web"');
console.log('7. Copy the configuration object');
console.log('8. Update the values in your .env file');
console.log('\n🔧 Required Firebase Services to Enable:');
console.log('- Authentication (Email/Password, Google)');
console.log('- Firestore Database');
console.log('- Storage');
console.log('\n🚀 After configuration, test with:');
console.log('npm run dev');
console.log('\n📖 For detailed instructions, see: FIREBASE_SETUP_GUIDE.md'); 