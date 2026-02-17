#!/bin/bash

# Mantle SEO Writer - Development Environment Setup Script
# This script initializes the development environment for the SEO content creation tool

set -e  # Exit on error

echo "🌱 Mantle SEO Writer - Development Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
echo "📋 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "⚠️  package.json not found. Initializing new Vite + React + TypeScript project..."
    npm create vite@latest . -- --template react-ts
    echo "✅ Project initialized"
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi
echo ""

# Install Tailwind CSS and dependencies
echo "🎨 Setting up Tailwind CSS..."
if ! grep -q "tailwindcss" package.json 2>/dev/null; then
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    echo "✅ Tailwind CSS installed"
else
    echo "✅ Tailwind CSS already installed"
fi
echo ""

# Build and start the development server
echo "🚀 Starting development server..."
echo ""
echo "=========================================="
echo "✨ Setup complete!"
echo ""
echo "The development server will start on:"
echo "  → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

# Start the dev server
npm run dev
