"""
Vercel Serverless Function Entrypoint
Routes all API requests directly into the FastAPI application.
"""

import os
import sys

# Ensure workspace root is at the head of sys.path for backend package imports
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app

# Vercel's ASGI serverless runtime discovers and exposes `app`
