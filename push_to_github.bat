@echo off
echo ===================================================
echo   SCAB (SIH 2026) - Pushing to GitHub
echo   Repository: https://github.com/HKBHARGAV2005/SCAB.git
echo ===================================================
echo.
cd /d "%~dp0"
echo Checking git status...
git status
echo.
echo Pushing main branch to GitHub...
echo (If a browser window pops up, click 'Sign in with your browser')
echo.
git push -u origin main
echo.
echo ===================================================
if %ERRORLEVEL% equ 0 (
    echo   SUCCESS! All files and docs pushed to GitHub.
) else (
    echo   Push failed or canceled. Please check your GitHub credentials.
)
echo ===================================================
pause
