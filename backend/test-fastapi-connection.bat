@echo off
echo Testing FastAPI server connection...
echo.

REM Test if server is running
curl -X GET http://127.0.0.1:8000/docs 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to FastAPI server at http://127.0.0.1:8000
    echo.
    echo Please ensure:
    echo   1. FastAPI server is running
    echo   2. Server is listening on port 8000
    echo   3. Firewall is not blocking the connection
    echo.
    echo To start the server, run: start-fastapi-server.bat
) else (
    echo [SUCCESS] Server is accessible!
)

echo.
echo Testing API endpoint...
curl -X OPTIONS http://127.0.0.1:8000/api/analyze-resume -H "Origin: http://localhost:5173" -v 2>&1 | findstr "HTTP"
echo.

pause

