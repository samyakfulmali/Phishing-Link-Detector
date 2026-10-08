"""
PhishGuard FastAPI Backend Application
Serves REST API endpoints for forensic URL analysis, persistent SQLite scan logs,
threat reporting, certificate verification, and static frontend assets.
"""

import os
import re
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from backend.database import (
    init_db, save_scan, get_recent_scans, get_scan_by_id,
    save_quiz_result, verify_certificate, save_reported_threat,
    get_reported_threats, get_platform_stats
)
from backend.scanner import analyze_url


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    print("[OK] PhishGuard SQLite Database Initialized & Connected.")
    yield


app = FastAPI(
    title="PhishGuard Threat Intelligence API",
    description="Full-stack AI & Heuristic Phishing Link Detection API with persistent SQLite database.",
    version="2.5.0",
    lifespan=lifespan
)

# Enable CORS for local and cross-origin usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Workspace Root for static frontend files
FRONTEND_DIR = os.path.dirname(os.path.dirname(__file__))


# Pydantic Request Models

class ScanRequest(BaseModel):
    url: str = Field(..., description="The URL to be analyzed")


class BulkScanRequest(BaseModel):
    text: str = Field(..., description="Email text or raw list of URLs to scan")


class ReportThreatRequest(BaseModel):
    url: str
    threat_type: str = "Credential Harvesting"
    reporter_name: str = "Anonymous Analyst"
    notes: Optional[str] = ""


class QuizSubmitRequest(BaseModel):
    user_name: str
    score: int
    total_questions: int
    certificate_id: str


# REST API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check endpoint for container / server monitoring."""
    return {
        "status": "healthy",
        "service": "PhishGuard Threat Defense API",
        "database": "SQLite (phishguard.db)",
        "version": "2.5.0"
    }


@app.post("/api/scan")
async def scan_url(payload: ScanRequest, request: Request):
    """
    Performs deep 10-point forensic heuristic inspection + live DNS lookup on a URL,
    and records the result in the SQLite database.
    """
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    client_ip = request.client.host if request.client else "127.0.0.1"

    # Analyze link through forensic engine
    analysis = analyze_url(payload.url)
    analysis["client_ip"] = client_ip

    # Persist scan result to SQLite database
    scan_id = save_scan(analysis)
    analysis["scan_id"] = scan_id

    return analysis


@app.get("/api/scans")
async def list_recent_scans(limit: int = 25):
    """Returns the most recent scan records stored in SQLite."""
    scans = get_recent_scans(limit=limit)
    return {"count": len(scans), "scans": scans}


@app.get("/api/scans/{scan_id}")
async def get_scan_details(scan_id: int):
    """Retrieves full forensic details for a specific scan ID."""
    scan = get_scan_by_id(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return scan


@app.post("/api/scan/bulk")
async def bulk_scan_urls(payload: BulkScanRequest, request: Request):
    """
    Extracts all links from email or text body, analyzes each, and records them in SQLite.
    """
    text = payload.text or ""
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+', re.IGNORECASE)
    matches = url_pattern.findall(text)
    unique_urls = list(dict.fromkeys(matches))

    if not unique_urls:
        return {
            "total_extracted": 0,
            "results": [],
            "stats": {"safe": 0, "suspicious": 0, "phishing": 0}
        }

    client_ip = request.client.host if request.client else "127.0.0.1"
    results = []
    stats = {"safe": 0, "caution": 0, "suspicious": 0, "phishing": 0}

    for url in unique_urls[:50]:  # Cap at 50 per bulk batch
        res = analyze_url(url)
        res["client_ip"] = client_ip
        scan_id = save_scan(res)
        res["scan_id"] = scan_id

        score = res["risk_score"]
        if score >= 75:
            stats["phishing"] += 1
        elif score >= 50:
            stats["suspicious"] += 1
        elif score >= 25:
            stats["caution"] += 1
        else:
            stats["safe"] += 1

        results.append(res)

    return {
        "total_extracted": len(unique_urls),
        "total_analyzed": len(results),
        "stats": stats,
        "results": results
    }


@app.get("/api/stats")
async def platform_stats():
    """Returns real-time database summary statistics."""
    return get_platform_stats()


@app.post("/api/reports/submit")
async def submit_threat_report(payload: ReportThreatRequest):
    """Allows users to submit confirmed or suspicious links to the database."""
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    analysis = analyze_url(payload.url)
    report_id = save_reported_threat(
        url=payload.url,
        domain=analysis["domain"],
        threat_type=payload.threat_type,
        reporter=payload.reporter_name,
        notes=payload.notes or ""
    )
    return {
        "success": True,
        "report_id": report_id,
        "message": f"Threat '{analysis['domain']}' successfully reported to PhishGuard database."
    }


@app.get("/api/reports")
async def list_reported_threats(limit: int = 50):
    """Retrieves community/analyst reported threats."""
    reports = get_reported_threats(limit=limit)
    return {"count": len(reports), "reports": reports}


@app.post("/api/quiz/submit")
async def submit_quiz(payload: QuizSubmitRequest):
    """Stores quiz completion and issues verified certificate."""
    sub_id = save_quiz_result(
        name=payload.user_name,
        score=payload.score,
        total=payload.total_questions,
        cert_id=payload.certificate_id
    )
    return {
        "success": True,
        "submission_id": sub_id,
        "certificate_id": payload.certificate_id,
        "verified_url": f"/api/quiz/certificate/{payload.certificate_id}"
    }


@app.get("/api/quiz/certificate/{cert_id}")
async def get_certificate(cert_id: str):
    """Verifies authenticity of a student/employee security certificate."""
    cert = verify_certificate(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate ID not found or unverified")
    return {"verified": True, "certificate": cert}


# Serve Static & SEO / Verification Files

@app.get("/google17f984687990ba34.html")
async def serve_google_verify():
    file_path = os.path.join(FRONTEND_DIR, "google17f984687990ba34.html")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    return "google-site-verification: google17f984687990ba34.html"


@app.get("/robots.txt")
async def serve_robots():
    return FileResponse(os.path.join(FRONTEND_DIR, "robots.txt"), media_type="text/plain")


@app.get("/sitemap.xml")
async def serve_sitemap():
    return FileResponse(os.path.join(FRONTEND_DIR, "sitemap.xml"), media_type="application/xml")


@app.get("/")
async def serve_index():
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    return FileResponse(index_file)


# Mount static files for css, js, icons, etc.
app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="static")
