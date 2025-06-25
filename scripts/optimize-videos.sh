#!/bin/bash

# Video Optimization Script for Vercel Hosting
# This script helps optimize videos for free hosting on Vercel

echo "🎥 Video Optimization Script for Vercel"
echo "========================================"

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

# Create videos directory if it doesn't exist
mkdir -p public/videos

echo "📁 Videos will be saved to: public/videos/"
echo ""

# Function to optimize a video
optimize_video() {
    local input_file="$1"
    local output_file="public/videos/$(basename "$input_file" | sed 's/\.[^.]*$/.mp4/')"
    
    echo "🔄 Optimizing: $(basename "$input_file")"
    
    # Check file size
    local file_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file" 2>/dev/null)
    local file_size_mb=$((file_size / 1024 / 1024))
    
    echo "   📊 Original size: ${file_size_mb}MB"
    
    if [ $file_size_mb -gt 10 ]; then
        echo "   ⚠️  File is larger than 10MB. Compressing..."
        
        # Optimize for Vercel (under 10MB, good quality)
        ffmpeg -i "$input_file" \
            -c:v libx264 \
            -crf 28 \
            -preset medium \
            -c:a aac \
            -b:a 128k \
            -movflags +faststart \
            -y "$output_file"
    else
        echo "   ✅ File size is good. Converting to MP4..."
        
        # Just convert to MP4 with H.264
        ffmpeg -i "$input_file" \
            -c:v libx264 \
            -preset medium \
            -c:a aac \
            -movflags +faststart \
            -y "$output_file"
    fi
    
    # Check final size
    local final_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    local final_size_mb=$((final_size / 1024 / 1024))
    
    echo "   ✅ Optimized size: ${final_size_mb}MB"
    echo "   📁 Saved to: $output_file"
    echo ""
}

# Check if files were provided as arguments
if [ $# -eq 0 ]; then
    echo "📋 Usage:"
    echo "   ./scripts/optimize-videos.sh video1.mp4 video2.mov video3.avi"
    echo ""
    echo "📋 Or drag and drop videos:"
    echo "   ./scripts/optimize-videos.sh \"path/to/your/video.mp4\""
    echo ""
    echo "📋 Example:"
    echo "   ./scripts/optimize-videos.sh ~/Desktop/royal-atmosphere.mp4"
    echo ""
    exit 1
fi

# Process each video file
for video_file in "$@"; do
    if [ -f "$video_file" ]; then
        optimize_video "$video_file"
    else
        echo "❌ File not found: $video_file"
    fi
done

echo "🎉 Video optimization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Check the optimized videos in public/videos/"
echo "   2. Update src/config/videos.ts with your video names"
echo "   3. Deploy to Vercel"
echo ""
echo "📊 Vercel Limits (Free Tier):"
echo "   - Max file size: 10MB per video"
echo "   - Recommended: 5-8MB for fast loading"
echo "   - Format: MP4 with H.264 codec"
echo "" 