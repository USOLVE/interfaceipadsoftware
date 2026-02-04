@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   Interface iPad - Escape Game                 ║
echo ║   Démarrage du serveur...                      ║
echo ╚════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [✓] Vérification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Node.js n'est pas installé !
    echo     Téléchargez-le sur https://nodejs.org
    pause
    exit /b 1
)

echo [✓] Node.js détecté :
node --version
echo.

echo [✓] Démarrage du serveur...
echo.
echo ────────────────────────────────────────────────
echo.

start "" http://localhost:3000

npm start

pause
