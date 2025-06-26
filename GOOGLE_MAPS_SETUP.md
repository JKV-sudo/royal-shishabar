# 🗺️ Google Maps Integration Setup Guide

This guide explains how to set up Google Maps integration for the Royal Shisha Bar website.

## 📋 Prerequisites

- Google Cloud Platform account
- Billing enabled on your Google Cloud project
- Domain verification (for production)

## 🔧 Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 2. Enable Google Maps APIs

1. Go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Maps JavaScript API** (required for the map display)
   - **Places API** (optional, for enhanced location features)
   - **Geocoding API** (optional, for address conversion)

### 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict API Key (Recommended)

1. Click on the created API key to edit it
2. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain(s):
     - `localhost:5173/*` (for development)
     - `yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled in step 2

### 5. Add API Key to Environment Variables

1. Create or edit your `.env` file in the project root
2. Add the API key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

3. For production, add the same variable to your hosting platform (Vercel, etc.)

## 🎯 Features Included

The Google Maps integration includes:

- **Interactive Map**: Shows the Royal Shisha Bar location
- **Custom Marker**: Royal-themed marker with the business logo
- **Info Window**: Displays business information when marker is clicked
- **Action Buttons**: 
  - Get Directions (opens Google Maps directions)
  - Call (opens phone dialer)
  - Email (opens email client)
- **Responsive Design**: Works on all device sizes
- **Error Handling**: Graceful fallback if API key is missing

## 📍 Location Configuration

The map is configured to show the Royal Shisha Bar location at:
- **Address**: Stadtpl. 2, 84478 Waldkraiburg, Germany
- **Coordinates**: 48.2082, 12.3985

To change the location, edit the `location` object in `src/components/maps/LocationMap.tsx`:

```typescript
const location = {
  lat: 48.2082, // Replace with your latitude
  lng: 12.3985, // Replace with your longitude
  address: "Stadtpl. 2, 84478 Waldkraiburg, Germany", // Replace with your address
  name: "Royal Shisha Bar" // Replace with your business name
};
```

## 🔒 Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific domains
2. **Monitor Usage**: Set up billing alerts in Google Cloud Console
3. **Regular Review**: Periodically review and update API restrictions
4. **Environment Variables**: Never commit API keys to version control

## 💰 Cost Considerations

- **Free Tier**: $200 monthly credit (usually sufficient for small websites)
- **Usage Limits**: Monitor usage in Google Cloud Console
- **Billing Alerts**: Set up alerts to avoid unexpected charges

## 🚀 Deployment

1. **Development**: Works immediately with localhost restrictions
2. **Production**: 
   - Add your production domain to API key restrictions
   - Set environment variable in your hosting platform
   - Test the integration thoroughly

## 🐛 Troubleshooting

### Map Not Loading
- Check if API key is set correctly
- Verify API is enabled in Google Cloud Console
- Check browser console for errors
- Ensure domain is in API key restrictions

### API Key Errors
- Verify billing is enabled
- Check API quotas and limits
- Ensure correct APIs are enabled

### Styling Issues
- Check if Tailwind CSS classes are loaded
- Verify custom CSS variables are defined
- Test on different screen sizes

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console for API errors
2. Review browser console for JavaScript errors
3. Verify environment variables are set correctly
4. Test with a different API key

---

**Note**: This integration requires a valid Google Maps API key to function. Without it, a fallback message will be displayed with basic location information. 