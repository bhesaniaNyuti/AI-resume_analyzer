@echo off
cd /d "%~dp0"
echo Starting FastAPI server...
echo.
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo Virtual environment not found!
    echo Please create a virtual environment first:
    echo python -m venv venv
    echo venv\Scripts\activate
    echo pip install -r requirements.txt
    pause
)

