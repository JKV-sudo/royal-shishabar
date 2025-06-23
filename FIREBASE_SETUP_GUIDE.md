# 🔥 Firebase Setup Guide - Royal Shisha Bar

## 📋 Prerequisites
- ✅ Firebase project created
- ✅ Web app added to Firebase project

## 🚀 Step-by-Step Configuration

### 1. Get Firebase Configuration

1. **Go to Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
2. **Select your project**
3. **Click gear icon** (⚙️) → **Project settings**
4. **Scroll to "Your apps"** section
5. **Click "Add app"** → **Web app** (</>)
6. **Register app** with nickname: "Royal Shisha Web"
7. **Copy the configuration object**

### 2. Create Environment Variables

Create a `.env` file in your project root with these values:

```env
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Replace the values with your actual Firebase config!**

### 3. Enable Authentication

1. **Go to Authentication** → **Sign-in method**
2. **Enable these providers**:
   - ✅ **Email/Password**
   - ✅ **Google** (built-in)
   - 🔄 **Facebook** (optional)
   - 🔄 **Twitter/X** (optional)
   - 🔄 **GitHub** (optional)
   - 🔄 **Apple** (optional)

### 4. Create Firestore Database

1. **Go to Firestore Database**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (we'll secure it later)
4. **Select location**: `europe-west3` (Frankfurt, Germany)
5. **Click "Done"**

### 5. Set Up Storage

1. **Go to Storage**
2. **Click "Get started"**
3. **Choose "Start in test mode"**
4. **Select location**: Same as Firestore
5. **Create folders**:
   - `avatars/` (user profile pictures)
   - `menu/` (menu item images)
   - `events/` (event images)
   - `admin/` (admin uploads)

### 6. Deploy Security Rules

Run these commands to deploy your security rules:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 7. Test Your Configuration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test authentication**:
   - Go to `/auth` page
   - Try signing up with email/password
   - Try Google sign-in

3. **Check browser console** for any errors

## 🔒 Security Rules Setup

### Firestore Rules
Your `firestore.rules` file should look like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public data (menu, events, reviews)
    match /menu/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /events/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.userId || request.auth.token.admin == true);
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Storage Rules
Your `storage.rules` file should look like this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Menu images
    match /menu/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Event images
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Admin uploads
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 🧪 Testing with Emulators

### Start Firebase Emulators
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Start emulators
firebase emulators:start
```

### Emulator URLs
- **Emulator UI**: http://localhost:4000
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199

## 📊 Next Steps After Configuration

### 1. Test Authentication
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google sign-in works
- [ ] User data is stored in Firestore
- [ ] Protected routes work

### 2. Test Database Operations
- [ ] Create test menu items
- [ ] Create test events
- [ ] Create test reviews
- [ ] Verify data appears in Firebase console

### 3. Test File Uploads
- [ ] Upload user avatar
- [ ] Upload menu images
- [ ] Verify files appear in Storage

### 4. Deploy to Production
- [ ] Set up production environment variables
- [ ] Deploy to Vercel
- [ ] Test production authentication
- [ ] Verify production database operations

## 🚨 Common Issues & Solutions

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to authorized domains in Firebase Console → Authentication → Settings → Authorized domains

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Check your environment variables are correctly set and the API key is valid

### Issue: "Firebase: Error (firestore/permission-denied)"
**Solution**: Check your Firestore security rules and make sure they allow the operation

### Issue: "Firebase: Error (storage/unauthorized)"
**Solution**: Check your Storage security rules and make sure they allow the operation

## 📞 Need Help?

- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
- **Firebase Support**: [https://firebase.google.com/support](https://firebase.google.com/support)

---

**🎉 Once you've completed these steps, your Firebase backend will be fully configured and ready for your Royal Shisha Bar application!** 