#!/bin/bash
# Clear all Next.js cache and restart dev server

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🧹 Clearing node_modules/.cache..."
rm -rf node_modules/.cache

echo "🧹 Clearing Turbopack cache..."
rm -rf .next/cache

echo "✅ Cache cleared!"
echo ""
echo "To restart dev server, run:"
echo "npm run dev -- --port 3001"
