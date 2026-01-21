#!/bin/bash

# AI Interview Prep App Startup Script
# Usage: ./start.sh

echo "🚀 Starting AI Interview Prep App..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv && ./venv/bin/pip install -r requirements.txt"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Copy .env.example to .env and add your API key"
fi

# Start the Flask app
echo "✅ Starting Flask server on http://localhost:5001"
echo ""
./venv/bin/python app.py
