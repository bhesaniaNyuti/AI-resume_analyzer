@echo off
echo ========================================
echo FastAPI Server Status Check
echo ========================================
echo.

echo Testing server connection...
echo.

REM Test health endpoint
echo [1] Testing health endpoint...
curl -s http://127.0.0.1:8000/health 2>nul
if %errorlevel% equ 0 (
    echo [OK] Health endpoint is accessible
) else (
    echo [ERROR] Cannot connect to health endpoint
    echo         Server may not be running
)
echo.

REM Test root endpoint
echo [2] Testing root endpoint...
curl -s http://127.0.0.1:8000/ 2>nul
if %errorlevel% equ 0 (
    echo [OK] Root endpoint is accessible
) else (
    echo [ERROR] Cannot connect to root endpoint
)
echo.

REM Test docs endpoint
echo [3] Testing docs endpoint...
curl -s -o nul -w "%%{http_code}" http://127.0.0.1:8000/docs 2>nul
if %errorlevel% equ 0 (
    echo [OK] Docs endpoint is accessible
    echo       Open http://127.0.0.1:8000/docs in your browser
) else (
    echo [ERROR] Cannot connect to docs endpoint
)
echo.

REM Check if port is in use
echo [4] Checking if port 8000 is in use...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [INFO] Port 8000 is in use
    netstat -ano | findstr :8000
) else (
    echo [WARNING] Port 8000 is not in use
    echo           Server is not running
)
echo.

echo ========================================
echo Status Check Complete
echo ========================================
echo.
echo If server is not running, start it with:
echo   start-fastapi-server.bat
echo.
pause

