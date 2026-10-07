"""
PhishGuard Server Launcher
Boots the FastAPI backend + SQLite database + Frontend on http://localhost:5000
"""

import sys
import os

# Ensure current directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    import uvicorn
    print("============================================================")
    print("  [+] PhishGuard Full-Stack Server Starting...")
    print("  Frontend UI:    http://localhost:5000/")
    print("  REST API:       http://localhost:5000/api/health")
    print("  Swagger Docs:   http://localhost:5000/docs")
    print("  SQLite DB:      phishguard.db")
    print("============================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=5000, reload=True)
