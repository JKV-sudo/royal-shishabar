export interface VideoConfig {
  id: number;
  title: string;
  description: string;
  url: string;
  fallback: string;
  duration?: number; // in seconds
  category?: string;
}

// Free hosting on Vercel - place videos in public/videos/ folder
// Vercel will serve these files directly from your domain
export const HERO_VIDEOS: VideoConfig[] = [
  {
    id: 1,
    title: "Drone Tour - Royal Shisha",
    description: "Aerial view of our premium hookah lounge - inside and outside",
    url: "/videos/done.mp4", // Your optimized drone footage
    fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    duration: 22,
    category: "drone"
  },
  {
    id: 2,
    title: "Royal Atmosphere",
    description: "Experience the luxurious ambiance of our premium hookah lounge",
    url: "/videos/royal-atmosphere.mp4", // Served from public/videos/
    fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    category: "atmosphere"
  },
  {
    id: 3,
    title: "Premium Shisha",
    description: "Discover our exclusive collection of premium shisha flavors",
    url: "/videos/premium-shisha.mp4", // Served from public/videos/
    fallback: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    category: "products"
  },
  {
    id: 4,
    title: "Live Entertainment",
    description: "Enjoy live DJ performances and entertainment",
    url: "/videos/live-entertainment.mp4", // Served from public/videos/
    fallback: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    category: "entertainment"
  },
  {
    id: 5,
    title: "VIP Experience",
    description: "Exclusive VIP areas and premium service",
    url: "/videos/vip-experience.mp4", // Served from public/videos/
    fallback: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    category: "vip"
  }
];

// Video settings optimized for Vercel hosting
export const VIDEO_SETTINGS = {
  autoPlay: true,
  loop: true,
  muted: true,
  transitionDuration: 1000, // milliseconds
  autoAdvanceInterval: 8000, // milliseconds
  showControls: true,
  showIndicators: true,
  showInfo: true,
  fallbackOnError: true
};

// Vercel hosting recommendations
export const VERCEL_VIDEO_GUIDELINES = {
  maxFileSize: "10MB", // Vercel's limit for free tier
  recommendedFormats: ["mp4", "webm"],
  recommendedCodec: "H.264",
  maxDuration: "30 seconds",
  compression: "Use tools like HandBrake or FFmpeg to compress videos"
};

// Video quality settings for different screen sizes
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

// Helper function to get video by category
export const getVideosByCategory = (category: string): VideoConfig[] => {
  return HERO_VIDEOS.filter(video => video.category === category);
};

// Helper function to get random video
export const getRandomVideo = (): VideoConfig => {
  const randomIndex = Math.floor(Math.random() * HERO_VIDEOS.length);
  return HERO_VIDEOS[randomIndex];
};

// Helper function to get video by ID
export const getVideoById = (id: number): VideoConfig | undefined => {
  return HERO_VIDEOS.find(video => video.id === id);
}; 