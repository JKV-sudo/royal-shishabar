# 🚀 Deployment Guide - Royal Shisha Bar

This guide covers deploying the Royal Shisha Bar website to Vercel with Firebase backend.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Vercel CLI installed (`npm install -g vercel`)
- Git repository set up

## 🔥 Firebase Setup

### 1. Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
npm run firebase:init
```

Select the following services:
- ✅ Firestore Database
- ✅ Authentication
- ✅ Storage
- ✅ Hosting (optional - we'll use Vercel for hosting)

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it `royal-shishabar` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

### 3. Configure Firebase Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google (for social login)
4. Add your domain to authorized domains

#### Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Choose a location (preferably close to Germany)

#### Storage
1. Go to Storage
2. Start in production mode
3. Choose same location as Firestore

### 4. Get Firebase Configuration

1. Go to Project Settings
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app with name "Royal Shisha Web"
5. Copy the config object

### 5. Set Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# App Configuration
VITE_APP_NAME=Royal Shisha Bar
VITE_APP_URL=https://your-domain.vercel.app
```

### 6. Deploy Firebase Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## ⚡ Vercel Deployment

### 1. Connect to Vercel

```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel
```

Or connect via GitHub:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add all variables from your `.env` file
4. Set them for Production, Preview, and Development

### 3. Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your custom domain (e.g., `royalshisha.de`)
3. Configure DNS records as instructed by Vercel

## 🔧 Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Firebase Emulators

```bash
# Start all emulators
npm run firebase:emulators

# Or start specific emulators
firebase emulators:start --only auth,firestore,storage
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📊 Monitoring & Analytics

### 1. Firebase Analytics

Firebase Analytics is automatically configured. View data in Firebase Console > Analytics.

### 2. Vercel Analytics

1. Go to Vercel Dashboard > Analytics
2. Enable Web Analytics
3. Add the tracking code to your app

### 3. Error Monitoring

Consider adding Sentry for error monitoring:

```bash
npm install @sentry/react @sentry/tracing
```

## 🔒 Security Checklist

- [ ] Firebase security rules deployed
- [ ] Environment variables set in Vercel
- [ ] Custom domain SSL configured
- [ ] Authentication methods configured
- [ ] API keys restricted to your domain
- [ ] CORS headers configured

## 🚀 Production Deployment

### 1. Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### 2. Verify Deployment

1. Check all pages load correctly
2. Test authentication flow
3. Verify Firebase connections
4. Test responsive design
5. Check performance scores

### 3. Post-Deployment

1. Set up monitoring alerts
2. Configure backup strategies
3. Set up CI/CD pipeline
4. Document deployment process

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🛠 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify TypeScript compilation
   - Check for missing dependencies

2. **Firebase Connection Issues**
   - Verify API keys
   - Check security rules
   - Ensure proper initialization

3. **Authentication Problems**
   - Check authorized domains
   - Verify OAuth configuration
   - Test with emulators first

### Support

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

## 📈 Performance Optimization

1. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Optimize with Vercel Image

2. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Bundle analysis

3. **Caching**
   - Static assets caching
   - API response caching
   - Service worker (optional)

---

**Ready to deploy!** 🎉 