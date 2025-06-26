# 🔥 Firebase Setup Guide for Royal Shisha Bar

## 📋 Prerequisites
- Google account
- Firebase CLI installed (`npm install -g firebase-tools`)

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Click "Create a project"

2. **Project Setup**
   - Project name: `royal-shishabar` (or your preferred name)
   - Enable Google Analytics (recommended)
   - Choose analytics account or create new one
   - Click "Create project"

## 🔐 Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In Firebase Console, go to "Authentication" → "Sign-in method"

2. **Enable Email/Password**
   - Click "Email/Password"
   - Enable "Email/Password"
   - Click "Save"

3. **Enable Google Sign-in**
   - Click "Google"
   - Enable "Google"
   - Add your support email
   - Click "Save"

4. **Configure Authorized Domains**
   - Go to "Settings" tab
   - Add your domains:
     - `localhost` (for development)
     - `your-domain.vercel.app` (for production)
     - `your-custom-domain.com` (if you have one)

## 🗄️ Step 3: Set Up Firestore Database

1. **Create Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (we'll add security rules later)
   - Select location closest to your users (e.g., `europe-west3` for Germany)

2. **Create Collections**
   The following collections will be created automatically when users interact with the app:
   - `users` - User profiles and roles
   - `popups` - Live announcements
   - `menu` - Hookah and drinks menu
   - `reviews` - Customer reviews
   - `events` - Upcoming events
   - `reservations` - Table reservations (Phase 2)
   - `orders` - Customer orders (Phase 2)
   - `playlists` - Spotify playlists (Phase 2)

## 📁 Step 4: Set Up Storage

1. **Create Storage Bucket**
   - Go to "Storage"
   - Click "Get started"
   - Choose "Start in test mode"
   - Select location (same as Firestore)

2. **Create Folders**
   - `avatars/` - User profile pictures
   - `menu/` - Menu item images
   - `events/` - Event images
   - `admin/` - Admin uploads

## ⚙️ Step 5: Configure Environment Variables

1. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Add app" → "Web"
   - Register app with name "Royal Shisha Web"
   - Copy the config object

2. **Create .env file**
   ```bash
   cp env.example .env
   ```

3. **Fill in your Firebase config**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 🔧 Step 6: Initialize Firebase CLI

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```

3. **Select services**
   - ✅ Firestore
   - ✅ Storage
   - ✅ Hosting (optional, since we're using Vercel)

4. **Configure settings**
   - Use existing project
   - Select your Firebase project
   - Use default file names for rules and indexes

## 🛡️ Step 7: Deploy Security Rules

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Storage Rules**
   ```bash
   firebase deploy --only storage
   ```

## 🧪 Step 8: Test with Emulators (Optional)

1. **Start emulators**
   ```bash
   npm run firebase:emulators
   ```

2. **Open emulator UI**
   - Visit `http://localhost:4000`
   - Test authentication, database, and storage

## 🚀 Step 9: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Firebase integration"
   git push
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

## 🔍 Step 10: Verify Setup

1. **Test Authentication**
   - Visit your deployed site
   - Try signing up with email/password
   - Try Google sign-in
   - Check Firestore for user document

2. **Test Live Popups**
   - Create a popup in Firebase Console
   - Verify it appears on your site

## 📊 Step 11: Set Up Analytics (Optional)

1. **Enable Analytics**
   - Go to "Analytics" in Firebase Console
   - Follow setup instructions
   - Add tracking code to your app

## 🔐 Step 12: Create Admin User

1. **Create first admin user**
   ```javascript
   // In Firebase Console → Firestore
   // Create a document in 'users' collection
   {
     "email": "Royal.Waldkraiburg@gmail.com",
     "name": "Admin User",
     "role": "admin",
     "createdAt": Timestamp.now()
   }
   ```

## 🚨 Important Security Notes

1. **Never commit .env files**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Monitor usage**
   - Check Firebase Console regularly
   - Set up billing alerts

3. **Backup data**
   - Export Firestore data regularly
   - Keep backups of security rules

## 🆘 Troubleshooting

### Common Issues:

1. **Authentication not working**
   - Check authorized domains
   - Verify API keys in .env
   - Check browser console for errors

2. **Firestore rules blocking access**
   - Check rules syntax
   - Verify user authentication state
   - Test with emulators first

3. **Storage uploads failing**
   - Check storage rules
   - Verify file size limits
   - Check CORS settings

### Getting Help:
- Firebase Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Firebase Support: [https://firebase.google.com/support](https://firebase.google.com/support)

## 🎯 Next Steps

After Firebase setup:
1. Test all authentication flows
2. Create sample data in Firestore
3. Test live popup functionality
4. Set up monitoring and alerts
5. Plan for production scaling

---

**Your Firebase setup is now complete! 🎉** 