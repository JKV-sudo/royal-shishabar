#!/bin/bash

# 🎥 Drone Footage Optimization Script for Vercel
# ================================================
# Optimizes large drone footage for web hosting
# Target: 800MB → 5-10MB (web-friendly)

echo "🎥 Drone Footage Optimization Script for Vercel"
echo "==============================================="

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

# Function to optimize drone footage
optimize_drone_footage() {
    local input_file="$1"
    local output_name="$2"
    
    if [ ! -f "$input_file" ]; then
        echo "❌ Input file not found: $input_file"
        return 1
    fi
    
    echo "🎬 Processing: $input_file"
    echo "📊 Original size: $(du -h "$input_file" | cut -f1)"
    
    # Get video duration
    duration=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$input_file")
    echo "⏱️  Duration: ${duration}s"
    
    # Calculate target bitrate for ~5MB file
    # Formula: (5MB * 8) / duration = kbps
    target_size_mb=5
    target_bitrate=$((target_size_mb * 8000 / ${duration%.*}))
    
    echo "🎯 Target bitrate: ${target_bitrate}kbps"
    
    # Optimize with aggressive compression
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -maxrate "${target_bitrate}k" \
        -bufsize "${target_bitrate}k" \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "public/videos/${output_name}.mp4"
    
    if [ $? -eq 0 ]; then
        echo "✅ Optimized: public/videos/${output_name}.mp4"
        echo "📊 New size: $(du -h "public/videos/${output_name}.mp4" | cut -f1)"
        echo "📈 Compression ratio: $(echo "scale=1; $(stat -f%z "$input_file") / $(stat -f%z "public/videos/${output_name}.mp4")" | bc)x smaller"
    else
        echo "❌ Optimization failed for $input_file"
        return 1
    fi
}

# Function to create multiple quality versions
create_quality_versions() {
    local input_file="$1"
    local base_name="$2"
    
    echo "🎬 Creating multiple quality versions for: $input_file"
    
    # High quality version (~10MB)
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "public/videos/${base_name}_high.mp4"
    
    # Medium quality version (~5MB)
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 96k \
        -movflags +faststart \
        -y \
        "public/videos/${base_name}_medium.mp4"
    
    # Low quality version (~2MB) for mobile
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset slow \
        -crf 32 \
        -vf "scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 64k \
        -movflags +faststart \
        -y \
        "public/videos/${base_name}_low.mp4"
    
    echo "✅ Created quality versions:"
    echo "   📹 High: public/videos/${base_name}_high.mp4 ($(du -h "public/videos/${base_name}_high.mp4" | cut -f1))"
    echo "   📹 Medium: public/videos/${base_name}_medium.mp4 ($(du -h "public/videos/${base_name}_medium.mp4" | cut -f1))"
    echo "   📹 Low: public/videos/${base_name}_low.mp4 ($(du -h "public/videos/${base_name}_low.mp4" | cut -f1))"
}

# Function to create WebM version (better compression)
create_webm_version() {
    local input_file="$1"
    local base_name="$2"
    
    echo "🎬 Creating WebM version for: $input_file"
    
    ffmpeg -i "$input_file" \
        -c:v libvpx-vp9 \
        -crf 30 \
        -b:v 0 \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
        -c:a libopus \
        -b:a 128k \
        -y \
        "public/videos/${base_name}.webm"
    
    if [ $? -eq 0 ]; then
        echo "✅ WebM version: public/videos/${base_name}.webm ($(du -h "public/videos/${base_name}.webm" | cut -f1))"
    fi
}

# Main processing
echo ""
echo "🚁 Drone Footage Optimization Options:"
echo "1. Optimize single file (basic compression)"
echo "2. Create multiple quality versions"
echo "3. Create WebM version (best compression)"
echo "4. Process all options"

read -p "Choose option (1-4): " choice

case $choice in
    1)
        read -p "Enter path to your drone footage file: " drone_file
        read -p "Enter output name (without extension): " output_name
        optimize_drone_footage "$drone_file" "$output_name"
        ;;
    2)
        read -p "Enter path to your drone footage file: " drone_file
        read -p "Enter base name for output files: " base_name
        create_quality_versions "$drone_file" "$base_name"
        ;;
    3)
        read -p "Enter path to your drone footage file: " drone_file
        read -p "Enter base name for output file: " base_name
        create_webm_version "$drone_file" "$base_name"
        ;;
    4)
        read -p "Enter path to your drone footage file: " drone_file
        read -p "Enter base name for output files: " base_name
        echo "🎬 Processing all optimization options..."
        optimize_drone_footage "$drone_file" "${base_name}_optimized"
        create_quality_versions "$drone_file" "$base_name"
        create_webm_version "$drone_file" "$base_name"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Optimization complete!"
echo "📁 Check the public/videos/ directory for your optimized files"
echo ""
echo "💡 Tips for using optimized videos:"
echo "   • Use the _medium.mp4 version for most web use"
echo "   • Use the .webm version for better compression"
echo "   • Use the _low.mp4 version for mobile devices"
echo "   • Update your video config to use the new files" 