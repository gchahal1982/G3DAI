#!/bin/bash

# Aura AI IDE Launcher
# This script launches the Aura AI IDE with proper security handling

echo "🚀 Launching AURA AI IDE..."

APP_PATH="/Applications/Aura AI IDE.app"

# Check if app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Aura AI IDE not found in Applications folder"
    echo "Please ensure it's properly installed"
    exit 1
fi

# Remove quarantine attributes if they exist
echo "🔓 Removing security restrictions..."
sudo xattr -rd com.apple.quarantine "$APP_PATH" 2>/dev/null || true

# Launch the application
echo "✨ Opening Aura AI IDE..."
open "$APP_PATH"

# Check if it launched successfully
sleep 2
if pgrep -f "Aura AI IDE" > /dev/null; then
    echo "✅ Aura AI IDE launched successfully!"
else
    echo "⚠️  If Aura AI IDE didn't open, try:"
    echo "   1. Right-click the app → Open"
    echo "   2. Go to System Preferences → Security & Privacy → Allow"
    echo "   3. Or run: sudo codesign --remove-signature \"$APP_PATH\""
fi 