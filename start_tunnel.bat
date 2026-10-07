@echo off
title PhishGuard Public Tunnel Launcher
echo ==========================================================
echo   Creating Instant Public HTTPS URL via Cloudflare...
echo ==========================================================
if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel --url http://localhost:5000
) else (
    echo cloudflared.exe not found in this folder.
)
pause
