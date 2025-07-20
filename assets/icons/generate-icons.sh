#!/bin/bash
# Aura Icon Generation Script
# Generates all required icon formats for cross-platform deployment

echo "🎨 Generating Aura VS Code Fork Icons..."

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install ImageMagick:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/"
    exit 1
fi

# Create directories
mkdir -p source windows macos linux web

# Create source SVG if it doesn't exist
if [ ! -f "source/aura-logo.svg" ]; then
    echo "📝 Creating source SVG template..."
    cat > source/aura-logo.svg << 'EOF'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
    <filter id="glow">
      <feMorphology operator="dilate" radius="2"/>
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#auraGradient)" opacity="0.1"/>
  
  <!-- Main A Symbol -->
  <path d="M256 80 L340 400 L300 400 L285 360 L227 360 L212 400 L172 400 Z M245 280 L267 280 L256 250 Z" 
        fill="url(#auraGradient)" filter="url(#glow)"/>
  
  <!-- Neural Network Nodes -->
  <circle cx="200" cy="180" r="6" fill="#60a5fa" opacity="0.8"/>
  <circle cx="312" cy="160" r="6" fill="#60a5fa" opacity="0.8"/>
  <circle cx="340" cy="220" r="6" fill="#60a5fa" opacity="0.8"/>
  <circle cx="180" cy="280" r="6" fill="#60a5fa" opacity="0.8"/>
  <circle cx="332" cy="300" r="6" fill="#60a5fa" opacity="0.8"/>
  
  <!-- Connection Lines -->
  <line x1="200" y1="180" x2="312" y2="160" stroke="#60a5fa" stroke-width="2" opacity="0.4"/>
  <line x1="312" y1="160" x2="340" y2="220" stroke="#60a5fa" stroke-width="2" opacity="0.4"/>
  <line x1="180" y1="280" x2="332" y2="300" stroke="#60a5fa" stroke-width="2" opacity="0.4"/>
  <line x1="200" y1="180" x2="180" y2="280" stroke="#60a5fa" stroke-width="2" opacity="0.4"/>
  <line x1="340" y1="220" x2="332" y2="300" stroke="#60a5fa" stroke-width="2" opacity="0.4"/>
</svg>
EOF
fi

echo "🔄 Generating PNG files from SVG..."

# Linux PNG sizes
sizes=(16 22 24 32 48 64 96 128 256 512)
for size in "${sizes[@]}"; do
    echo "  📐 Generating ${size}x${size} PNG..."
    convert source/aura-logo.svg -resize ${size}x${size} linux/aura-${size}.png
done

echo "🍎 Generating macOS .icns file..."
# Create iconset directory for macOS
mkdir -p aura.iconset

# Generate all required macOS sizes
convert source/aura-logo.svg -resize 16x16 aura.iconset/icon_16x16.png
convert source/aura-logo.svg -resize 32x32 aura.iconset/icon_16x16@2x.png
convert source/aura-logo.svg -resize 32x32 aura.iconset/icon_32x32.png
convert source/aura-logo.svg -resize 64x64 aura.iconset/icon_32x32@2x.png
convert source/aura-logo.svg -resize 128x128 aura.iconset/icon_128x128.png
convert source/aura-logo.svg -resize 256x256 aura.iconset/icon_128x128@2x.png
convert source/aura-logo.svg -resize 256x256 aura.iconset/icon_256x256.png
convert source/aura-logo.svg -resize 512x512 aura.iconset/icon_256x256@2x.png
convert source/aura-logo.svg -resize 512x512 aura.iconset/icon_512x512.png
convert source/aura-logo.svg -resize 1024x1024 aura.iconset/icon_512x512@2x.png

# Create .icns file (requires macOS)
if command -v iconutil &> /dev/null; then
    iconutil -c icns aura.iconset
    mv aura.icns macos/
    echo "  ✅ Created aura.icns for macOS"
else
    echo "  ⚠️  iconutil not available (macOS only). Created PNG files in aura.iconset/"
fi

echo "🪟 Generating Windows .ico file..."
# Create multi-resolution ICO file
convert source/aura-logo.svg \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 20x20 \) \
    \( -clone 0 -resize 24x24 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 40x40 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 64x64 \) \
    \( -clone 0 -resize 96x96 \) \
    \( -clone 0 -resize 128x128 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 windows/aura.ico

echo "🌐 Generating web icons..."
# Web favicons
convert source/aura-logo.svg -resize 16x16 web/favicon-16x16.png
convert source/aura-logo.svg -resize 32x32 web/favicon-32x32.png
convert source/aura-logo.svg -resize 180x180 web/apple-touch-icon.png

# Create favicon.ico
convert web/favicon-16x16.png web/favicon-32x32.png web/favicon.ico

# Cleanup
rm -rf aura.iconset

echo "✅ Icon generation complete!"
echo "📁 Files created:"
echo "   🐧 Linux PNGs: linux/"
echo "   🍎 macOS .icns: macos/aura.icns"
echo "   🪟 Windows .ico: windows/aura.ico"
echo "   🌐 Web icons: web/"
echo ""
echo "📝 Next steps:"
echo "   1. Review generated icons for quality"
echo "   2. Test icons in different OS themes"
echo "   3. Update VS Code fork with new icons"
echo "   4. Add icons to build configuration" 