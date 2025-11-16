@echo off
cd /d "E:\AI-resume_analyzer\backend"
start "FastAPI Server" cmd /k "venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

