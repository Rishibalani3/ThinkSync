#!/bin/bash

echo "Starting ThinkSync AI Recommendation Service..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
source venv/bin/activate

# Check if requirements are installed
python -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ".env file not found. Creating from example..."
    cp .env.example .env
    echo "Please edit .env and set your DATABASE_URL"
    echo ""
    read -p "Press enter to continue..."
fi

# Start the service
echo "Starting service..."
python app.py

