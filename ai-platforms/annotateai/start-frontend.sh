#!/bin/bash

echo "🚀 Starting AnnotateAI Frontend..."
echo "Bypassing workspace dependencies..."

# Install Next.js and core dependencies directly
npm install --no-package-lock --legacy-peer-deps \
  next@^14.0.0 \
  react@^18.2.0 \
  react-dom@^18.2.0 \
  typescript@^5.8.3 \
  @types/node@^20.0.0 \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  tailwindcss@^3.3.0 \
  autoprefixer@^10.4.16 \
  postcss@^8.4.31

echo "✅ Dependencies installed"
echo "🚀 Starting Next.js development server on port 3021..."

# Start the Next.js development server
npx next dev -p 3021 