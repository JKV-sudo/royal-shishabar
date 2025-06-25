# Video Setup Guide for Royal Shisha Hero Section

## Overview
The hero section now features a video carousel that cycles through multiple videos showcasing your hookah lounge. The system includes automatic fallback to images if videos fail to load.

## Features
- ✅ Auto-advancing video carousel
- ✅ Manual navigation controls (previous/next buttons)
- ✅ Play/pause controls
- ✅ Video indicators (dots)
- ✅ Video information display
- ✅ Smooth transitions between videos
- ✅ Fallback images for video errors
- ✅ Responsive design
- ✅ Touch-friendly controls

## Setup Instructions

### 1. Prepare Your Videos
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 (Full HD) or higher
- **Duration**: 10-30 seconds per video
- **File Size**: Keep under 10MB per video for fast loading
- **Content**: Showcase your venue, atmosphere, products, and services

### 2. Host Your Videos
Choose one of these hosting options:

#### Option A: Firebase Storage (Recommended)
```bash
# Upload videos to Firebase Storage
# Update the URLs in src/config/videos.ts
```

#### Option B: Public Folder
```bash
# Place videos in public/videos/ folder
# Update URLs to: /videos/your-video.mp4
```

#### Option C: CDN/External Hosting
```bash
# Upload to CDN and update URLs
# Example: https://your-cdn.com/videos/royal-atmosphere.mp4
```

### 3. Configure Videos
Edit `src/config/videos.ts`:

```typescript
export const HERO_VIDEOS: VideoConfig[] = [
  {
    id: 1,
    title: "Royal Atmosphere",
    description: "Experience the luxurious ambiance of our premium hookah lounge",
    url: "/videos/royal-atmosphere.mp4", // Your video URL
    fallback: "https://your-fallback-image.jpg", // Fallback image
    category: "atmosphere"
  },
  // Add more videos...
];
```

### 4. Video Settings
Customize in `src/config/videos.ts`:

```typescript
export const VIDEO_SETTINGS = {
  autoPlay: true,              // Auto-play videos
  loop: true,                  // Loop individual videos
  muted: true,                 // Mute videos (required for auto-play)
  transitionDuration: 1000,    // Transition time in milliseconds
  autoAdvanceInterval: 8000,   // Time between video changes
  showControls: true,          // Show navigation controls
  showIndicators: true,        // Show dot indicators
  showInfo: true,              // Show video title/description
  fallbackOnError: true        // Show fallback image on error
};
```

## Video Content Suggestions

### 1. Atmosphere Videos
- Interior shots of your lounge
- Ambient lighting and decor
- Seating areas and VIP sections
- Staff interactions

### 2. Product Videos
- Shisha preparation process
- Different flavors and setups
- Premium equipment showcase
- Food and beverage presentation

### 3. Entertainment Videos
- Live DJ performances
- Music and atmosphere
- Events and special occasions
- Customer experiences

### 4. Service Videos
- Staff training and professionalism
- VIP service highlights
- Special events and celebrations
- Behind-the-scenes content

## Performance Optimization

### Video Optimization
```bash
# Use FFmpeg to optimize videos
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### Recommended Settings
- **Codec**: H.264
- **Bitrate**: 2-4 Mbps for 1080p
- **Audio**: AAC, 128kbps
- **Duration**: 10-30 seconds
- **File Size**: < 10MB per video

## Troubleshooting

### Videos Not Playing
1. Check video format (MP4 with H.264)
2. Verify video URLs are accessible
3. Check browser console for errors
4. Ensure videos are properly hosted

### Performance Issues
1. Compress videos further
2. Use CDN for faster delivery
3. Implement lazy loading
4. Consider multiple quality versions

### Mobile Issues
1. Test on various devices
2. Ensure touch controls work
3. Check mobile data usage
4. Optimize for smaller screens

## Customization

### Styling
Edit `src/index.css` for custom styling:
```css
.video-carousel-container {
  /* Your custom styles */
}

.video-control {
  /* Control button styles */
}
```

### Behavior
Modify `src/pages/Home.tsx` for custom behavior:
- Change transition effects
- Add custom controls
- Implement different navigation patterns

## Support
For issues or questions:
1. Check browser console for errors
2. Verify video file formats
3. Test with different browsers
4. Check network connectivity

## Future Enhancements
- [ ] Video preloading
- [ ] Multiple quality versions
- [ ] Custom video player
- [ ] Analytics tracking
- [ ] A/B testing support
- [ ] Video thumbnails
- [ ] Fullscreen mode
- [ ] Video captions 