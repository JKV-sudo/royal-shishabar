# 🆓 Free Video Hosting on Vercel

## Overview
You can host videos for **FREE** on Vercel by placing them in the `public/videos/` folder. This is perfect for small to medium video files and works great for hero section videos.

## ✅ Advantages of Vercel Hosting
- **100% Free** - No monthly costs
- **Global CDN** - Fast loading worldwide
- **Automatic HTTPS** - Secure video delivery
- **No setup required** - Just upload and deploy
- **Integrated with your site** - Same domain as your website

## 📊 Vercel Limits (Free Tier)
- **Max file size**: 10MB per video
- **Recommended**: 5-8MB for optimal performance
- **Format**: MP4 with H.264 codec
- **Duration**: 10-30 seconds per video

## 🚀 Quick Setup

### 1. Prepare Your Videos
```bash
# Install FFmpeg (if not already installed)
brew install ffmpeg  # macOS
# or
sudo apt install ffmpeg  # Ubuntu
```

### 2. Optimize Videos
```bash
# Use the provided script
./scripts/optimize-videos.sh ~/Desktop/your-video.mp4

# Or manually with FFmpeg
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4
```

### 3. Upload Videos
```bash
# Copy optimized videos to public/videos/
cp ~/Desktop/optimized-video.mp4 public/videos/royal-atmosphere.mp4
```

### 4. Update Configuration
Edit `src/config/videos.ts`:
```typescript
{
  id: 1,
  title: "Royal Atmosphere",
  description: "Experience the luxurious ambiance",
  url: "/videos/royal-atmosphere.mp4", // This will work on Vercel
  fallback: "https://your-fallback-image.jpg",
  category: "atmosphere"
}
```

### 5. Deploy
```bash
# Deploy to Vercel
vercel --prod
```

## 🎥 Video Optimization Guide

### Recommended Settings
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 24-30 fps
- **Bitrate**: 2-4 Mbps
- **Audio**: AAC, 128kbps
- **Duration**: 10-30 seconds

### FFmpeg Commands

#### High Quality (8-10MB)
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

#### Medium Quality (5-8MB)
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k output.mp4
```

#### Small Size (3-5MB)
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -preset medium -c:a aac -b:a 96k output.mp4
```

## 📁 File Structure
```
your-project/
├── public/
│   └── videos/
│       ├── royal-atmosphere.mp4
│       ├── premium-shisha.mp4
│       ├── live-entertainment.mp4
│       └── vip-experience.mp4
├── src/
│   └── config/
│       └── videos.ts
└── scripts/
    └── optimize-videos.sh
```

## 🔧 Troubleshooting

### Videos Not Loading
1. **Check file size**: Must be under 10MB
2. **Verify format**: Use MP4 with H.264
3. **Check path**: Should be `/videos/filename.mp4`
4. **Deploy again**: Run `vercel --prod`

### Performance Issues
1. **Compress more**: Use higher CRF values (28-32)
2. **Reduce resolution**: Try 1280x720 instead of 1920x1080
3. **Shorten duration**: Keep videos under 30 seconds
4. **Remove audio**: If not needed, remove audio track

### Mobile Issues
1. **Test on mobile**: Check loading times
2. **Reduce quality**: Use lower bitrates for mobile
3. **Check network**: Test on slow connections

## 📱 Mobile Optimization

### Responsive Video Settings
```typescript
// In src/config/videos.ts
export const VIDEO_QUALITY = {
  mobile: {
    width: 640,
    height: 360,
    bitrate: "800k"
  },
  tablet: {
    width: 1280,
    height: 720,
    bitrate: "1500k"
  },
  desktop: {
    width: 1920,
    height: 1080,
    bitrate: "3000k"
  }
};
```

## 🆚 Alternative Free Options

### 1. Cloudinary (Free Tier)
- 25GB storage
- Automatic optimization
- CDN included
- Easy integration

### 2. Firebase Storage (Free Tier)
- 5GB storage
- Google CDN
- Good for larger files

### 3. AWS S3 + CloudFront
- 5GB storage
- Global CDN
- More complex setup

## 💡 Tips for Best Results

### Content Tips
- **Keep it short**: 10-30 seconds per video
- **Show atmosphere**: Focus on ambiance and mood
- **Highlight products**: Show shisha preparation
- **Include people**: Show staff and customers
- **Use good lighting**: Well-lit videos look professional

### Technical Tips
- **Test locally**: Use `npm run dev` to test videos
- **Check file sizes**: Monitor total bundle size
- **Use fallbacks**: Always provide fallback images
- **Optimize thumbnails**: Create preview images
- **Monitor performance**: Check loading times

## 🚀 Deployment Checklist

- [ ] Videos optimized and under 10MB each
- [ ] Videos placed in `public/videos/` folder
- [ ] Configuration updated in `src/config/videos.ts`
- [ ] Fallback images provided
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to Vercel with `vercel --prod`
- [ ] Tested on mobile devices
- [ ] Checked loading performance

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify video file formats
3. Test with different browsers
4. Check network connectivity
5. Review file size limits

## 🎉 Success!

Once deployed, your videos will be available at:
- `https://your-domain.vercel.app/videos/royal-atmosphere.mp4`
- `https://your-domain.vercel.app/videos/premium-shisha.mp4`
- etc.

The video carousel will automatically load these videos and provide a professional, engaging experience for your visitors! 