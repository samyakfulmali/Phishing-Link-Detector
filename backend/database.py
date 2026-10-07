"""
PhishGuard Database Layer
SQLite database connection and models for persistent threat intelligence,
scan logs, community phishing reports, and quiz certifications.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "phishguard.db")


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with dictionary rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if tables do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Scans Table - stores every scanned URL and forensic analysis
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        verdict TEXT NOT NULL,
        flags TEXT NOT NULL,         -- JSON array of strings
        breakdown TEXT NOT NULL,     -- JSON array/object of checklist
        defanged_url TEXT NOT NULL,
        dns_status TEXT,             -- Live DNS lookup verdict
        dns_records TEXT,            -- JSON object of resolved IPs, MX, NS
        client_ip TEXT,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Reported Phishing Table - crowdsourced & security team submissions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reported_threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        threat_type TEXT NOT NULL,
        reporter_name TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'Confirmed Phishing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Quiz & Certification Submissions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage REAL NOT NULL,
        certificate_id TEXT UNIQUE NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. Known Threat Intelligence Cache (High abuse domains, verified safe domains)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threat_cache (
        domain TEXT PRIMARY KEY,
        reputation TEXT NOT NULL,    -- 'MALICIOUS', 'SUSPICIOUS', 'VERIFIED_SAFE'
        category TEXT,
        notes TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed baseline threat reputation cache if empty
    cursor.execute("SELECT COUNT(*) FROM threat_cache")
    if cursor.fetchone()[0] == 0:
        known_threats = [
            ("paypal-security-update.xyz", "MALICIOUS", "Brand Impersonation", "Known credential harvester"),
            ("verify-appleid-support.top", "MALICIOUS", "Brand Impersonation", "Fake iCloud portal"),
            ("login-microsoft-secure.buzz", "MALICIOUS", "Credential Theft", "Spoofed Office 365"),
            ("steamcommunity-trade-gift.click", "MALICIOUS", "Steam Scam", "Session hijacker"),
            ("coinbase-wallet-rectify.loan", "MALICIOUS", "Crypto Drainer", "Fake seed phrase prompt"),
            ("google.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("paypal.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("apple.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("microsoft.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("amazon.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("chase.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
            ("github.com", "VERIFIED_SAFE", "Official Brand", "Verified apex domain"),
        ]
        cursor.executemany(
            "INSERT INTO threat_cache (domain, reputation, category, notes) VALUES (?, ?, ?, ?)",
            known_threats
        )

    conn.commit()
    conn.close()


# Database Access Functions

def save_scan(scan_data: Dict[str, Any]) -> int:
    """Inserts a new scan log into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO scans (
            url, domain, risk_score, risk_level, verdict,
            flags, breakdown, defanged_url, dns_status, dns_records, client_ip
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scan_data["url"],
        scan_data["domain"],
        scan_data["risk_score"],
        scan_data["risk_level"],
        scan_data["verdict"],
        json.dumps(scan_data.get("flags", [])),
        json.dumps(scan_data.get("breakdown", {})),
        scan_data.get("defanged_url", ""),
        scan_data.get("dns_status", "Unknown"),
        json.dumps(scan_data.get("dns_records", {})),
        scan_data.get("client_ip", "127.0.0.1")
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id


def get_recent_scans(limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieves recent scans ordered by timestamp descending."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, url, domain, risk_score, risk_level, verdict,
               flags, defanged_url, dns_status, scanned_at
        FROM scans
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    results = []
    for row in rows:
        item = dict(row)
        try:
            item["flags"] = json.loads(item["flags"])
        except Exception:
            item["flags"] = []
        results.append(item)
    conn.close()
    return results


def get_scan_by_id(scan_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single scan by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    item = dict(row)
    try:
        item["flags"] = json.loads(item["flags"])
    except Exception:
        item["flags"] = []
    try:
        item["breakdown"] = json.loads(item["breakdown"])
    except Exception:
        item["breakdown"] = {}
    try:
        item["dns_records"] = json.loads(item["dns_records"])
    except Exception:
        item["dns_records"] = {}
    conn.close()
    return item


def save_quiz_result(name: str, score: int, total: int, cert_id: str) -> int:
    """Saves a quiz completion certificate record."""
    pct = round((score / total) * 100, 1) if total > 0 else 0.0
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quiz_submissions (user_name, score, total_questions, percentage, certificate_id)
        VALUES (?, ?, ?, ?, ?)
    """, (name, score, total, pct, cert_id))
    sub_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return sub_id


def verify_certificate(cert_id: str) -> Optional[Dict[str, Any]]:
    """Checks validity of a certificate ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quiz_submissions WHERE certificate_id = ?", (cert_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def save_reported_threat(url: str, domain: str, threat_type: str, reporter: str, notes: str) -> int:
    """Saves a user or analyst reported malicious URL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reported_threats (url, domain, threat_type, reporter_name, notes)
        VALUES (?, ?, ?, ?, ?)
    """, (url, domain, threat_type, reporter, notes))
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return report_id


def get_reported_threats(limit: int = 50) -> List[Dict[str, Any]]:
    """Returns recent reported threats."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reported_threats ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_platform_stats() -> Dict[str, Any]:
    """Calculates summary statistics across the SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM scans WHERE risk_score >= 50")
    phishing_detected = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM scans WHERE risk_score < 25")
    safe_verified = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(risk_score) FROM scans")
    avg_score_row = cursor.fetchone()[0]
    avg_score = round(avg_score_row, 1) if avg_score_row is not None else 0.0

    cursor.execute("SELECT COUNT(*) FROM reported_threats")
    total_reports = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM quiz_submissions")
    certified_users = cursor.fetchone()[0]

    cursor.execute("""
        SELECT domain, COUNT(*) as scan_count, AVG(risk_score) as avg_risk
        FROM scans
        GROUP BY domain
        ORDER BY scan_count DESC
        LIMIT 5
    """)
    top_domains = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "total_scans": total_scans,
        "phishing_detected": phishing_detected,
        "safe_verified": safe_verified,
        "avg_risk_score": avg_score,
        "total_reports": total_reports,
        "certified_users": certified_users,
        "top_domains": top_domains
    }
