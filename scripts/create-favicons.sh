#!/bin/bash

# 🎨 Favicon Generator Script
# ===========================
# Creates multiple favicon formats from your logo

echo "🎨 Creating Favicons from Logo"
echo "=============================="

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   macOS: brew install ffmpeg"
    exit 1
fi

# Check if logo exists
if [ ! -f "public/logo.jpeg" ]; then
    echo "❌ Logo file not found: public/logo.jpeg"
    exit 1
fi

echo "📸 Processing logo: public/logo.jpeg"

# Create different favicon sizes
echo "🎯 Creating favicon sizes..."

# 16x16 (standard favicon)
ffmpeg -i public/logo.jpeg \
    -vf "scale=16:16:force_original_aspect_ratio=decrease,pad=16:16:(ow-iw)/2:(oh-ih)/2" \
    -y public/favicon-16x16.png

# 32x32 (standard favicon)
ffmpeg -i public/logo.jpeg \
    -vf "scale=32:32:force_original_aspect_ratio=decrease,pad=32:32:(ow-iw)/2:(oh-ih)/2" \
    -y public/favicon-32x32.png

# 48x48 (Windows)
ffmpeg -i public/logo.jpeg \
    -vf "scale=48:48:force_original_aspect_ratio=decrease,pad=48:48:(ow-iw)/2:(oh-ih)/2" \
    -y public/favicon-48x48.png

# 180x180 (Apple Touch Icon)
ffmpeg -i public/logo.jpeg \
    -vf "scale=180:180:force_original_aspect_ratio=decrease,pad=180:180:(ow-iw)/2:(oh-ih)/2" \
    -y public/apple-touch-icon.png

# 192x192 (Android)
ffmpeg -i public/logo.jpeg \
    -vf "scale=192:192:force_original_aspect_ratio=decrease,pad=192:192:(ow-iw)/2:(oh-ih)/2" \
    -y public/android-chrome-192x192.png

# 512x512 (Android)
ffmpeg -i public/logo.jpeg \
    -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" \
    -y public/android-chrome-512x512.png

# Create ICO file (multi-size)
echo "🎨 Creating ICO file..."
ffmpeg -i public/favicon-16x16.png -i public/favicon-32x32.png -i public/favicon-48x48.png \
    -filter_complex "[0][1][2]concat=n=3:v=1[out]" \
    -map "[out]" \
    -y public/favicon.ico

echo "✅ Favicon files created:"
echo "   📱 16x16: public/favicon-16x16.png"
echo "   📱 32x32: public/favicon-32x32.png"
echo "   📱 48x48: public/favicon-48x48.png"
echo "   🍎 Apple: public/apple-touch-icon.png"
echo "   🤖 Android: public/android-chrome-192x192.png"
echo "   🤖 Android: public/android-chrome-512x512.png"
echo "   🎯 ICO: public/favicon.ico"

echo ""
echo "🎉 Favicon generation complete!"
echo "💡 Update your HTML to include these favicon links" 