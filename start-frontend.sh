#!/bin/bash

echo "🏥 Starting MedSight Pro Frontend..."
echo "Bypassing workspace dependencies..."

# Install Next.js and core dependencies directly
npm install --no-package-lock --legacy-peer-deps \
  next@^14.2.30 \
  react@^18.2.0 \
  react-dom@^18.2.0 \
  typescript@^5.8.3 \
  @types/node@^20.0.0 \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  tailwindcss@^3.3.0 \
  autoprefixer@^10.4.16 \
  postcss@^8.4.31 \
  clsx@^2.0.0 \
  lucide-react@^0.525.0 \
  framer-motion@^10.16.0 \
  @headlessui/react@^1.7.17 \
  @heroicons/react@^2.0.18

echo "✅ Dependencies installed"
echo "🏥 Starting Next.js development server on port 3032..."

# Start the Next.js development server
npx next dev -p 3032 