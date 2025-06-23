# 🌐 External Configuration Guide - Royal Shisha Bar

This guide covers all external services, platforms, and configurations you need to set up outside of this repository.

## 📋 Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Social Login Providers](#social-login-providers)
3. [Domain & Hosting](#domain--hosting)
4. [Google Services](#google-services)
5. [Analytics & Monitoring](#analytics--monitoring)
6. [Payment Processing](#payment-processing)
7. [Email Services](#email-services)
8. [Spotify Integration](#spotify-integration)
9. [Security & SSL](#security--ssl)
10. [Testing & Development](#testing--development)

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
- **URL**: [https://console.firebase.google.com](https://console.firebase.google.com)
- **Steps**:
  1. Click "Create a project"
  2. Project name: `royal-shishabar`
  3. Enable Google Analytics (recommended)
  4. Choose analytics account
  5. Click "Create project"

### 2. Enable Authentication
- **Path**: Authentication → Sign-in method
- **Enable providers**:
  - ✅ Email/Password
  - ✅ Google
  - ✅ Facebook
  - ✅ Twitter
  - ✅ GitHub
  - ✅ Apple

### 3. Create Firestore Database
- **Path**: Firestore Database → Create database
- **Settings**:
  - Start in test mode
  - Location: `europe-west3` (Frankfurt, Germany)
  - Enable offline persistence

### 4. Set Up Storage
- **Path**: Storage → Get started
- **Settings**:
  - Start in test mode
  - Location: Same as Firestore
  - Create folders: `avatars/`, `menu/`, `events/`, `admin/`

### 5. Get Configuration
- **Path**: Project Settings → General → Your apps
- **Action**: Add web app, copy config object

---

## 🔗 Social Login Providers

### Google (Built-in Firebase)
- **Status**: ✅ Automatic with Firebase
- **No additional setup required**

### Facebook
- **URL**: [https://developers.facebook.com](https://developers.facebook.com)
- **Steps**:
  1. Create new app
  2. Add "Facebook Login" product
  3. Configure OAuth redirect URIs:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     https://your-domain.vercel.app/__/auth/handler
     ```
  4. Copy App ID and App Secret

### Twitter/X
- **URL**: [https://developer.twitter.com](https://developer.twitter.com)
- **Steps**:
  1. Create new app
  2. Enable OAuth 2.0
  3. Add callback URLs:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     https://your-domain.vercel.app/__/auth/handler
     ```
  4. Copy API Key and API Secret

### GitHub
- **URL**: [https://github.com/settings/developers](https://github.com/settings/developers)
- **Steps**:
  1. Click "New OAuth App"
  2. Fill in app details
  3. Add Authorization callback URL:
     ```
     https://your-project.firebaseapp.com/__/auth/handler
     http://localhost:5173/__/auth/handler
     https://your-domain.vercel.app/__/auth/handler
     ```
  4. Copy Client ID and Client Secret

### Instagram (Custom OAuth)
- **URL**: [https://developers.facebook.com](https://developers.facebook.com)
- **Steps**:
  1. Create app or use existing Facebook app
  2. Add "Instagram Basic Display" product
  3. Configure OAuth redirect URIs
  4. Copy Instagram App ID and App Secret

### Apple Sign-In
- **URL**: [https://developer.apple.com](https://developer.apple.com)
- **Steps**:
  1. Create App ID
  2. Enable "Sign In with Apple"
  3. Create Service ID
  4. Configure return URLs
  5. Download private key
  6. Note Team ID and Key ID

---

## 🌐 Domain & Hosting

### Vercel Deployment
- **URL**: [https://vercel.com](https://vercel.com)
- **Steps**:
  1. Connect GitHub repository
  2. Configure build settings:
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
  3. Add environment variables
  4. Deploy

### Custom Domain (Optional)
- **Registrar**: Any domain registrar (GoDaddy, Namecheap, etc.)
- **Domain**: `royalshisha.de` or similar
- **Steps**:
  1. Purchase domain
  2. Add DNS records in Vercel
  3. Configure SSL certificate (automatic with Vercel)

---

## 🔍 Google Services

### Google Maps API
- **URL**: [https://console.cloud.google.com](https://console.cloud.google.com)
- **Steps**:
  1. Create new project or use existing
  2. Enable Maps JavaScript API
  3. Create API key
  4. Restrict API key to your domain
  5. Set up billing (required)

### Google Analytics 4
- **URL**: [https://analytics.google.com](https://analytics.google.com)
- **Steps**:
  1. Create new property
  2. Choose "Web" platform
  3. Enter website details
  4. Copy Measurement ID (G-XXXXXXXXXX)

### Google Search Console
- **URL**: [https://search.google.com/search-console](https://search.google.com/search-console)
- **Steps**:
  1. Add property
  2. Verify ownership (DNS or HTML file)
  3. Submit sitemap
  4. Monitor search performance

---

## 📊 Analytics & Monitoring

### Firebase Analytics
- **Status**: ✅ Automatic with Firebase project
- **Features**:
  - User engagement
  - Conversion tracking
  - Custom events
  - Crash reporting

### Sentry (Error Monitoring)
- **URL**: [https://sentry.io](https://sentry.io)
- **Steps**:
  1. Create account
  2. Create new project
  3. Choose React framework
  4. Copy DSN
  5. Add to environment variables

### Uptime Monitoring
- **Options**:
  - **UptimeRobot**: [https://uptimerobot.com](https://uptimerobot.com)
  - **Pingdom**: [https://pingdom.com](https://pingdom.com)
  - **StatusCake**: [https://statuscake.com](https://statuscake.com)

---

## 💳 Payment Processing

### Stripe (Recommended)
- **URL**: [https://stripe.com](https://stripe.com)
- **Steps**:
  1. Create account
  2. Get API keys (publishable and secret)
  3. Configure webhook endpoints
  4. Set up payment methods
  5. Test with test cards

### PayPal (Alternative)
- **URL**: [https://developer.paypal.com](https://developer.paypal.com)
- **Steps**:
  1. Create developer account
  2. Create app
  3. Get Client ID and Secret
  4. Configure webhooks

---

## 📧 Email Services

### SendGrid
- **URL**: [https://sendgrid.com](https://sendgrid.com)
- **Steps**:
  1. Create account
  2. Verify sender domain
  3. Get API key
  4. Configure email templates

### Mailgun (Alternative)
- **URL**: [https://mailgun.com](https://mailgun.com)
- **Steps**:
  1. Create account
  2. Add domain
  3. Get API key
  4. Configure DNS records

### Email Templates Needed:
- Welcome email
- Password reset
- Order confirmation
- Reservation confirmation
- Newsletter (optional)

---

## 🎵 Spotify Integration (Phase 2)

### Spotify Developer Account
- **URL**: [https://developer.spotify.com](https://developer.spotify.com)
- **Steps**:
  1. Create account
  2. Create new app
  3. Get Client ID and Client Secret
  4. Add redirect URI:
     ```
     http://localhost:5173/callback
     https://your-domain.vercel.app/callback
     ```
  5. Request necessary scopes:
     - `playlist-read-private`
     - `playlist-modify-public`
     - `playlist-modify-private`
     - `user-read-email`

---

## 🔒 Security & SSL

### SSL Certificate
- **Status**: ✅ Automatic with Vercel
- **No additional setup required**

### Security Headers
- **Status**: ✅ Configured in `vercel.json`
- **Headers included**:
  - Content Security Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy

### Rate Limiting
- **Vercel**: Built-in rate limiting
- **Firebase**: Automatic protection
- **Additional**: Consider Cloudflare for DDoS protection

---

## 🧪 Testing & Development

### Firebase Emulators
- **Command**: `npm run firebase:emulators`
- **URLs**:
  - Emulator UI: `http://localhost:4000`
  - Auth: `http://localhost:9099`
  - Firestore: `http://localhost:8080`
  - Storage: `http://localhost:9199`

### Browser Testing
- **Tools**:
  - Chrome DevTools
  - Firefox Developer Tools
  - Safari Web Inspector
  - Mobile device testing

### Performance Testing
- **Tools**:
  - Lighthouse (built into Chrome)
  - PageSpeed Insights
  - WebPageTest

---

## 📱 Mobile Considerations

### Progressive Web App (PWA)
- **Status**: Can be added later
- **Features**:
  - Offline functionality
  - Push notifications
  - App-like experience

### Mobile Testing
- **Devices to test**:
  - iPhone (Safari)
  - Android (Chrome)
  - iPad (Safari)
  - Various screen sizes

---

## 🚀 Production Checklist

### Before Launch:
- [ ] All environment variables set in Vercel
- [ ] Firebase security rules deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Google Analytics tracking
- [ ] Error monitoring active
- [ ] Uptime monitoring configured
- [ ] Payment processing tested
- [ ] Email templates created
- [ ] Social login providers configured
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] GDPR compliance checked

### Post-Launch:
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Monitor performance
- [ ] Check security logs
- [ ] Backup data regularly
- [ ] Update dependencies
- [ ] Monitor costs

---

## 💰 Cost Estimation

### Monthly Costs (Estimated):
- **Vercel**: $0-20/month (depending on usage)
- **Firebase**: $0-25/month (free tier is generous)
- **Domain**: $10-15/year
- **Google Maps**: $0-10/month (depending on usage)
- **Email Service**: $0-20/month
- **Payment Processing**: 2.9% + 30¢ per transaction
- **Monitoring**: $0-10/month

### Total Estimated Monthly Cost: $10-85/month

---

## 🆘 Support Resources

### Documentation:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community:
- [Stack Overflow](https://stackoverflow.com)
- [Firebase Community](https://firebase.google.com/community)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Support:
- Firebase Support: [https://firebase.google.com/support](https://firebase.google.com/support)
- Vercel Support: [https://vercel.com/support](https://vercel.com/support)

---

## 📞 Emergency Contacts

### Critical Services:
- **Domain Registrar**: Your domain provider's support
- **Vercel**: [support@vercel.com](mailto:support@vercel.com)
- **Firebase**: [https://firebase.google.com/support](https://firebase.google.com/support)
- **Stripe**: [https://support.stripe.com](https://support.stripe.com)

---

**🎉 Your external configuration is now complete!**

Remember to keep all credentials secure and never commit them to version control. 