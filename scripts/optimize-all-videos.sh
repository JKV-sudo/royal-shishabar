#!/bin/bash

# Script to optimize all videos and rename them to clip_1, clip_2, etc.
# This script will filter out duplicates and optimize each unique video

VIDEOS_DIR="public/videos"
OUTPUT_DIR="public/videos/optimized"
TEMP_DIR="public/videos/temp"

# Create output and temp directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "🎬 Starting video optimization..."

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

echo "Processing ${#unique_videos[@]} videos..."

clip_number=1
for video in "${unique_videos[@]}"; do
    filename=$(basename "$video")
    output_name="clip_${clip_number}.mp4"
    output_path="$OUTPUT_DIR/$output_name"
    
    echo "Processing clip $clip_number: $filename"
    
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
        -movflags +faststart \
        -y \
        "$output_path"
    
    if [ $? -eq 0 ]; then
        echo "✅ Created: $output_name"
        clip_number=$((clip_number + 1))
    else
        echo "❌ Error processing $filename"
    fi
done

echo "🎉 Complete! Processed $((clip_number - 1)) videos"

# Create a summary file
echo "Video Optimization Summary" > "$OUTPUT_DIR/optimization_summary.txt"
echo "Generated on: $(date)" >> "$OUTPUT_DIR/optimization_summary.txt"
echo "Total videos processed: $((clip_number - 1))" >> "$OUTPUT_DIR/optimization_summary.txt"
echo "" >> "$OUTPUT_DIR/optimization_summary.txt"
echo "Files created:" >> "$OUTPUT_DIR/optimization_summary.txt"
ls -la "$OUTPUT_DIR"/*.mp4 | while read line; do
    echo "  $line" >> "$OUTPUT_DIR/optimization_summary.txt"
done

echo "📄 Summary saved to: $OUTPUT_DIR/optimization_summary.txt"

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "✨ All done! Your optimized videos are ready to use." 