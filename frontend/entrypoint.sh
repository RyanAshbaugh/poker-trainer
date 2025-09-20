#!/bin/bash
set -euo pipefail

echo "Container user: $(whoami) uid=$(id -u) gid=$(id -g)"

cd /app

if [ ! -f "package.json" ]; then
  echo "Installing dependencies (first run)..."
  npm init -y >/dev/null 2>&1 || true
fi

if [ ! -d "node_modules" ]; then
  echo "Installing node_modules..."
  npm install
fi

echo "Starting Next.js dev server..."
npm run dev

