@echo off
echo ===================================================
echo   Starting SCAB Mobile App (SIH 2026)
echo ===================================================
echo.
cd /d "%~dp0"
echo Opening app on http://localhost:5173/ ...
start http://localhost:5173/
npm run dev
pause
