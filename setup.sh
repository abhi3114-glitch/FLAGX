#!/bin/bash

echo " Feature Flag Management System - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo " Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo " Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo " npm is not installed."
    exit 1
fi

echo " npm version: $(npm --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "  PostgreSQL CLI not found. Make sure PostgreSQL is installed and running."
else
    echo " PostgreSQL is available"
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "  Redis CLI not found. Make sure Redis is installed and running."
else
    echo " Redis is available"
fi

echo ""
echo " Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo " Failed to install dependencies"
    exit 1
fi

echo " Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo " Creating .env file..."
    cp .env.example .env
    echo " .env file created. Please update it with your configuration."
else
    echo "ℹ  .env file already exists"
fi

echo ""
echo "  Database Setup"
echo "=================="
echo "Please run the following commands to set up PostgreSQL:"
echo ""
echo "  createdb feature_flags"
echo "  OR"
echo "  psql -U postgres -c 'CREATE DATABASE feature_flags;'"
echo ""
echo "The database tables will be created automatically when you start the backend."
echo ""

# Check if Python is installed (for Python SDK)
if command -v python3 &> /dev/null; then
    echo " Python SDK Setup (Optional)"
    echo "=============================="
    echo "Python version: $(python3 --version)"
    echo ""
    echo "To install Python SDK dependencies:"
    echo "  cd python-sdk"
    echo "  pip install -r requirements.txt"
    echo "  pip install -e ."
    echo ""
fi

echo " Setup Complete!"
echo ""
echo " To start the application:"
echo "================================"
echo ""
echo "Option 1 - Start everything together:"
echo "  npm run dev"
echo ""
echo "Option 2 - Start separately:"
echo "  Terminal 1: npm run start:backend"
echo "  Terminal 2: npm run start:frontend"
echo ""
echo "Option 3 - Using Docker:"
echo "  docker-compose up"
echo ""
echo " Access Points:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001/api"
echo "  WebSocket: ws://localhost:3001/ws"
echo "  gRPC:      localhost:50051"
echo ""
echo " Make sure PostgreSQL and Redis are running before starting!"
echo ""