"""
PhishGuard Advanced Heuristic & Threat Intelligence Scanner
Implements deep URL deconstruction, 10-point forensic heuristic rules,
brand impersonation detection, and live DNS resolution.
"""

import re
import socket
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List
import dns.resolver

# High-abuse disposable Top-Level Domains (TLDs)
HIGH_RISK_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "click", "loan",
    "work", "fit", "surf", "rest", "party", "gdn", "date", "racing",
    "country", "stream", "bid", "men", "win", "icu", "cam", "monster",
    "sbs", "beauty", "hair", "skin", "quest", "cyou", "vip", "cfd"
}

# Known URL shortener domains used to conceal destination servers
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "ow.ly",
    "buff.ly", "rb.gy", "shorturl.at", "bl.ink", "tiny.cc", "soo.gd"
}

# Monitored institutional brands & authorized apex domains
BRAND_DATABASE = [
    {"name": "PayPal", "domain": "paypal.com", "keywords": ["paypal", "pay-pal"]},
    {"name": "Google", "domain": "google.com", "keywords": ["google", "gmail", "googledrive"]},
    {"name": "Microsoft", "domain": "microsoft.com", "keywords": ["microsoft", "office365", "outlook", "onedrive", "live"]},
    {"name": "Apple", "domain": "apple.com", "keywords": ["apple", "icloud", "appleid"]},
    {"name": "Amazon", "domain": "amazon.com", "keywords": ["amazon", "primevideo"]},
    {"name": "Chase Bank", "domain": "chase.com", "keywords": ["chase", "chasebank"]},
    {"name": "Wells Fargo", "domain": "wellsfargo.com", "keywords": ["wellsfargo"]},
    {"name": "Bank of America", "domain": "bankofamerica.com", "keywords": ["bankofamerica", "bofa"]},
    {"name": "Netflix", "domain": "netflix.com", "keywords": ["netflix"]},
    {"name": "Facebook", "domain": "facebook.com", "keywords": ["facebook", "fb", "meta"]},
    {"name": "Instagram", "domain": "instagram.com", "keywords": ["instagram"]},
    {"name": "WhatsApp", "domain": "whatsapp.com", "keywords": ["whatsapp"]},
    {"name": "USPS", "domain": "usps.com", "keywords": ["usps", "postalservice"]},
    {"name": "DHL", "domain": "dhl.com", "keywords": ["dhl", "dhlexpress"]},
    {"name": "FedEx", "domain": "fedex.com", "keywords": ["fedex"]},
    {"name": "Steam", "domain": "steampowered.com", "keywords": ["steam", "steampowered", "steamcommunity"]},
    {"name": "Coinbase", "domain": "coinbase.com", "keywords": ["coinbase"]},
    {"name": "Binance", "domain": "binance.com", "keywords": ["binance"]},
    {"name": "MetaMask", "domain": "metamask.io", "keywords": ["metamask"]},
    {"name": "Dropbox", "domain": "dropbox.com", "keywords": ["dropbox"]},
    {"name": "Adobe", "domain": "adobe.com", "keywords": ["adobe", "acrobat"]},
    {"name": "LinkedIn", "domain": "linkedin.com", "keywords": ["linkedin"]},
    {"name": "Yahoo", "domain": "yahoo.com", "keywords": ["yahoo", "yahoomail"]}
]

# Sensitive action words often present in phishing paths/queries
HARVEST_KEYWORDS = [
    "login", "signin", "sign-in", "log-in", "verify", "verification",
    "account", "banking", "authenticate", "secure", "update", "password",
    "credential", "wallet", "recovery", "2fa", "otp", "confirm", "billing"
]

# Dangerous file dropper extensions
DANGEROUS_EXTENSIONS = [
    ".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".ps1", ".jar",
    ".apk", ".iso", ".img", ".zip", ".tar", ".rar", ".7z", ".msi"
]


def defang_url(url: str) -> str:
    """Safely defangs a URL to prevent accidental click execution in tickets."""
    s = url.replace("https://", "hxxps[://]").replace("http://", "hxxp[://]")
    s = s.replace(".", "[.]")
    return s


def resolve_dns(domain: str) -> Dict[str, Any]:
    """
    Performs live DNS resolution for A records and MX records.
    Returns status and detected IPs/mail servers.
    """
    # Clean domain of port or auth info
    host = domain.split(":")[0].strip()
    
    # Check if host is raw IP address
    ip_pattern = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")
    if ip_pattern.match(host):
        return {
            "status": "IP Host (No DNS Name)",
            "ips": [host],
            "mx": [],
            "live": True
        }

    resolver = dns.resolver.Resolver()
    resolver.timeout = 2.0
    resolver.lifetime = 2.0

    dns_info = {
        "status": "Unresolved",
        "ips": [],
        "mx": [],
        "live": False
    }

    try:
        answers = resolver.resolve(host, "A")
        ips = [str(rdata) for rdata in answers]
        dns_info["ips"] = ips
        dns_info["live"] = True
        dns_info["status"] = "Active Domain (Resolved)"
    except dns.resolver.NXDOMAIN:
        dns_info["status"] = "NXDOMAIN (Domain Does Not Exist / Dead Phish)"
        dns_info["live"] = False
        return dns_info
    except (dns.resolver.NoAnswer, dns.resolver.Timeout, dns.resolver.NoNameservers, Exception) as e:
        dns_info["status"] = f"Lookup Failed ({type(e).__name__})"

    # Optional MX check for bank/institution lookalikes
    try:
        mx_answers = resolver.resolve(host, "MX")
        dns_info["mx"] = [str(r.exchange) for r in mx_answers][:3]
    except Exception:
        pass

    return dns_info


def analyze_url(raw_url: str) -> Dict[str, Any]:
    """
    Deep 10-point forensic link analysis.
    Returns calculated threat score, risk tier, breakdown checklist, and flags.
    """
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "http://" + url

    try:
        parsed = urlparse(url)
    except Exception:
        parsed = urlparse("http://invalid-url")

    protocol = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()

    # Extract hostname & port
    port = parsed.port
    host = parsed.hostname or netloc

    # Base domain parts
    domain_parts = host.split(".") if host else []
    tld = domain_parts[-1] if len(domain_parts) > 1 else ""
    root_domain = ".".join(domain_parts[-2:]) if len(domain_parts) >= 2 else host
    subdomain = ".".join(domain_parts[:-2]) if len(domain_parts) > 2 else ""

    score = 0
    flags = []
    checklist = []

    # 1. Transport Encryption & Non-standard Port
    has_https = protocol == "https"
    dangerous_ports = [8080, 8443, 8000, 2082, 3000, 8888, 9000]
    is_dangerous_port = port in dangerous_ports

    if not has_https:
        score += 25
        flags.append("Insecure HTTP Protocol (No TLS Encryption)")
        checklist.append({"rule": "Transport Encryption", "pass": False, "detail": "Lacks SSL/TLS encryption; credentials sent in cleartext"})
    elif is_dangerous_port:
        score += 20
        flags.append(f"Suspicious Web Port (:{port})")
        checklist.append({"rule": "Transport Encryption", "pass": False, "detail": f"Using atypical web port :{port}"})
    else:
        checklist.append({"rule": "Transport Encryption", "pass": True, "detail": "Valid HTTPS transport with standard port"})

    # 2. Host Identity (IP Address vs Domain Name)
    is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host))
    if is_ip:
        score += 35
        flags.append("Host is Raw IP Address (Bypasses Domain Registration)")
        checklist.append({"rule": "Host Identity", "pass": False, "detail": f"Raw IPv4 host: {host}"})
    else:
        checklist.append({"rule": "Host Identity", "pass": True, "detail": f"Registered domain name: {host}"})

    # 3. Brand Impersonation & Typosquatting Check
    brand_impersonated = None
    for brand in BRAND_DATABASE:
        for kw in brand["keywords"]:
            if kw in host and root_domain != brand["domain"]:
                brand_impersonated = brand["name"]
                score += 45
                flags.append(f"Brand Impersonation Detected: Spoofing '{brand['name']}' on unauthorized domain '{root_domain}'")
                break
        if brand_impersonated:
            break

    if brand_impersonated:
        checklist.append({"rule": "Brand Integrity", "pass": False, "detail": f"Spoofing {brand_impersonated} on {root_domain}"})
    else:
        checklist.append({"rule": "Brand Integrity", "pass": True, "detail": "No unauthorized brand spoofing detected in host"})

    # 4. Homograph & Punycode Character Cloaking
    is_punycode = host.startswith("xn--") or ".xn--" in host
    has_non_ascii = any(ord(c) > 127 for c in host)
    if is_punycode or has_non_ascii:
        score += 35
        flags.append("Homograph / Punycode Deception Detected (Non-standard or Cyrillic characters)")
        checklist.append({"rule": "Homograph Cloaking", "pass": False, "detail": "Domain uses Punycode/IDN character substitution"})
    else:
        checklist.append({"rule": "Homograph Cloaking", "pass": True, "detail": "Clean ASCII domain encoding"})

    # 5. Top-Level Domain (TLD) Reputation
    if tld in HIGH_RISK_TLDS:
        score += 25
        flags.append(f"High-Abuse Disposable TLD (.{tld})")
        checklist.append({"rule": "TLD Reputation", "pass": False, "detail": f".{tld} is frequently associated with disposable phishing campaigns"})
    else:
        checklist.append({"rule": "TLD Reputation", "pass": True, "detail": f"Standard TLD reputation (.{tld})"})

    # 6. Subdomain Depth & Stuffing
    subdomain_count = len(domain_parts) - 2 if len(domain_parts) > 2 else 0
    if subdomain_count >= 3:
        score += 25
        flags.append(f"Excessive Subdomain Stuffing ({subdomain_count} levels deep)")
        checklist.append({"rule": "Subdomain Depth", "pass": False, "detail": f"Deeply nested subdomains ({subdomain}) hide base domain"})
    else:
        checklist.append({"rule": "Subdomain Depth", "pass": True, "detail": f"Normal subdomain hierarchy ({subdomain_count} levels)"})

    # 7. Credential Harvesting Action Triggers
    found_keywords = [kw for kw in HARVEST_KEYWORDS if kw in path or kw in query]
    if found_keywords:
        score += 20
        flags.append(f"Credential Harvesting Keywords: {', '.join(found_keywords[:3])}")
        checklist.append({"rule": "Credential Harvesting", "pass": False, "detail": f"Keywords present in path: {', '.join(found_keywords)}"})
    else:
        checklist.append({"rule": "Credential Harvesting", "pass": True, "detail": "No suspicious harvesting action triggers found"})

    # 8. Executable Dropper & Payload Extensions
    has_dangerous_ext = any(path.endswith(ext) for ext in DANGEROUS_EXTENSIONS)
    if has_dangerous_ext:
        score += 40
        flags.append("Direct Executable Dropper Extension Detected")
        checklist.append({"rule": "Malware Dropper", "pass": False, "detail": "URL terminates in dangerous executable/script extension"})
    else:
        checklist.append({"rule": "Malware Dropper", "pass": True, "detail": "No dangerous file payload extensions in path"})

    # 9. URL Shortener Cloaking
    is_shortener = host in URL_SHORTENERS
    if is_shortener:
        score += 20
        flags.append("Concealed Destination (URL Shortener Cloaking)")
        checklist.append({"rule": "Destination Transparency", "pass": False, "detail": f"Shortener service {host} masks real target"})
    else:
        checklist.append({"rule": "Destination Transparency", "pass": True, "detail": "Direct uncloaked destination URL"})

    # 10. Obfuscation & Authority Exploits
    has_at_symbol = "@" in raw_url
    has_double_slash = "//" in path
    if has_at_symbol or has_double_slash:
        score += 30
        flags.append("URL Obfuscation Trick (@ Authority Delimiter or Redirection Path)")
        checklist.append({"rule": "URL Obfuscation", "pass": False, "detail": "Uses @ authority tricks or double-slash redirection"})
    else:
        checklist.append({"rule": "URL Obfuscation", "pass": True, "detail": "Standard URL path formatting"})

    # Cap score at 100
    final_score = min(max(score, 0), 100)

    # Determine risk category
    if final_score >= 75:
        risk_level = "Dangerous Phishing Link"
        verdict = "DANGER: High-probability phishing or malicious lure. Do NOT interact or submit credentials."
    elif final_score >= 50:
        risk_level = "Suspicious"
        verdict = "WARNING: Suspicious forensic anomalies detected. Verify domain through official channels."
    elif final_score >= 25:
        risk_level = "Low Risk / Caution"
        verdict = "CAUTION: Minor risk factors detected. Proceed with basic vigilance."
    else:
        risk_level = "Safe / Legitimate"
        verdict = "VERIFIED SAFE: No significant phishing or deception indicators detected."

    # Live DNS resolution check
    dns_result = resolve_dns(host)
    if not dns_result["live"] and "NXDOMAIN" in dns_result["status"]:
        # If the domain is already an NXDOMAIN or taken down
        flags.append("DNS Alert: Domain has no active DNS A-records (Dead or disposable lure)")

    return {
        "url": raw_url,
        "domain": host,
        "root_domain": root_domain,
        "subdomain": subdomain,
        "protocol": protocol,
        "port": port,
        "path": path,
        "query": query,
        "risk_score": final_score,
        "risk_level": risk_level,
        "verdict": verdict,
        "flags": flags,
        "breakdown": checklist,
        "defanged_url": defang_url(raw_url),
        "dns_status": dns_result["status"],
        "dns_records": dns_result
    }
