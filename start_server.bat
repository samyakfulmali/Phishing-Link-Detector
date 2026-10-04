@echo off
title PhishGuard Web Server
echo Starting PhishGuard Web Server on http://localhost:5000...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 5000
pause
