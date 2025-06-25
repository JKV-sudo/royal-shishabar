# Performance Troubleshooting Guide

## Common Causes of Slow Loading

### 1. **Firebase Configuration Issues**
- **Problem**: Firebase initialization taking too long
- **Solution**: 
  - Check if environment variables are properly set
  - Ensure Firebase project is active and accessible
  - Check network connectivity to Firebase services

### 2. **Large Bundle Size**
- **Problem**: Too many dependencies loading at once
- **Solution**:
  - Use code splitting and lazy loading
  - Remove unused dependencies
  - Optimize imports

### 3. **Development Server Issues**
- **Problem**: Vite dev server running slowly
- **Solution**:
  - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
  - Restart the dev server: `pkill -f "vite" && npm run dev`
  - Check for port conflicts

### 4. **Network Issues**
- **Problem**: Slow network requests
- **Solution**:
  - Check internet connection
  - Use a faster DNS (like 8.8.8.8 or 1.1.1.1)
  - Disable VPN if using one

## Quick Performance Fixes

### 1. **Clear Cache and Restart**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### 2. **Check Environment Variables**
Make sure you have a `.env` file with proper Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. **Optimize Development Settings**
- Disable browser extensions that might interfere
- Use Chrome DevTools Performance tab to identify bottlenecks
- Check the Performance Monitor component in the bottom-right corner

### 4. **Check System Resources**
- Ensure you have enough RAM available
- Close unnecessary applications
- Check CPU usage during development

## Performance Monitoring

The app includes a Performance Monitor component (visible in development mode) that shows:
- **Load Time**: Total page load time
- **DOM Ready**: Time until DOM is ready
- **First Paint**: Time to first visual paint
- **FCP**: First Contentful Paint

### Performance Targets:
- **Excellent**: < 1000ms
- **Good**: 1000-3000ms  
- **Poor**: > 3000ms

## Browser-Specific Issues

### Chrome
- Clear browser cache and cookies
- Disable extensions temporarily
- Use Incognito mode to test

### Firefox
- Clear cache and cookies
- Disable add-ons
- Reset Firefox if needed

### Safari
- Clear website data
- Disable extensions
- Reset Safari if needed

## Firebase-Specific Performance

### 1. **Check Firebase Console**
- Ensure your project is active
- Check for any quota limits
- Verify authentication is working

### 2. **Network Tab Analysis**
- Open DevTools → Network tab
- Look for slow Firebase requests
- Check for failed requests

### 3. **Firebase Rules**
Ensure your Firestore rules are optimized:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Optimize rules for better performance
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Development vs Production

### Development Mode
- Slower due to hot reloading and development tools
- More verbose logging
- Source maps enabled

### Production Mode
- Much faster loading
- Optimized bundle
- No development overhead

To test production performance locally:
```bash
npm run build
npm run preview
```

## Getting Help

If performance issues persist:

1. **Check the Performance Monitor** in the bottom-right corner
2. **Open Chrome DevTools** → Performance tab → Record and analyze
3. **Check the Network tab** for slow requests
4. **Review the Console** for errors or warnings
5. **Test in different browsers** to isolate browser-specific issues

## Common Solutions

### If Firebase is slow:
- Check your internet connection
- Verify Firebase project settings
- Ensure environment variables are correct

### If the app is slow to start:
- Clear browser cache
- Restart the development server
- Check for large dependencies

### If hot reload is slow:
- Reduce the number of files being watched
- Use `.gitignore` to exclude unnecessary files
- Optimize your file structure 