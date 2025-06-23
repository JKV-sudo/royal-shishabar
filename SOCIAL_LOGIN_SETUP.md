# 🔗 Social Login Setup Guide

This guide will help you set up social login providers for your Royal Shisha Bar application.

## 📋 Supported Providers

- ✅ **Google** - Built-in Firebase support
- ✅ **Facebook** - Built-in Firebase support
- ✅ **Twitter/X** - Built-in Firebase support
- ✅ **GitHub** - Built-in Firebase support
- ✅ **Apple** - Built-in Firebase support
- 🔧 **Instagram** - Custom OAuth implementation

## 🔧 Step 1: Firebase Configuration

### Enable Social Providers in Firebase Console

1. **Go to Firebase Console** → **Authentication** → **Sign-in method**
2. **Enable each provider**:

#### Google
- Click "Google"
- Enable "Google"
- Add your support email
- Save

#### Facebook
- Click "Facebook"
- Enable "Facebook"
- Add your Facebook App ID and App Secret
- Save

#### Twitter
- Click "Twitter"
- Enable "Twitter"
- Add your Twitter API Key and API Secret
- Save

#### GitHub
- Click "GitHub"
- Enable "GitHub"
- Add your GitHub Client ID and Client Secret
- Save

#### Apple
- Click "Apple"
- Enable "Apple"
- Add your Apple Service ID, Team ID, and Key ID
- Save

## 📘 Step 2: Facebook App Setup

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App"
   - Choose "Consumer" or "Business"
   - Fill in app details

2. **Configure OAuth**
   - Go to "Facebook Login" → "Settings"
   - Add OAuth redirect URIs:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     ```

3. **Get App Credentials**
   - Copy App ID and App Secret
   - Add to your `.env` file:
     ```env
     VITE_FACEBOOK_APP_ID=your_facebook_app_id
     ```

## 🐦 Step 3: Twitter/X App Setup

1. **Create Twitter App**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app
   - Enable OAuth 2.0

2. **Configure OAuth**
   - Add callback URLs:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     ```

3. **Get API Credentials**
   - Copy API Key and API Secret
   - Add to your `.env` file:
     ```env
     VITE_TWITTER_API_KEY=your_twitter_api_key
     VITE_TWITTER_API_SECRET=your_twitter_api_secret
     ```

## 📸 Step 4: Instagram Setup (Custom OAuth)

Instagram doesn't have built-in Firebase support, so we implement custom OAuth:

1. **Create Instagram App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or use existing Facebook app
   - Add "Instagram Basic Display" product

2. **Configure Instagram Basic Display**
   - Add OAuth redirect URIs:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     ```

3. **Get Instagram Credentials**
   - Copy Instagram App ID and App Secret
   - Add to your `.env` file:
     ```env
     VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
     VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
     ```

## 🐙 Step 5: GitHub App Setup

1. **Create GitHub OAuth App**
   - Go to [GitHub Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in app details

2. **Configure OAuth**
   - Add Authorization callback URL:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     ```

3. **Get Client Credentials**
   - Copy Client ID and Client Secret
   - Add to your `.env` file:
     ```env
     VITE_GITHUB_CLIENT_ID=your_github_client_id
     VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
     ```

## 🍎 Step 6: Apple Sign-In Setup

1. **Create Apple App**
   - Go to [Apple Developer](https://developer.apple.com/)
   - Create a new App ID
   - Enable "Sign In with Apple"

2. **Configure Sign In with Apple**
   - Add your domain to the App ID
   - Create a Service ID
   - Configure return URLs

3. **Get Apple Credentials**
   - Download your private key
   - Note your Team ID and Key ID
   - Configure in Firebase Console

## 🔐 Step 7: Environment Variables

Create your `.env` file with all credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Social Login Providers
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_TWITTER_API_SECRET=your_twitter_api_secret
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🧪 Step 8: Testing

1. **Test Each Provider**
   - Try signing in with each provider
   - Check if user data is saved to Firestore
   - Verify user roles and permissions

2. **Test Error Handling**
   - Try signing in with invalid credentials
   - Test popup blocking scenarios
   - Test network errors

## 🚀 Step 9: Production Deployment

1. **Update Redirect URIs**
   - Add your production domain to all OAuth apps
   - Update Firebase authorized domains

2. **Environment Variables**
   - Add all environment variables to Vercel
   - Test production deployment

3. **Security**
   - Ensure all secrets are properly secured
   - Monitor OAuth usage and errors

## 🔧 Custom Instagram Implementation

Since Instagram doesn't have built-in Firebase support, we use a custom OAuth flow:

```typescript
// Custom Instagram OAuth flow
const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${VITE_INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;

// Handle Instagram callback
const handleInstagramCallback = async (code: string) => {
  // Exchange code for access token
  // Get user profile
  // Create or update user in Firestore
};
```

## 🎯 Best Practices

1. **Error Handling**
   - Always handle OAuth errors gracefully
   - Provide clear error messages to users
   - Log errors for debugging

2. **User Experience**
   - Show loading states during OAuth
   - Provide fallback options
   - Handle popup blocking gracefully

3. **Security**
   - Validate OAuth tokens
   - Check user permissions
   - Implement proper session management

4. **Mobile Support**
   - Test on mobile devices
   - Handle redirect flows properly
   - Optimize for touch interactions

## 🆘 Troubleshooting

### Common Issues:

1. **"Popup blocked" error**
   - Check browser popup settings
   - Use redirect flow as fallback
   - Test in incognito mode

2. **"Invalid OAuth redirect URI"**
   - Verify redirect URIs in provider settings
   - Check for typos in URLs
   - Ensure HTTPS in production

3. **"App not configured" error**
   - Verify app credentials in Firebase
   - Check environment variables
   - Ensure provider is enabled

4. **Instagram OAuth issues**
   - Verify Instagram Basic Display setup
   - Check app review status
   - Ensure proper scopes

### Getting Help:
- Firebase Documentation: [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- Provider-specific documentation
- Stack Overflow for common issues

---

**Your social login setup is now complete! 🎉** 