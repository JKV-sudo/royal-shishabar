#!/bin/bash

# Video Optimization Script for Vercel
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

VIDEOS_DIR="public/videos/originals"
OUTPUT_DIR="public/videos/optimized"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Starting high-quality video optimization..."

# Get unique videos (excluding duplicates with [1] or Kopie)
unique_videos=()
for video in "$VIDEOS_DIR"/*.mp4; do
    if [ -f "$video" ]; then
        filename=$(basename "$video")
        if [[ "$filename" != *"[1]"* ]] && [[ "$filename" != *"Kopie"* ]]; then
            unique_videos+=("$video")
            echo "Found: $filename"
        fi
    fi
done

echo "Processing ${#unique_videos[@]} videos with high quality settings..."

clip_number=1
for video in "${unique_videos[@]}"; do
    filename=$(basename "$video")
    output_name="clip_${clip_number}.mp4"
    output_path="$OUTPUT_DIR/$output_name"
    
    echo "Processing clip $clip_number: $filename"
    
    # High-quality optimization settings - much better quality than before
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset slow \
        -crf 20 \
        -c:a aac \
        -b:a 192k \
        -movflags +faststart \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
        -y "$output_path"
    
    if [ $? -eq 0 ]; then
        original_size=$(stat -f%z "$video" 2>/dev/null || stat -c%s "$video" 2>/dev/null)
        optimized_size=$(stat -f%z "$output_path" 2>/dev/null || stat -c%s "$output_path" 2>/dev/null)
        savings=$((original_size - optimized_size))
        savings_percent=$((savings * 100 / original_size))
        
        echo "✅ clip_${clip_number}.mp4 - Saved ${savings_percent}% (${original_size} -> ${optimized_size} bytes)"
    else
        echo "❌ Failed to process $filename"
    fi
    
    ((clip_number++))
done

echo "🎉 High-quality video optimization complete!"
echo "📁 Optimized videos saved to: $OUTPUT_DIR"

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