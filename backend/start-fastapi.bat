@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    echo Please create a virtual environment first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

echo Starting FastAPI server on http://127.0.0.1:8000
echo Press Ctrl+C to stop the server
echo.

venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload

pause

