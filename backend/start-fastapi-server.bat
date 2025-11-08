@echo off
echo ========================================
echo Starting FastAPI Resume Analyzer Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found!
    echo.
    echo Please create a virtual environment first:
    echo   1. python -m venv venv
    echo   2. venv\Scripts\activate
    echo   3. pip install -r requirements.txt
    echo   4. python -m spacy download en_core_web_sm
    echo.
    pause
    exit /b 1
)

REM Check if app.py exists
if not exist "app.py" (
    echo [ERROR] app.py not found in backend directory!
    echo.
    pause
    exit /b 1
)

echo [INFO] Virtual environment found
echo [INFO] Starting server on http://127.0.0.1:8000
echo [INFO] API Docs will be available at http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Activate virtual environment and start server
call venv\Scripts\activate.bat
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload

pause

