@echo off
title iPad Escape Game Server
cd /d "%~dp0"
echo Demarrage du serveur...
echo.

REM Tuer les anciennes instances de node
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Lancement...
echo.
node server/server.js

echo.
echo === ERREUR: Le serveur s'est arrete ===
echo Code de sortie: %ERRORLEVEL%
echo.
pause
