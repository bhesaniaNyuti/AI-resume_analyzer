@echo off
echo Testing FastAPI connection...
echo.
timeout /t 3 /nobreak >nul
curl http://127.0.0.1:8000/docs
echo.
echo.
echo If you see HTML output above, the server is running!
echo If you see an error, the server might not be started yet.
pause

