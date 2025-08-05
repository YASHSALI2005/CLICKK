@echo off
echo Building React client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Starting server...
cd ../server
call npm start
