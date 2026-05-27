#!/usr/bin/env bash
# exit on error
set -o errexit

# Install frontend dependencies and build
echo "Installing Node dependencies..."
npm install

echo "Building frontend..."
npm run build

# Install backend dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Initialize the SQLite database
echo "Initializing SQLite database..."
python init_db.py
