"""
PhishGuard Full-Stack FastAPI Entrypoint
Discovered by Vercel's FastAPI framework runner and local uvicorn servers.
"""

import os
import sys

# Ensure root directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
