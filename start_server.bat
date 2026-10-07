@echo off
title PhishGuard Full-Stack Server
echo ==========================================================
echo   Starting PhishGuard FastAPI Server + SQLite Database...
echo   URL: http://localhost:5000/
echo   API Docs: http://localhost:5000/docs
echo ==========================================================
if exist "%~dp0.venv\Scripts\python.exe" (
    "%~dp0.venv\Scripts\python.exe" "%~dp0run_server.py"
) else (
    echo [.venv not found, falling back to PowerShell web server]
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 5000
)
pause
