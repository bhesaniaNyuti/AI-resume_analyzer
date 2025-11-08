@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    pause
    exit /b 1
)

start "FastAPI Server" cmd /k "venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

