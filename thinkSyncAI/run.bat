@echo off
echo Starting ThinkSync AI Recommendation Service...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    echo.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if requirements are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo .env file not found. Creating from example...
    copy .env.example .env
    echo Please edit .env and set your DATABASE_URL
    echo.
    pause
)

REM Start the service
echo Starting service...
python app.py

