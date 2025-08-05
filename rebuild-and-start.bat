@echo off
echo Building React app...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build completed successfully!
cd ..\server

echo Starting server...
call npm start
