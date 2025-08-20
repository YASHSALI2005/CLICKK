@echo off
echo Starting CLICK Development Server...
echo.

REM Start the backend server
echo Starting backend server on port 5001...
cd /d "%~dp0\server"
start "CLICK Backend" cmd /k "npm start"

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

REM Start the frontend client (React will use port 3001)
echo Starting frontend client on port 3001...
cd /d "%~dp0\client"
start "CLICK Frontend" cmd /k "npm start"

echo.
echo CLICK is starting up...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause
