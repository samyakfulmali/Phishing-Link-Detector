# PhishGuard: Advanced Phishing Link Detector & Cyber Defense Platform

> **A State-of-the-Art, Real-Time In-Browser Phishing Link Detector and Cybersecurity Defense Suite**

[![Security Analysis](https://img.shields.io/badge/Domain-Phishing%20Link%20Detection-06b6d4.svg)](#)
[![Security Analysis](https://img.shields.io/badge/Domain-Phishing%20Link%20Detection-06b6d4.svg)](#)
[![Full-Stack Architecture](https://img.shields.io/badge/Stack-FastAPI%20%7C%20SQLite%20%7C%20HTML5%20%7C%20JS-8b5cf6.svg)](#)
[![Threat Engine](https://img.shields.io/badge/Engine-Deep%20Heuristics%20v2.5%20%2B%20DNS%20Intel-10b981.svg)](#)
[![Database](https://img.shields.io/badge/Database-SQLite%20(phishguard.db)-f59e0b.svg)](#)
[![Status](https://img.shields.io/badge/Status-Complete%20%26%20Production%20Ready-success.svg)](#)

---

## 📖 Project Overview

Phishing and malicious link distribution account for over **90% of unauthorized data breaches and digital fraud** worldwide. Today's cybercriminals deploy sophisticated deception techniques—ranging from subdomain stuffing and lookalike homograph (Punycode) characters to concealed URL shorteners and HTTP Basic Authentication tricks—designed to bypass automated email gateways and deceive human eyes.

**PhishGuard** is an advanced, high-performance, full-stack **Phishing Link Detector and Cyber Defense Platform**. Built with **Python 3.12 (FastAPI), SQLite, and modern HTML5/CSS3/JavaScript**, it delivers:
- **Instant forensic heuristic link analysis & threat scoring** (0–100%)
- **Live DNS threat intelligence resolution** (via `dnspython` checking A-records, MX records, and NXDOMAIN dead traps)
- **Persistent SQLite threat database** (`phishguard.db`) storing all scans, community reports, and certificates
- **Interactive OpenAPI / Swagger Documentation** at `http://localhost:5000/docs`
- **Bulk email text link extraction & CSV export**
- **QR code quishing inspection & safe link defanging**
- **Official verified certification generator with cryptographic database lookup**
- **Graceful client-side fallback** if run without a server

---

## 🚀 How to Launch the Full-Stack Platform

### Option 1: One-Click Launch (Recommended)
Double-click **`start_server.bat`** in the project folder.
It automatically activates the virtual environment and starts the FastAPI server + SQLite database at:
* **Frontend Application:** `http://localhost:5000/`
* **Swagger API Documentation:** `http://localhost:5000/docs`
* **Health Check & Telemetry:** `http://localhost:5000/api/health`

### Option 2: Command Line (PowerShell)
```powershell
# Run using the configured virtual environment
.\.venv\Scripts\python.exe run_server.py
```

### Option 3: Standalone In-Browser Mode (Zero Setup)
Double-click `index.html`. The app gracefully runs in standalone mode using its client-side JavaScript heuristic engine with zero server requirements.

---

## 📂 Project Structure

```
d:\Phishing-Link-Detector\
│
├── backend/
│   ├── __init__.py          # Backend package marker
│   ├── database.py          # SQLite schema, tables (scans, reports, certs), and CRUD queries
│   ├── scanner.py           # 10-point heuristic rule engine, brand database, & live DNS resolver
│   └── main.py              # FastAPI application, REST endpoints (/api/scan, /api/stats), & static files
│
├── .venv/                   # Python 3.12 virtual environment (FastAPI, uvicorn, dnspython, sqlite)
├── phishguard.db            # Persistent local SQLite database
├── requirements.txt         # Pinned Python package dependencies
├── run_server.py            # Universal server runner script
├── start_server.bat         # 1-click batch launcher for Windows
├── serve.ps1                # Lightweight PowerShell fallback HTTP server
│
├── index.html               # Main single-page application UI with 4 detector modes & 9 EDU modules
├── style.css                # Futuristic cyber styling, glassmorphism, radar effects, gauge, & print CSS
├── app.js                   # Client-side controller, real-time API client, audio cues, & canvas certs
├── PROJECT_REPORT.md        # Academic and technical report
└── README.md                # Project documentation & user guide
```
### 1. 🔍 Single URL Heuristic Link Inspector
- **Instant Heuristic Threat Scoring (0–100%)**: Calculates a multi-factor risk score powered by deterministic weighted security rules.
- **Radial SVG Threat Meter**: Visual animated circular gauge reflecting real-time threat probability with color-shifting statuses:
  - `🟢 SAFE / LEGITIMATE` (0–24%)
  - `🔵 LOW RISK / CAUTION` (25–49%)
  - `🟡 SUSPICIOUS` (50–74%)
  - `🔴 DANGEROUS PHISHING LINK` (75–100%)
- **Comprehensive 10-Point Forensic Checklist**:
  1. **Transport Encryption (SSL/TLS)**: Evaluates HTTP vs HTTPS and flags dangerous non-standard web ports (`:8080`, `:8443`, `:8000`, `:2082`, `:3000`).
  2. **Host Identity (Domain vs IP)**: Catches raw IPv4/IPv6 addresses used as hosts.
  3. **Brand Impersonation & Typosquatting**: Checks against a database of 30+ heavily targeted institutions (PayPal, Google, Microsoft, Apple, Amazon, Chase, Wells Fargo, USPS, DHL, Steam, Coinbase, Binance, etc.) detecting brand names in subdomains or paths when the root domain is unauthorized.
  4. **Homograph & Punycode Character Cloaking**: Detects `xn--` prefix and Cyrillic/Greek lookalike characters (e.g., Cyrillic 'а' replacing Latin 'a').
  5. **Top-Level Domain (TLD) Reputation**: Audits against 50+ high-abuse disposable extensions (`.xyz`, `.top`, `.tk`, `.buzz`, `.work`, `.click`, `.loan`, `.fit`, `.surf`).
  6. **Subdomain Depth & Stuffing**: Flags 3+ nested subdomains used to push the real base domain offscreen on mobile devices.
  7. **Credential Harvesting Action Triggers**: Identifies sensitive action keywords (`login`, `signin`, `verify`, `account`, `banking`, `password`, `wallet`, `2fa`, `otp`).
  8. **Executable Dropper & Payload Extensions**: Flags direct file download traps (`.exe`, `.scr`, `.bat`, `.apk`, `.jar`, `.iso`, `.zip`).
  9. **Concealed Destination / URL Shorteners**: Warns when services like `bit.ly`, `tinyurl.com`, `t.co`, or `cutt.ly` mask the destination server.
  10. **Obfuscation & Basic Auth Exploits**: Detects `@` authority delimiters, double-slash redirects (`//`), and pre-populated victim email harvesting parameters in query strings.
- **Interactive URL Component Deconstruction**:
  - Color-coded interactive pills: `[Protocol]`, `[Subdomain]`, `[Root Domain]`, `[Port]`, `[Path]`, and `[Query String]`.
  - Click any pill to inspect its role and understand why scammers manipulate that specific component.
- **Safe Defanged URL Generator**:
  - Converts active links into safe SOC sharing strings (e.g. `hxxps[://]paypal[.]com[.]fake[.]xyz/verify`) with 1-click clipboard copy.
- **Forensic Exporting**:
  - Download complete structured **JSON Threat Reports**.
  - 1-Click copy formatted **Incident Summary** for ticketing and reporting.

### 2. 📑 Bulk & Email Text Scanner
- Paste entire suspicious emails, SMS messages, or a batch of URLs.
- Automatically extracts all embedded links using regex.
- Runs parallel heuristic analysis on every link.
- Displays dynamic tally statistics (Total Links, Phishing Traps, Suspicious, Safe).
- Generates an interactive, searchable results table with domain breakdown and **Export to CSV**.

### 3. 📷 QR Code (Quishing) Scanner
- Detects the emerging threat of **Quishing** (QR Code Phishing) on campus flyers, parking meters, and deceptive mailers.
- Drag & drop or upload QR images, or paste directly from clipboard (Ctrl+V).
- Leverages native `BarcodeDetector` API and image canvas decoding.
- Automatically routes the decoded URL directly into the heuristic link inspector.

### 4. 🔬 Phishing URL Anatomy Interactive Guide
- Visual breakdown of the 4 most common URL deception techniques:
  - Subdomain Stuffing (`legit-brand.com.attacker-domain.xyz`)
  - Homograph & Lookalike Domains (`pаypal.com` with Cyrillic characters)
  - HTTP Basic Auth Redirection (`https://google.com@evil-phish.net/login`)
  - Disposable High-Abuse TLDs (`.top`, `.xyz`, `.buzz`)

### 5. 🛡️ Complete Educational & Defensive Suite
- **Module 01: Introduction** — What phishing is and why students and schools are prime targets.
- **Module 02: How Phishing Works** — The 5-stage lifecycle and social engineering psychological triggers.
- **Module 03: Attack Typology** — Mass email, spear phishing, smishing, vishing, clone phishing, and social media DMs.
- **Module 04: Warning Signs & Red Flags** — 7 essential forensic indicators.
- **Module 05: Safe Phishing Simulator Lab** — 4 interactive simulated attack scenarios with "Reveal Red Flags" forensic callouts.
- **Module 06: Legitimate vs. Phishing Comparison Matrix** — 8-dimension comparative forensic audit.
- **Module 07: Standard Operating Procedures** — Incident checklists for suspicious messages and accidental clicks.
- **Module 08: 10-Question Gamified Quiz & Certificate** — Realistic multi-scenario MCQs with instant feedback and HTML5 Canvas **Certificate of Proficiency** generator.
- **Module 09: Awareness Poster** — High-impact, printable poster with memorable cybersecurity slogans and print-optimized CSS.

---

## 🚀 How to Launch the Project

No web servers, Node.js, Python, or npm installations are required! The platform runs entirely client-side in any modern web browser.

### Option 1: Direct File Launch
Double-click `index.html` or open it with Google Chrome, Microsoft Edge, Mozilla Firefox, or Brave.

### Option 2: Command Line (PowerShell / Windows)
```powershell
# Open directly in default web browser
Start-Process "d:\Cybersecurity\index.html"
```

---

## 📂 Project Structure

```
d:\Cybersecurity\
│
├── index.html           # Main single-page application with Phishing Link Detector & EDU suite
├── style.css            # Futuristic cyber styling, glassmorphism, radar effects, gauge, & print CSS
├── app.js               # PhishDetectorEngine, bulk scanner, QR decoder, audio, quiz, & cert canvas
├── PROJECT_REPORT.md    # Comprehensive academic & technical report documenting the detector
└── README.md            # Project documentation & user guide
```

---

## 🎯 Educational Slogans Included

- 🧠 **“Think Before You Click.”**
- 🛑 **“Stop. Check. Then Click.”**
- 🔐 **“Never Share Your OTP or Password.”**
- 📞 **“When in Doubt, Verify.”**

---

## 👨‍🏫 Student & Class Presentation Guide

1. **Live Scanner Hook (1 Min)**:
   - Open the website and click the preset **“🔴 Fake PayPal (.xyz)”** or **“🔴 Raw IP & Port (:8080)”**.
   - Show how the gauge swings to high risk, highlights brand impersonation, breaks down URL tokens, and defangs the link.
2. **Bulk Email Scan Demo (1.5 Mins)**:
   - Click the **“Bulk & Email Text”** tab, click **“Load Sample Phishing Email”**, and click **“Extract & Scan All Links”**.
   - Show how the scanner automatically parses safe links from deceptive phishing traps.
3. **QR Quishing Demo (1 Min)**:
   - Click the **“QR Code (Quishing)”** tab and click **“Test Sample Quishing QR Payload”**. Explain how physical QR codes disguise phishing traps.
4. **Phishing Lab & Quiz (2 Mins)**:
   - Demonstrate the **Phishing Lab** with fake email and Google Docs login clones.
   - Take the **Interactive Quiz** and generate your personalized **Certificate of Proficiency**.
