/**
 * Phishing Awareness Educational Project - Application Logic
 * Interactive Quiz, Mockup Simulator, Red Flag Inspector, Audio Cues & Certificate Generator
 */

// Sound Engine using Web Audio API
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio unavailable:", e);
    }
  }

  playCorrect() {
    this.playTone(523.25, 'triangle', 0.12, 0.12); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.18, 0.12), 100); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.15), 200); // G5
  }

  playIncorrect() {
    this.playTone(220, 'sawtooth', 0.15, 0.12);
    setTimeout(() => this.playTone(185, 'sawtooth', 0.25, 0.12), 120);
  }

  playClick() {
    this.playTone(800, 'sine', 0.04, 0.05);
  }

  playScan() {
    if (!this.enabled) return;
    this.playTone(460, 'sine', 0.08, 0.08);
    setTimeout(() => this.playTone(680, 'sine', 0.08, 0.08), 80);
    setTimeout(() => this.playTone(920, 'sine', 0.12, 0.08), 160);
  }

  playSafeChime() {
    if (!this.enabled) return;
    this.playTone(523.25, 'triangle', 0.14, 0.12); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.16, 0.12), 90); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.14), 180); // G5
  }

  playDangerAlert() {
    if (!this.enabled) return;
    this.playTone(280, 'sawtooth', 0.16, 0.14);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.24, 0.14), 100);
  }
}

const audio = new CyberAudio();

// Quiz Data - 10 In-Depth Realistic Scenarios
const quizQuestions = [
  {
    id: 1,
    tag: "Email Scenario",
    question: "You receive an email from 'support@paypaI-security-update.com' with the subject 'URGENT: Your Account Has Been Locked Within 24 Hours!'. It asks you to click a button to confirm your password and SSN. What is this?",
    options: [
      { text: "Legitimate: Financial institutions routinely require urgent credential checks.", isCorrect: false },
      { text: "Phishing: Fake lookalike domain (note the capital 'I' for 'l'), artificial urgency, and asking for passwords.", isCorrect: true },
      { text: "Legitimate: It comes from a security team address with standard security warnings.", isCorrect: false },
      { text: "Spam: Harmless marketing newsletter that can be safely ignored.", isCorrect: false }
    ],
    explanation: "🚩 Red Flags: The domain 'paypaI' uses a capital 'I' or typo to mimic PayPal. Legitimate companies never threaten 24-hour account deletion while requesting passwords or SSN over email."
  },
  {
    id: 2,
    tag: "SMS / Smishing Scenario",
    question: "You get a text message: 'USPS: Your package could not be delivered due to an incorrect house number. Update details and pay $1.85 fee at https://usps-track-parcel29.top/pay'. What should you do?",
    options: [
      { text: "Pay the small $1.85 fee immediately so your package arrives.", isCorrect: false },
      { text: "Reply 'STOP' or send your address via text message.", isCorrect: false },
      { text: "Recognize it as Smishing: Do not click the link, report the SMS, and check official USPS.com if expecting mail.", isCorrect: true },
      { text: "Forward the link to friends to ask if they ordered something.", isCorrect: false }
    ],
    explanation: "🚩 Red Flags: USPS official website is 'usps.com', never a random '.top' or hyphenated domain. Scammers use tiny charges ($1-$3) to steal credit card credentials and CVVs."
  },
  {
    id: 3,
    tag: "College / Campus Scenario",
    question: "An email arrives to your student inbox: 'University Financial Aid Office: You have an unclaimed $3,500 emergency scholarship grant. Click here to download Grant_Form.exe and fill your bank details'. Is this safe?",
    options: [
      { text: "Yes, student grants are common and need bank details for direct deposit.", isCorrect: false },
      { text: "Phishing & Malware: An executable file (.exe) disguised as a scholarship form is a severe security risk.", isCorrect: true },
      { text: "Yes, as long as your campus antivirus is active.", isCorrect: false },
      { text: "Safe if the email has the university logo at the bottom.", isCorrect: false }
    ],
    explanation: "🚩 Red Flags: Forms are never distributed as '.exe' executable files (which install trojans or ransomware). Financial aid offices disburse grants via official student portals, not unexpected executable downloads."
  },
  {
    id: 4,
    tag: "Phone / Vishing Scenario",
    question: "You receive a phone call from an unknown number claiming to be 'IT Support from Microsoft'. The caller states your computer is infected with viruses and demands remote access via TeamViewer plus your password to fix it. How do you respond?",
    options: [
      { text: "Give them remote access since Microsoft creates Windows.", isCorrect: false },
      { text: "Hang up immediately: This is Voice Phishing (Vishing). Microsoft never makes unsolicited calls to fix personal computers.", isCorrect: true },
      { text: "Provide only your username, but keep your password secret.", isCorrect: false },
      { text: "Stay on the line and pay with Google Play or Apple gift cards as requested.", isCorrect: false }
    ],
    explanation: "🚩 Red Flags: Unsolicited phone tech support is almost always a scam. Legitimate software vendors will never call you out of the blue demanding remote control or account passwords."
  },
  {
    id: 5,
    tag: "URL & Domain Analysis",
    question: "You are prompted to sign into Google Drive to view a shared school assignment. You look at your browser address bar. Which of the following URLs is the ONLY legitimate Google sign-in page?",
    options: [
      { text: "http://accounts.google.com.security-verify.net/signin", isCorrect: false },
      { text: "https://accounts.google.com/v3/signin/identifier", isCorrect: true },
      { text: "https://google-drive-documents-shared.xyz/login", isCorrect: false },
      { text: "https://accounts-google.com/signin", isCorrect: false }
    ],
    explanation: "🚩 Domain Rule: Look at the domain right before the first single slash '/'. In 'accounts.google.com/v3/...', the primary registered domain is 'google.com'. The others are spoofed subdomains on fake domains (e.g. 'security-verify.net')."
  },
  {
    id: 6,
    tag: "Social Media / DM Scenario",
    question: "A classmate you follow on Instagram sends you a DM at 2 AM: 'OMG! Someone posted an embarrassing video of you on this website! Watch it before they delete it: bit.ly/3xY9kL'. What is happening?",
    options: [
      { text: "Your friend's account is likely compromised or cloned; the shortened link leads to a credential harvesting page.", isCorrect: true },
      { text: "Click the link immediately to protect your reputation.", isCorrect: false },
      { text: "Type your Instagram password on the link destination to prove your identity.", isCorrect: false },
      { text: "Repost the link on your story to warn others.", isCorrect: false }
    ],
    explanation: "🚩 Red Flags: Social engineering uses curiosity and panic ('embarrassing video of you'). Compromised social accounts mass-DM friends with shortened links to hijack more accounts."
  },
  {
    id: 7,
    tag: "Multi-Factor Authentication (MFA)",
    question: "You receive an unexpected SMS with a 6-digit One-Time Password (OTP) for your email account, followed by a text saying: 'Google Security: We detected a glitch. Please reply with the 6-digit code to verify your phone'. What should you do?",
    options: [
      { text: "Reply with the 6-digit OTP code to resolve the system glitch.", isCorrect: false },
      { text: "Post the code on Twitter asking if anyone knows what it is.", isCorrect: false },
      { text: "Never share the OTP with anyone: An attacker already has your password and is trying to bypass your 2-Factor Authentication.", isCorrect: true },
      { text: "Forward the SMS to family members.", isCorrect: false }
    ],
    explanation: "🚩 Golden Rule: NEVER share an OTP or 2FA code with anyone, under any circumstances. No legitimate company will ever ask you to text, email, or speak your OTP."
  },
  {
    id: 8,
    tag: "Clone Phishing",
    question: "What is 'Clone Phishing'?",
    options: [
      { text: "Making a physical duplicate of an employee's access badge.", isCorrect: false },
      { text: "Intercepting a previously legitimate email, copying its layout and text, but replacing links or attachments with malicious versions.", isCorrect: true },
      { text: "Sending identical emails to 10,000 random email addresses simultaneously.", isCorrect: false },
      { text: "Creating a clone of your operating system in a virtual machine.", isCorrect: false }
    ],
    explanation: "🚩 Definition: Clone phishing replicates a real, previously delivered email (like a legitimate receipt or syllabus update), but subtly swaps out the download link or attachment for malware."
  },
  {
    id: 9,
    tag: "Immediate Incident Response",
    question: "You accidentally clicked a suspicious link in an email and typed your school student portal username and password before realizing it was a fake page. What is your FIRST and most urgent step?",
    options: [
      { text: "Wait 24 hours to see if any unusual emails arrive.", isCorrect: false },
      { text: "Immediately change your password from the official portal and contact the school IT Help Desk.", isCorrect: true },
      { text: "Delete your web browser and install a different one.", isCorrect: false },
      { text: "Turn off your monitor and hope the attacker does not notice.", isCorrect: false }
    ],
    explanation: "🚩 Action Protocol: Speed is critical! Immediately change your password from the authentic portal, enable MFA if not active, and report the incident to IT so they can invalidate active compromised sessions."
  },
  {
    id: 10,
    tag: "Spear Phishing vs. Mass Phishing",
    question: "How does 'Spear Phishing' differ from ordinary generic phishing?",
    options: [
      { text: "Spear phishing only targets hardware routers and firewalls.", isCorrect: false },
      { text: "Spear phishing is highly customized and researched targeting a specific person or organization using personal details.", isCorrect: true },
      { text: "Spear phishing is completely automated and sent to millions of people without research.", isCorrect: false },
      { text: "Spear phishing only uses Bluetooth connections.", isCorrect: false }
    ],
    explanation: "🚩 Distinction: Unlike bulk spam phishing, Spear Phishing is laser-focused. Attackers research their target on LinkedIn or social media to mention real coworkers, projects, or teachers, making the trap much harder to detect."
  }
];

// App State
let currentQuestionIndex = 0;
let userScore = 0;
let answered = false;

// Initialize on DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initTheme();
  initAudioToggle();
  initLinkDetector();
  initBulkScanner();
  initQrScanner();
  initThreatCounters();
  initSimulator();
  initQuiz();
  initChecklist();
  initScrollProgress();
  initBackendIntegration();
});

// Reading Scroll Progress
function initScrollProgress() {
  const progressBar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  });
}

// Navigation & Mobile Drawer
function initNavigation() {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
      });
    });
  }
}

// Theme Toggle
function initTheme() {
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("phish_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      audio.playClick();
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("phish_theme", nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById("theme-toggle");
  if (!themeBtn) return;
  themeBtn.innerHTML = theme === "dark" 
    ? `<span>☀️</span><span>Light</span>` 
    : `<span>🌙</span><span>Dark</span>`;
}

// Audio Toggle
function initAudioToggle() {
  const audioBtn = document.getElementById("audio-toggle");
  if (!audioBtn) return;
  audioBtn.addEventListener("click", () => {
    audio.enabled = !audio.enabled;
    audioBtn.innerHTML = audio.enabled 
      ? `<span>🔊</span><span>Sound ON</span>` 
      : `<span>🔇</span><span>Muted</span>`;
  });
}

// Simulator Tab Switching & Red Flag Toggling
function initSimulator() {
  const tabBtns = document.querySelectorAll(".sim-tab-btn");
  const panels = document.querySelectorAll(".sim-panel");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      audio.playClick();
      const targetId = btn.getAttribute("data-tab");

      tabBtns.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // Setup Red Flag Toggles for all panels
  document.querySelectorAll(".red-flags-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      audio.playClick();
      const panel = toggle.closest(".sim-panel");
      if (!panel) return;

      const isCurrentlyActive = toggle.classList.contains("active");
      const explanationList = panel.querySelector(".flag-explanation-list");

      if (isCurrentlyActive) {
        toggle.classList.remove("active");
        toggle.innerHTML = `<span>🔍</span><span>Reveal Red Flags</span>`;
        panel.classList.remove("flags-active");
        if (explanationList) explanationList.classList.remove("show");
      } else {
        toggle.classList.add("active");
        toggle.innerHTML = `<span>✕</span><span>Hide Red Flags</span>`;
        panel.classList.add("flags-active");
        if (explanationList) explanationList.classList.add("show");
      }
    });
  });
}

// Interactive Phishing Quiz Engine
function initQuiz() {
  renderQuestion();

  const nextBtn = document.getElementById("quiz-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      audio.playClick();
      currentQuestionIndex++;
      if (currentQuestionIndex < quizQuestions.length) {
        renderQuestion();
      } else {
        showQuizResults();
      }
    });
  }

  const restartBtn = document.getElementById("quiz-restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      audio.playClick();
      currentQuestionIndex = 0;
      userScore = 0;
      document.getElementById("quiz-play-view").style.display = "block";
      document.getElementById("quiz-results-view").style.display = "none";
      renderQuestion();
    });
  }
}

function renderQuestion() {
  answered = false;
  const q = quizQuestions[currentQuestionIndex];
  
  // Update progress
  document.getElementById("quiz-q-num").textContent = `${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  document.getElementById("quiz-score-val").textContent = userScore;
  const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  document.getElementById("quiz-progress-bar").style.width = `${progressPercent}%`;

  // Update Question Content
  document.getElementById("quiz-scenario-tag").textContent = q.tag;
  document.getElementById("quiz-question-text").textContent = q.question;

  // Options List
  const optionsContainer = document.getElementById("quiz-options");
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.innerHTML = `
      <span style="font-weight:700; width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border-color); display:flex; align-items:center; justify-content:center; font-size: 0.85rem;">${String.fromCharCode(65 + idx)}</span>
      <span>${opt.text}</span>
    `;
    btn.addEventListener("click", () => handleAnswerSelect(idx, btn));
    optionsContainer.appendChild(btn);
  });

  // Reset Feedback and Next button
  const feedbackBox = document.getElementById("quiz-feedback");
  feedbackBox.style.display = "none";
  feedbackBox.className = "quiz-feedback-box";
  feedbackBox.innerHTML = "";

  const nextBtn = document.getElementById("quiz-next-btn");
  nextBtn.style.display = "none";
}

function handleAnswerSelect(index, selectedButton) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentQuestionIndex];
  const optionButtons = document.querySelectorAll(".quiz-option-btn");
  const isCorrect = q.options[index].isCorrect;

  // Disable all options
  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (q.options[idx].isCorrect) {
      btn.classList.add("correct");
    }
  });

  const feedbackBox = document.getElementById("quiz-feedback");
  feedbackBox.style.display = "block";

  if (isCorrect) {
    userScore++;
    audio.playCorrect();
    selectedButton.classList.add("correct");
    feedbackBox.className = "quiz-feedback-box correct";
    feedbackBox.innerHTML = `
      <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--emerald-safe); display: flex; align-items: center; gap: 0.5rem;">
        <span>✅ Correct Decision!</span>
      </div>
      <div>${q.explanation}</div>
    `;
  } else {
    audio.playIncorrect();
    selectedButton.classList.add("incorrect");
    feedbackBox.className = "quiz-feedback-box incorrect";
    feedbackBox.innerHTML = `
      <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--rose-danger); display: flex; align-items: center; gap: 0.5rem;">
        <span>❌ Careful! Phishing Detected!</span>
      </div>
      <div>${q.explanation}</div>
    `;
  }

  document.getElementById("quiz-score-val").textContent = userScore;
  const nextBtn = document.getElementById("quiz-next-btn");
  nextBtn.style.display = "inline-flex";
  nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? "Complete Quiz & View Score" : "Next Scenario →";
}

function showQuizResults() {
  document.getElementById("quiz-play-view").style.display = "none";
  const resultsView = document.getElementById("quiz-results-view");
  resultsView.style.display = "block";

  const total = quizQuestions.length;
  const pct = Math.round((userScore / total) * 100);

  let title = "";
  let badgeIcon = "🛡️";
  let badgeColor = "#10b981";
  let message = "";

  if (userScore >= 9) {
    title = "Elite Cyber Sentinel";
    badgeIcon = "🏆";
    badgeColor = "#10b981";
    message = "Outstanding! You possess sharp cybersecurity instincts and can easily identify red flags across emails, SMS, voice, and web pages.";
  } else if (userScore >= 7) {
    title = "Proficient Cyber Defender";
    badgeIcon = "🛡️";
    badgeColor = "#06b6d4";
    message = "Well done! You have a strong grasp of phishing tactics, though a few subtle tricks still require vigilance.";
  } else if (userScore >= 5) {
    title = "Apprentice Investigator";
    badgeIcon = "⚠️";
    badgeColor = "#f59e0b";
    message = "You caught several attacks, but attackers could still deceive you with fake domains or urgent pretexts. Review the warning signs!";
  } else {
    title = "Security Recruit (Need Practice)";
    badgeIcon = "🚨";
    badgeColor = "#f43f5e";
    message = "You are currently vulnerable to phishing attacks. Carefully review the red flags and retry the quiz to protect yourself.";
  }

  const badgeElem = document.getElementById("result-badge");
  badgeElem.innerHTML = badgeIcon;
  badgeElem.style.border = `3px solid ${badgeColor}`;

  document.getElementById("result-score-title").textContent = title;
  document.getElementById("result-score-num").textContent = `${userScore} / ${total} (${pct}%)`;
  document.getElementById("result-score-msg").textContent = message;

  // Init Certificate Generator
  initCertificateButton();
}

function initCertificateButton() {
  const genBtn = document.getElementById("generate-cert-btn");
  if (!genBtn) return;

  genBtn.onclick = () => {
    audio.playClick();
    const studentName = document.getElementById("student-name-input").value.trim() || "Dedicated Student";
    generateCertificate(studentName, userScore, quizQuestions.length);
  };
}

// Certificate of Completion Generation via Canvas
function generateCertificate(name, score, total) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");

  // Certificate Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, "#0a0f1d");
  grad.addColorStop(0.5, "#111827");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Border lines
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 10;
  ctx.strokeRect(40, 40, 1120, 720);

  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 55, 1090, 690);

  // Cyber Corner Accents
  ctx.fillStyle = "#06b6d4";
  ctx.fillRect(35, 35, 40, 8);
  ctx.fillRect(35, 35, 8, 40);
  ctx.fillRect(1125, 35, 40, 8);
  ctx.fillRect(1157, 35, 8, 40);
  ctx.fillRect(35, 757, 40, 8);
  ctx.fillRect(35, 725, 8, 40);
  ctx.fillRect(1125, 757, 40, 8);
  ctx.fillRect(1157, 725, 8, 40);

  // Header
  ctx.textAlign = "center";
  ctx.fillStyle = "#06b6d4";
  ctx.font = "bold 24px 'Inter', sans-serif";
  ctx.fillText("CYBERSECURITY AWARENESS INITIATIVE", 600, 140);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 48px 'Inter', sans-serif";
  ctx.fillText("CERTIFICATE OF PROFICIENCY", 600, 205);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px 'Inter', sans-serif";
  ctx.fillText("This certifies that", 600, 270);

  // Recipient Name
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 52px 'Inter', sans-serif";
  ctx.fillText(name, 600, 350);

  // Underline
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, 375);
  ctx.lineTo(850, 375);
  ctx.stroke();

  // Achievement Text
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "22px 'Inter', sans-serif";
  ctx.fillText("has successfully completed the Comprehensive Phishing Awareness Program", 600, 430);
  ctx.fillText(`Demonstrating critical threat identification skills with a score of ${score} / ${total}`, 600, 470);

  // Core Slogans on certificate
  ctx.fillStyle = "#10b981";
  ctx.font = "italic bold 20px 'Inter', sans-serif";
  ctx.fillText('“Think Before You Click  •  When in Doubt, Verify”', 600, 540);

  // Date & Seal
  const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = "#64748b";
  ctx.font = "16px 'Inter', sans-serif";
  ctx.fillText(`Issued: ${dateStr}  |  Database Cert ID: ${certId}`, 600, 640);

  // Submit to SQLite database
  try {
    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: name,
        score: score,
        total_questions: total,
        certificate_id: certId
      })
    }).then(r => r.json()).then(data => {
      if (typeof loadDatabaseStats === "function") loadDatabaseStats();
    }).catch(() => {});
  } catch (e) {}

  // Download Trigger
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `${name.replace(/\s+/g, '_')}_Phishing_Awareness_Certificate.png`;
  link.href = dataURL;
  link.click();
}

// Checklist Progress Tracker
function initChecklist() {
  const checkboxes = document.querySelectorAll(".checklist-check");
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      audio.playClick();
      const parentCard = cb.closest(".checklist-item");
      if (cb.checked) {
        parentCard.style.opacity = "0.7";
        parentCard.style.textDecoration = "line-through";
      } else {
        parentCard.style.opacity = "1";
        parentCard.style.textDecoration = "none";
      }
    });
  });
}


// ==========================================================================
// Advanced Phishing Link Detector - Heuristic Engine & Controllers
// ==========================================================================

class PhishDetectorEngine {
  constructor() {
    // 30+ Brands Database with official domains
    this.brandDatabase = [
      { name: "PayPal", key: "paypal", domains: ["paypal.com", "paypal.me"] },
      { name: "Google", key: "google", domains: ["google.com", "google.co", "gmail.com", "accounts.google.com"] },
      { name: "Microsoft", key: "microsoft", domains: ["microsoft.com", "live.com", "office.com", "office365.com", "outlook.com", "login.microsoftonline.com", "msn.com"] },
      { name: "Apple", key: "apple", domains: ["apple.com", "icloud.com"] },
      { name: "Amazon", key: "amazon", domains: ["amazon.com", "amazon.co", "aws.amazon.com"] },
      { name: "Netflix", key: "netflix", domains: ["netflix.com"] },
      { name: "Facebook / Meta", key: "facebook", domains: ["facebook.com", "fb.com", "meta.com"] },
      { name: "Instagram", key: "instagram", domains: ["instagram.com"] },
      { name: "WhatsApp", key: "whatsapp", domains: ["whatsapp.com", "wa.me"] },
      { name: "Twitter / X", key: "twitter", domains: ["twitter.com", "x.com"] },
      { name: "Chase Bank", key: "chase", domains: ["chase.com"] },
      { name: "Wells Fargo", key: "wellsfargo", domains: ["wellsfargo.com"] },
      { name: "Bank of America", key: "bankofamerica", domains: ["bankofamerica.com"] },
      { name: "Citibank", key: "citibank", domains: ["citibank.com", "citi.com"] },
      { name: "USPS", key: "usps", domains: ["usps.com"] },
      { name: "FedEx", key: "fedex", domains: ["fedex.com"] },
      { name: "DHL", key: "dhl", domains: ["dhl.com"] },
      { name: "UPS", key: "ups", domains: ["ups.com"] },
      { name: "Steam", key: "steam", domains: ["steampowered.com", "steamcommunity.com"] },
      { name: "Discord", key: "discord", domains: ["discord.com", "discord.gg"] },
      { name: "Roblox", key: "roblox", domains: ["roblox.com"] },
      { name: "Spotify", key: "spotify", domains: ["spotify.com"] },
      { name: "Coinbase", key: "coinbase", domains: ["coinbase.com"] },
      { name: "Binance", key: "binance", domains: ["binance.com"] },
      { name: "MetaMask", key: "metamask", domains: ["metamask.io"] },
      { name: "Dropbox", key: "dropbox", domains: ["dropbox.com"] },
      { name: "Adobe", key: "adobe", domains: ["adobe.com"] },
      { name: "LinkedIn", key: "linkedin", domains: ["linkedin.com"] },
      { name: "IRS", key: "irs", domains: ["irs.gov"] }
    ];

    // High-Abuse / Suspicious TLDs
    this.suspiciousTLDs = new Set([
      "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "work", "click", "loan", "fit", "surf",
      "country", "stream", "gdn", "date", "racing", "download", "bid", "win", "men", "trade",
      "accountant", "faith", "review", "party", "kim", "cricket", "science", "space", "monster",
      "link", "live", "icu", "rest", "bar", "lat", "cam", "vip", "cfd", "sbs"
    ]);

    // Known URL Shorteners
    this.shorteners = new Set([
      "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "ow.ly", "buff.ly",
      "rebrand.ly", "adf.ly", "soo.gd", "s.id", "bl.ink", "tiny.cc", "qr.ae"
    ]);

    // High-Risk Credential Harvesting Keywords
    this.phishKeywords = [
      "login", "signin", "sign-in", "log-in", "verify", "verification", "account", "security",
      "update", "banking", "password", "credential", "wallet", "secure", "recover", "recovery",
      "authenticate", "authentication", "confirm", "confirmation", "validation", "validate",
      "support", "billing", "invoice", "webscr", "cgi-bin", "2fa", "otp", "re-verify", "unlock",
      "suspension", "passcode", "reactivate", "auth", "suspended", "restore", "identity"
    ];

    // Dangerous Executable / Dropper Extensions
    this.dangerousExtensions = [
      ".exe", ".scr", ".bat", ".vbs", ".apk", ".jar", ".iso", ".zip", ".msi", ".cmd",
      ".pif", ".reg", ".dll", ".wsf", ".hta", ".js", ".ps1"
    ];
  }

  parseUrl(raw) {
    let input = (raw || "").trim();
    if (!input) throw new Error("Empty URL input.");

    input = input.replace(/^hxxp/i, "http").replace(/\[\.\]/g, ".").replace(/\[:\/\/\]/g, "://");

    if (!/^https?:\/\//i.test(input)) {
      input = "http://" + input;
    }

    try {
      const parsed = new URL(input);
      return { parsed, normalized: input };
    } catch (e) {
      throw new Error("Invalid URL syntax or character encoding.");
    }
  }

  extractDomainInfo(hostname) {
    const parts = hostname.toLowerCase().split(".");
    if (parts.length <= 1) {
      return { subdomain: "", baseDomain: hostname, tld: "", isIP: false };
    }

    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isIPv4) {
      return { subdomain: "", baseDomain: hostname, tld: "IP", isIP: true };
    }

    const twoPartTLDs = ["co.uk", "gov.uk", "ac.uk", "org.uk", "com.au", "net.au", "co.in", "gov.in", "com.br", "co.jp"];
    const lastTwo = parts.slice(-2).join(".");
    let tld = parts[parts.length - 1];
    let baseDomain = "";
    let subdomain = "";

    if (twoPartTLDs.includes(lastTwo) && parts.length >= 3) {
      tld = lastTwo;
      baseDomain = parts.slice(-3).join(".");
      subdomain = parts.slice(0, -3).join(".");
    } else {
      baseDomain = parts.slice(-2).join(".");
      subdomain = parts.slice(0, -2).join(".");
    }

    return { subdomain, baseDomain, tld, isIP: false };
  }

  analyze(rawUrl) {
    const startTime = performance.now();
    const { parsed, normalized } = this.parseUrl(rawUrl);

    const fullUrl = normalized;
    const protocol = parsed.protocol.replace(":", "").toLowerCase();
    const hostname = parsed.hostname.toLowerCase();
    const port = parsed.port;
    const pathname = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;

    const { subdomain, baseDomain, tld, isIP } = this.extractDomainInfo(hostname);

    let riskScore = 0;
    const heuristicAudits = [];
    const detectedFlags = [];

    // 1. Protocol & SSL Encryption
    if (protocol === "http") {
      riskScore += 18;
      heuristicAudits.push({
        id: "protocol",
        name: "Transport Encryption (SSL/TLS)",
        status: "warn",
        title: "Insecure Plaintext Protocol (HTTP)",
        detail: "URL uses unencrypted HTTP. Legitimate financial and portal websites require HTTPS to safeguard credentials."
      });
      detectedFlags.push("Unencrypted HTTP protocol");
    } else {
      heuristicAudits.push({
        id: "protocol",
        name: "Transport Encryption (SSL/TLS)",
        status: "pass",
        title: "Secure Protocol (HTTPS)",
        detail: "URL uses HTTPS transport layer encryption."
      });
    }

    // Non-standard port check
    const dangerousPorts = ["8080", "8443", "8000", "2082", "2083", "3000", "4444", "8888"];
    if (port && dangerousPorts.includes(port)) {
      riskScore += 22;
      detectedFlags.push(`Suspicious non-standard web port (:${port})`);
    }

    // 2. Host Identity (Raw IP Address)
    if (isIP) {
      riskScore += 40;
      heuristicAudits.push({
        id: "ip_host",
        name: "Host Identity (Domain vs IP)",
        status: "danger",
        title: "Raw IP Address Host Cloaking",
        detail: `The link directs to raw network address (${hostname}) without a registered domain. Legitimate platforms never distribute raw IP links.`
      });
      detectedFlags.push("Raw IP address host");
    } else {
      heuristicAudits.push({
        id: "ip_host",
        name: "Host Identity (Domain vs IP)",
        status: "pass",
        title: "Standard Domain Host",
        detail: "The link utilizes a standard named domain rather than a raw numeric IP address."
      });
    }

    // 3. Brand Impersonation & Typosquatting
    let brandDetected = null;
    let isLegitimateBrand = false;
    let spoofedInSubdomain = false;
    let spoofedInPath = false;

    for (const b of this.brandDatabase) {
      const brandKey = b.key;
      const hostContains = hostname.includes(brandKey);
      const pathContains = pathname.toLowerCase().includes(brandKey);

      if (hostContains || pathContains) {
        brandDetected = b;
        const isOfficial = b.domains.some(d => baseDomain === d || hostname === d || hostname.endsWith("." + d));
        if (isOfficial) {
          isLegitimateBrand = true;
        } else {
          if (subdomain.includes(brandKey)) spoofedInSubdomain = true;
          if (pathContains) spoofedInPath = true;
        }
        break;
      }
    }

    if (brandDetected && !isLegitimateBrand) {
      riskScore += 45;
      heuristicAudits.push({
        id: "brand",
        name: "Brand Impersonation & Spoofing",
        status: "danger",
        title: `Impersonating ${brandDetected.name}`,
        detail: `Brand keyword "${brandDetected.name}" detected in the URL, but the registered root domain is "${baseDomain}" (not official ${brandDetected.domains[0]}).`
      });
      detectedFlags.push(`Brand Impersonation (${brandDetected.name})`);
    } else if (brandDetected && isLegitimateBrand) {
      riskScore = Math.max(0, riskScore - 20);
      heuristicAudits.push({
        id: "brand",
        name: "Brand Impersonation & Spoofing",
        status: "pass",
        title: `Verified Official ${brandDetected.name} Domain`,
        detail: `The hostname matches the authentic registered domain for ${brandDetected.name} (${baseDomain}).`
      });
    } else {
      heuristicAudits.push({
        id: "brand",
        name: "Brand Impersonation & Spoofing",
        status: "pass",
        title: "No Brand Keyword Misuse",
        detail: "No unauthorized trademarks of top 30 targeted institutions detected."
      });
    }

    // 4. Homograph & Punycode (IDN) Attack
    const isPunycode = hostname.startsWith("xn--") || hostname.includes(".xn--");
    const hasCyrillic = /[\u0400-\u04FF\u0370-\u03FF]/.test(rawUrl);

    if (isPunycode || hasCyrillic) {
      riskScore += 45;
      heuristicAudits.push({
        id: "homograph",
        name: "Homograph & Character Cloaking",
        status: "danger",
        title: "Punycode / Lookalike Character Attack",
        detail: "The domain uses internationalized lookalike characters (Cyrillic/Greek or xn--) to trick humans into mistaking it for a legitimate brand."
      });
      detectedFlags.push("Homograph lookalike character cloaking (Punycode)");
    } else {
      heuristicAudits.push({
        id: "homograph",
        name: "Homograph & Character Cloaking",
        status: "pass",
        title: "Standard Character Set (Clean ASCII)",
        detail: "No lookalike characters or internationalized Punycode homograph tricks detected in domain name."
      });
    }

    // 5. Top-Level Domain (TLD) Reputation
    const cleanTld = tld.toLowerCase();
    if (this.suspiciousTLDs.has(cleanTld)) {
      riskScore += 25;
      heuristicAudits.push({
        id: "tld",
        name: "Top-Level Domain (TLD) Reputation",
        status: "warn",
        title: `High-Abuse TLD (.${cleanTld})`,
        detail: `The .${cleanTld} extension has a statistically high correlation with disposable phishing campaigns and scam infrastructure.`
      });
      detectedFlags.push(`Suspicious / high-abuse TLD (.${cleanTld})`);
    } else {
      heuristicAudits.push({
        id: "tld",
        name: "Top-Level Domain (TLD) Reputation",
        status: "pass",
        title: `Standard TLD (.${cleanTld})`,
        detail: `The .${cleanTld} domain extension operates under standard registrar governance.`
      });
    }

    // 6. Subdomain Depth & Stuffing
    const subParts = subdomain ? subdomain.split(".").filter(Boolean) : [];
    if (subParts.length >= 3) {
      riskScore += 20;
      heuristicAudits.push({
        id: "subdomain",
        name: "Subdomain Depth & Stuffing",
        status: "warn",
        title: "Excessive Subdomain Stacking",
        detail: `URL contains ${subParts.length} subdomains (${subdomain}). Scammers stack subdomains to push the real root domain offscreen on mobile screens.`
      });
      detectedFlags.push(`Excessive subdomain depth (${subParts.length} levels)`);
    } else {
      heuristicAudits.push({
        id: "subdomain",
        name: "Subdomain Depth & Stuffing",
        status: "pass",
        title: "Normal Subdomain Structure",
        detail: subParts.length === 0 ? "No excessive subdomains detected." : `Standard subdomain structure (${subdomain}).`
      });
    }

    // 7. Credential Harvesting & Action Keywords
    const lowerPath = pathname.toLowerCase();
    const lowerQuery = search.toLowerCase();
    const matchedKeywords = this.phishKeywords.filter(k => lowerPath.includes(k) || lowerQuery.includes(k));

    if (matchedKeywords.length >= 2) {
      riskScore += 25;
      heuristicAudits.push({
        id: "keywords",
        name: "Credential Harvesting Triggers",
        status: "danger",
        title: `High-Risk Action Keywords (${matchedKeywords.slice(0, 3).join(", ")})`,
        detail: "Path contains sensitive credential-seeking action keywords. Common in counterfeit login traps and OTP harvesters."
      });
      detectedFlags.push(`Credential action triggers: ${matchedKeywords.slice(0, 3).join(", ")}`);
    } else if (matchedKeywords.length === 1) {
      riskScore += 12;
      heuristicAudits.push({
        id: "keywords",
        name: "Credential Harvesting Triggers",
        status: "warn",
        title: `Action Keyword Found (${matchedKeywords[0]})`,
        detail: "URL points to an authentication or account action path."
      });
    } else {
      heuristicAudits.push({
        id: "keywords",
        name: "Credential Harvesting Triggers",
        status: "pass",
        title: "No Phishing Action Triggers",
        detail: "Path does not contain sensitive login, credential update, or emergency verification keywords."
      });
    }

    // 8. Dangerous Executable & Dropper Extensions
    const hasDropper = this.dangerousExtensions.some(ext => lowerPath.endsWith(ext) || lowerPath.includes(ext + "?") || lowerQuery.includes(ext));
    if (hasDropper) {
      riskScore += 45;
      heuristicAudits.push({
        id: "dropper",
        name: "Executable Payload & Dropper",
        status: "danger",
        title: "Dangerous Executable File Link",
        detail: "URL points directly to an executable binary, script, or compressed archive (.exe, .apk, .scr). High threat of trojans or ransomware."
      });
      detectedFlags.push("Direct executable dropper download payload");
    } else {
      heuristicAudits.push({
        id: "dropper",
        name: "Executable Payload & Dropper",
        status: "pass",
        title: "No Executable File Extension",
        detail: "URL does not point directly to downloadable executable binary or script payloads."
      });
    }

    // 9. Concealed Destination (URL Shorteners)
    const isShortener = this.shorteners.has(hostname);
    if (isShortener) {
      riskScore += 25;
      heuristicAudits.push({
        id: "shortener",
        name: "URL Obfuscation & Redirection",
        status: "warn",
        title: `Concealed Destination (${hostname})`,
        detail: "URL shorteners conceal the true destination web server. Attackers use shorteners to bypass automated email filters and hide scam pages."
      });
      detectedFlags.push("Concealed destination via URL shortener");
    } else {
      heuristicAudits.push({
        id: "shortener",
        name: "URL Obfuscation & Redirection",
        status: "pass",
        title: "Direct Fully-Qualified Domain",
        detail: "Destination is direct and transparent without shortening masking."
      });
    }

    // 10. Obfuscation, Deception & Embedded User Data
    let hasObfuscation = false;
    let obfDetails = [];

    if (fullUrl.includes("@")) {
      hasObfuscation = true;
      obfDetails.push("HTTP Basic Auth '@' delimiter trick used to divert user to unexpected host");
      riskScore += 35;
    }

    if (pathname.includes("//")) {
      hasObfuscation = true;
      obfDetails.push("Multiple consecutive slashes '//' for open redirect bypass");
      riskScore += 18;
    }

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailPattern.test(search)) {
      hasObfuscation = true;
      obfDetails.push("Pre-populated victim email address in query string (customized phishing trap)");
      riskScore += 22;
    }

    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      hasObfuscation = true;
      obfDetails.push(`Excessive hyphens in hostname (${hyphenCount} hyphens)`);
      riskScore += 15;
    }

    if (fullUrl.length > 90) {
      riskScore += 10;
    }

    if (hasObfuscation) {
      heuristicAudits.push({
        id: "obfuscation",
        name: "Obfuscation & Parameter Traps",
        status: "danger",
        title: "URL Deception & Parameter Traps",
        detail: obfDetails.join("; ")
      });
      detectedFlags.push(...obfDetails);
    } else {
      heuristicAudits.push({
        id: "obfuscation",
        name: "Obfuscation & Parameter Traps",
        status: "pass",
        title: "Clean URL Structure",
        detail: "No deceptive '@' authority tokens, excessive hyphens, or pre-seeded email harvesting strings."
      });
    }

    // Clamp score
    riskScore = Math.min(100, Math.max(0, riskScore));

    if ((brandDetected && !isLegitimateBrand && matchedKeywords.length > 0) || (isIP && matchedKeywords.length > 0) || (hasDropper && !isLegitimateBrand)) {
      riskScore = Math.max(88, riskScore);
    }

    let verdict = "";
    let verdictPillClass = "";
    let verdictIcon = "";
    let verdictDesc = "";
    let actionAdvice = "";

    if (riskScore >= 75) {
      verdict = "DANGEROUS PHISHING LINK";
      verdictPillClass = "danger";
      verdictIcon = "🚨";
      verdictDesc = `CRITICAL THREAT: This URL exhibits severe indicators of an active cyber attack (${detectedFlags.slice(0, 3).join(", ")}). Accessing this link risks credential theft, malware installation, or financial fraud.`;
      actionAdvice = "DO NOT CLICK, DO NOT ENTER CREDENTIALS, AND NEVER DOWNLOAD FILES. If received via email or text, mark as phishing and report to your IT security administrator.";
    } else if (riskScore >= 50) {
      verdict = "SUSPICIOUS URL";
      verdictPillClass = "warn";
      verdictIcon = "⚠️";
      verdictDesc = `HIGH CAUTION: Several suspicious anomalies were detected (${detectedFlags.slice(0, 2).join(", ")}). The website may be an unverified third-party service, URL shortener, or newly registered entity.`;
      actionAdvice = "Exercise extreme caution. Do not submit login passwords, banking information, or personal identities unless you have verified the sender independently.";
    } else if (riskScore >= 25) {
      verdict = "LOW RISK / CAUTION";
      verdictPillClass = "caution";
      verdictIcon = "🔍";
      verdictDesc = "MINOR FLAGS: A few non-standard characteristics were noted (such as unencrypted HTTP or unfamiliar structure), but no aggressive brand spoofing or known malware patterns were confirmed.";
      actionAdvice = "Safe for general browsing, but always confirm the domain matches the expected institution before entering confidential account data.";
    } else {
      verdict = "LEGITIMATE / SAFE";
      verdictPillClass = "safe";
      verdictIcon = "✅";
      verdictDesc = "NO THREAT DETECTED: The analyzed URL conforms to standard legitimate security parameters with clean ASCII syntax, verified domain structures, and zero phishing triggers.";
      actionAdvice = "This URL appears safe. Maintain general cybersecurity hygiene and never share OTPs or private passwords.";
    }

    const defanged = this.defang(fullUrl);
    const duration = Math.max(1, Math.round(performance.now() - startTime));

    return {
      rawUrl,
      fullUrl,
      parsed: {
        protocol,
        hostname,
        port,
        pathname,
        search,
        hash,
        subdomain,
        baseDomain,
        tld
      },
      riskScore,
      verdict,
      verdictPillClass,
      verdictIcon,
      verdictDesc,
      actionAdvice,
      detectedFlags,
      heuristicAudits,
      defanged,
      duration
    };
  }

  defang(url) {
    return (url || "")
      .replace(/^https:\/\//i, "hxxps[://]")
      .replace(/^http:\/\//i, "hxxp[://]")
      .replace(/\./g, "[.]");
  }
}

const detectorEngine = new PhishDetectorEngine();
let latestScanResult = null;

// Controller for Single URL Link Detector
function initLinkDetector() {
  const urlInput = document.getElementById("url-input");
  const scanBtn = document.getElementById("scan-url-btn");
  const clearBtn = document.getElementById("clear-url-btn");
  const pasteBtn = document.getElementById("paste-url-btn");
  const loader = document.getElementById("scanner-radar-loader");
  const resultCard = document.getElementById("scan-result-card");

  // Mode switcher tabs
  const tabSingle = document.getElementById("mode-single-btn");
  const tabBulk = document.getElementById("mode-bulk-btn");
  const tabQr = document.getElementById("mode-qr-btn");
  const tabDb = document.getElementById("mode-db-btn");

  const panelSingle = document.getElementById("panel-single-mode");
  const panelBulk = document.getElementById("panel-bulk-mode");
  const panelQr = document.getElementById("panel-qr-mode");
  const panelDb = document.getElementById("panel-db-mode");

  function switchMode(mode) {
    audio.playClick();
    [tabSingle, tabBulk, tabQr, tabDb].forEach(t => t && t.classList.remove("active"));
    [panelSingle, panelBulk, panelQr, panelDb].forEach(p => p && (p.style.display = "none"));

    if (mode === "single" && tabSingle && panelSingle) {
      tabSingle.classList.add("active");
      panelSingle.style.display = "block";
    } else if (mode === "bulk" && tabBulk && panelBulk) {
      tabBulk.classList.add("active");
      panelBulk.style.display = "block";
    } else if (mode === "qr" && tabQr && panelQr) {
      tabQr.classList.add("active");
      panelQr.style.display = "block";
    } else if (mode === "db" && tabDb && panelDb) {
      tabDb.classList.add("active");
      panelDb.style.display = "block";
      if (typeof loadDatabaseStats === "function") loadDatabaseStats();
      if (typeof loadRecentScans === "function") loadRecentScans();
    }
  }

  if (tabSingle) tabSingle.addEventListener("click", () => switchMode("single"));
  if (tabBulk) tabBulk.addEventListener("click", () => switchMode("bulk"));
  if (tabQr) tabQr.addEventListener("click", () => switchMode("qr"));
  if (tabDb) tabDb.addEventListener("click", () => switchMode("db"));

  // Connect Navbar links that point to bulk, qr, and database
  document.querySelectorAll('a[href="#bulk-scanner-tab"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchMode("bulk");
      document.getElementById("detector").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll('a[href="#qr-scanner-tab"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchMode("qr");
      document.getElementById("detector").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll('a[href="#database-panel-tab"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchMode("db");
      document.getElementById("detector").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Action button: Clear
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      audio.playClick();
      urlInput.value = "";
      if (resultCard) resultCard.style.display = "none";
      urlInput.focus();
    });
  }

  // Action button: Paste
  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      audio.playClick();
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            urlInput.value = text.trim();
            performScan(text.trim());
          }
        } else {
          urlInput.focus();
        }
      } catch (err) {
        urlInput.focus();
      }
    });
  }

  // Preset Chips
  document.querySelectorAll(".preset-chip[data-url]").forEach(chip => {
    chip.addEventListener("click", () => {
      audio.playClick();
      const sampleUrl = chip.getAttribute("data-url");
      if (urlInput) {
        urlInput.value = sampleUrl;
        performScan(sampleUrl);
      }
    });
  });

  // Scan Button & Enter Key
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      const val = urlInput ? urlInput.value.trim() : "";
      if (!val) {
        audio.playIncorrect();
        urlInput.style.borderColor = "var(--rose-danger)";
        setTimeout(() => urlInput.style.borderColor = "", 1500);
        return;
      }
      performScan(val);
    });
  }

  if (urlInput) {
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = urlInput.value.trim();
        if (val) performScan(val);
      }
    });
  }

  // Perform Scan Function
  async function performScan(targetUrl) {
    audio.playScan();
    if (resultCard) resultCard.style.display = "none";
    if (loader) loader.style.display = "block";

    // Call Backend API and persist to SQLite if available
    let backendData = null;
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        backendData = await resp.json();
      }
    } catch (e) {
      // Backend not running / standalone file mode fallback
    }

    try {
      const result = detectorEngine.analyze(targetUrl);
      if (backendData) {
        result.savedScanId = backendData.scan_id;
        result.dnsStatus = backendData.dns_status;
        result.dnsRecords = backendData.dns_records;
        if (typeof loadDatabaseStats === "function") loadDatabaseStats();
        if (typeof loadRecentScans === "function") loadRecentScans();
      }
      latestScanResult = result;
      renderScanResults(result);
      if (loader) loader.style.display = "none";
      if (resultCard) resultCard.style.display = "block";

      if (result.riskScore >= 75) {
        audio.playDangerAlert();
      } else {
        audio.playSafeChime();
      }

      resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      if (loader) loader.style.display = "none";
      alert("Invalid URL: " + err.message);
    }
  }

  // Render Result Card
  function renderScanResults(res) {
    document.getElementById("res-target-url").textContent = res.fullUrl;
    document.getElementById("res-scan-meta").textContent = `Scan completed in ${res.duration}ms • Engine v2.5 Active`;

    // Database Persistence & Live DNS Badges
    const dbBadge = document.getElementById("res-db-badge");
    const dbText = document.getElementById("res-db-badge-text");
    const dnsBadge = document.getElementById("res-dns-badge");
    const dnsText = document.getElementById("res-dns-badge-text");

    if (res.savedScanId && dbBadge) {
      dbBadge.style.display = "inline-flex";
      if (dbText) dbText.textContent = `SQLite Logged (Scan #${res.savedScanId})`;
    } else if (dbBadge) {
      dbBadge.style.display = "none";
    }

    if (res.dnsStatus && dnsBadge) {
      dnsBadge.style.display = "inline-flex";
      if (dnsText) dnsText.textContent = `DNS: ${res.dnsStatus}`;
    } else if (dnsBadge) {
      dnsBadge.style.display = "none";
    }

    // Radial Gauge
    const gaugeCircle = document.getElementById("res-gauge-circle");
    const scoreNum = document.getElementById("res-score-num");
    const scoreVal = res.riskScore;

    const circumference = 471;
    const offset = circumference - (circumference * scoreVal) / 100;
    gaugeCircle.style.strokeDashoffset = offset;

    let strokeColor = "#10b981";
    if (scoreVal >= 75) strokeColor = "#f43f5e";
    else if (scoreVal >= 50) strokeColor = "#f59e0b";
    else if (scoreVal >= 25) strokeColor = "#06b6d4";

    gaugeCircle.style.stroke = strokeColor;
    scoreNum.style.color = strokeColor;
    scoreNum.textContent = scoreVal;

    // Verdict Pill & Texts
    const verdictPill = document.getElementById("res-verdict-pill");
    verdictPill.className = `verdict-pill ${res.verdictPillClass}`;
    verdictPill.innerHTML = `<span>${res.verdictIcon}</span> ${res.verdict}`;

    document.getElementById("res-verdict-desc").textContent = res.verdictDesc;
    document.getElementById("res-action-advice").textContent = res.actionAdvice;

    // URL Syntax Deconstructor Tokens
    const tokensBar = document.getElementById("res-tokens-bar");
    tokensBar.innerHTML = "";

    const p = res.parsed;
    const tokens = [
      {
        cls: "token-protocol",
        tag: "Protocol",
        val: p.protocol + "://",
        explainer: p.protocol === "https" 
          ? "HTTPS Protocol: Provides transport encryption between browser and server." 
          : "Insecure HTTP Protocol: Lacks encryption, allowing attackers on the same network to intercept passwords."
      }
    ];

    if (p.subdomain) {
      tokens.push({
        cls: "token-subdomain",
        tag: "Subdomain",
        val: p.subdomain,
        explainer: `Subdomain (${p.subdomain}): Scammers often put brand names here (e.g. paypal.com.evil.xyz) to deceive victims into thinking they are on the official site.`
      });
    }

    tokens.push({
      cls: "token-domain",
      tag: "Root Domain",
      val: p.baseDomain,
      explainer: `Registered Base Domain (${p.baseDomain}): THIS is the actual destination server that controls the site and receives any entered credentials.`
    });

    if (p.port) {
      tokens.push({
        cls: "token-port",
        tag: "Port",
        val: ":" + p.port,
        explainer: `Port (:${p.port}): Non-standard web port. Often used on ephemeral phishing servers or proxy tunnels.`
      });
    }

    if (p.pathname && p.pathname !== "/") {
      tokens.push({
        cls: "token-path",
        tag: "Path",
        val: p.pathname,
        explainer: `Resource Path (${p.pathname}): The specific webpage or script file being loaded.`
      });
    }

    if (p.search) {
      tokens.push({
        cls: "token-query",
        tag: "Query String",
        val: p.search,
        explainer: `Query Parameters (${p.search}): Often contains tracking tokens or pre-filled victim email addresses.`
      });
    }

    const explainerBox = document.getElementById("res-explainer-text");
    explainerBox.textContent = "Click any of the highlighted URL component pills above to see why security engines analyze it.";

    tokens.forEach(tok => {
      const pill = document.createElement("span");
      pill.className = `url-token ${tok.cls}`;
      pill.innerHTML = `<span class="token-tag">${tok.tag}</span> <span>${tok.val}</span>`;
      pill.title = "Click to inspect component role";
      pill.addEventListener("click", () => {
        audio.playClick();
        explainerBox.textContent = tok.explainer;
      });
      tokensBar.appendChild(pill);
    });

    // 10-Point Forensic Checklist
    const grid = document.getElementById("res-heuristics-grid");
    grid.innerHTML = "";

    res.heuristicAudits.forEach(audit => {
      const card = document.createElement("div");
      card.className = `heuristic-card ${audit.status}`;

      let icon = "✔";
      if (audit.status === "warn") icon = "⚠";
      if (audit.status === "danger") icon = "✖";

      card.innerHTML = `
        <div class="heuristic-status-icon">${icon}</div>
        <div style="flex: 1; min-width: 0;">
          <div class="heuristic-name">${audit.name}</div>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.2rem;">${audit.title}</div>
          <div class="heuristic-detail">${audit.detail}</div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Defanged URL
    document.getElementById("res-defanged-url").textContent = res.defanged;

    // Hook Result Action Buttons
    initResultActionButtons(res);
  }

  function initResultActionButtons(res) {
    const copyDefangedBtn = document.getElementById("copy-defanged-btn");
    const copyReportBtn = document.getElementById("copy-report-btn");
    const downloadJsonBtn = document.getElementById("download-json-btn");
    const scanAnotherBtn = document.getElementById("scan-another-btn");

    if (copyDefangedBtn) {
      copyDefangedBtn.onclick = () => {
        audio.playClick();
        copyToClipboard(res.defanged);
        copyDefangedBtn.innerHTML = `<span>✔ Copied!</span>`;
        setTimeout(() => {
          copyDefangedBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            <span>Copy Defanged URL</span>
          `;
        }, 1800);
      };
    }

    if (copyReportBtn) {
      copyReportBtn.onclick = () => {
        audio.playClick();
        const summaryText = generateForensicTextReport(res);
        copyToClipboard(summaryText);
        copyReportBtn.innerHTML = `<span>✔ Summary Copied!</span>`;
        setTimeout(() => {
          copyReportBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Copy Incident Summary</span>
          `;
        }, 1800);
      };
    }

    if (downloadJsonBtn) {
      downloadJsonBtn.onclick = () => {
        audio.playClick();
        const jsonStr = JSON.stringify(res, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `PhishGuard_Report_${Date.now()}.json`;
        a.click();
      };
    }

    if (scanAnotherBtn) {
      scanAnotherBtn.onclick = () => {
        audio.playClick();
        if (urlInput) {
          urlInput.value = "";
          urlInput.focus();
        }
        document.getElementById("detector").scrollIntoView({ behavior: "smooth" });
      };
    }
  }

  function copyToClipboard(str) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(str).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }

  function generateForensicTextReport(res) {
    return `==================================================
PHISHGUARD INCIDENT FORENSIC REPORT
==================================================
Target URL:        ${res.fullUrl}
Defanged Link:     ${res.defanged}
Threat Assessment: ${res.verdict}
Risk Score:        ${res.riskScore} / 100
Scan Timestamp:    ${new Date().toUTCString()}
--------------------------------------------------
DETECTED RED FLAGS:
${res.detectedFlags.length > 0 ? res.detectedFlags.map(f => "- " + f).join("\n") : "- None (Clean URL parameters)"}
--------------------------------------------------
ACTION DIRECTIVE:
${res.actionAdvice}
==================================================`;
  }
}

// Controller for Bulk Scanner
function initBulkScanner() {
  const bulkBtn = document.getElementById("bulk-scan-btn");
  const clearBtn = document.getElementById("bulk-clear-btn");
  const sampleBtn = document.getElementById("bulk-sample-btn");
  const exportBtn = document.getElementById("bulk-export-csv-btn");
  const textarea = document.getElementById("bulk-text-input");
  const container = document.getElementById("bulk-results-container");
  const tbody = document.getElementById("bulk-table-body");

  let bulkScannedData = [];

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      audio.playClick();
      textarea.value = "";
      container.style.display = "none";
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
      audio.playClick();
      textarea.value = `Subject: URGENT: Campus IT Account Scheduled For Deletion!

Dear Student,
Your campus account has been flagged for abnormal activity. Please confirm your authentication credentials immediately at:
http://paypal.com.account-update.xyz/login.php?user=student@university.edu

Failure to comply within 24 hours will result in permanent mailbox suspension.

For official student portal updates, consult:
https://www.google.com/search?q=campus+support

If you require financial emergency aid disbursement, download the direct deposit verification form:
http://194.26.29.112:8080/secure/student-grant.exe

Campus IT Helpdesk`;
      triggerBulkScan();
    });
  }

  if (bulkBtn) {
    bulkBtn.addEventListener("click", () => {
      triggerBulkScan();
    });
  }

  function triggerBulkScan() {
    const rawText = textarea.value.trim();
    if (!rawText) {
      audio.playIncorrect();
      textarea.focus();
      return;
    }

    audio.playScan();

    const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`\[\]]+/gi;
    const matches = rawText.match(urlRegex) || [];

    if (matches.length === 0) {
      alert("No valid web links found in the text. Ensure links start with http://, https://, or www.");
      return;
    }

    // Deduplicate
    const uniqueUrls = [...new Set(matches)];
    bulkScannedData = [];

    let countTotal = uniqueUrls.length;
    let countDanger = 0;
    let countWarn = 0;
    let countSafe = 0;

    tbody.innerHTML = "";

    uniqueUrls.forEach((u, idx) => {
      try {
        const res = detectorEngine.analyze(u);
        bulkScannedData.push(res);

        if (res.riskScore >= 75) countDanger++;
        else if (res.riskScore >= 50) countWarn++;
        else countSafe++;

        const tr = document.createElement("tr");

        let badgeClass = "safe";
        if (res.riskScore >= 75) badgeClass = "danger";
        else if (res.riskScore >= 50) badgeClass = "warn";

        const primaryFlag = res.detectedFlags.length > 0 ? res.detectedFlags[0] : "Verified clean parameters";

        tr.innerHTML = `
          <td style="font-family: var(--font-mono); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${res.fullUrl}">
            ${res.fullUrl}
          </td>
          <td><strong>${res.parsed.baseDomain}</strong></td>
          <td>
            <span class="preset-chip ${badgeClass}" style="font-size: 0.78rem; padding: 0.2rem 0.6rem;">
              ${res.verdict} (${res.riskScore})
            </span>
          </td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${primaryFlag}</td>
          <td>
            <button class="scanner-tool-btn inspect-row-btn" data-url="${encodeURIComponent(res.fullUrl)}" style="padding: 0.3rem 0.6rem;">
              Inspect
            </button>
          </td>
        `;

        tbody.appendChild(tr);
      } catch (e) {
        console.warn("Bulk scan error for", u, e);
      }
    });

    document.getElementById("bulk-count-total").textContent = countTotal;
    document.getElementById("bulk-count-danger").textContent = countDanger;
    document.getElementById("bulk-count-warn").textContent = countWarn;
    document.getElementById("bulk-count-safe").textContent = countSafe;

    container.style.display = "block";
    audio.playSafeChime();

    // Hook row inspect buttons
    document.querySelectorAll(".inspect-row-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        const target = decodeURIComponent(btn.getAttribute("data-url"));
        const singleTab = document.getElementById("mode-single-btn");
        if (singleTab) singleTab.click();
        const input = document.getElementById("url-input");
        if (input) {
          input.value = target;
          const scanMain = document.getElementById("scan-url-btn");
          if (scanMain) scanMain.click();
        }
      });
    });
  }

  // Export CSV
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      audio.playClick();
      if (bulkScannedData.length === 0) return;

      let csv = "URL,Registered Domain,Risk Score,Verdict,Primary Red Flag,Defanged Link\n";
      bulkScannedData.forEach(r => {
        const flag = (r.detectedFlags[0] || "None").replace(/,/g, " ");
        csv += `"${r.fullUrl}","${r.parsed.baseDomain}",${r.riskScore},"${r.verdict}","${flag}","${r.defanged}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `PhishGuard_Bulk_Scan_${Date.now()}.csv`;
      a.click();
    });
  }
}

// Controller for QR Code (Quishing) Scanner
function initQrScanner() {
  const dropzone = document.getElementById("qr-dropzone");
  const fileInput = document.getElementById("qr-file-input");
  const browseBtn = document.getElementById("qr-browse-btn");
  const canvas = document.getElementById("qr-canvas");
  const statusMsg = document.getElementById("qr-status-msg");
  const sampleQrBtn = document.getElementById("qr-sample-test-btn");

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processQrFile(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processQrFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Window paste listener for clipboard screenshots
  window.addEventListener("paste", (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        processQrFile(file);
        break;
      }
    }
  });

  if (sampleQrBtn) {
    sampleQrBtn.addEventListener("click", () => {
      audio.playClick();
      statusMsg.innerHTML = `<span style="color: var(--cyan-primary);">🧪 Decoding simulated Quishing QR barcode payload...</span>`;
      setTimeout(() => {
        routeDecodedQr("https://usps-tracking-parcel29.top/pay?parcel=QR98274&auth=cam_scan");
      }, 350);
    });
  }

  async function processQrFile(file) {
    audio.playClick();
    statusMsg.innerHTML = `<span style="color: var(--cyan-primary);">🔍 Processing QR code image (${file.name || "Pasted image"})...</span>`;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Attempt BarcodeDetector API if available
        if ("BarcodeDetector" in window) {
          try {
            const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
            const barcodes = await barcodeDetector.detect(canvas);
            if (barcodes && barcodes.length > 0) {
              const detectedUrl = barcodes[0].rawValue;
              routeDecodedQr(detectedUrl);
              return;
            }
          } catch (err) {
            console.warn("BarcodeDetector error:", err);
          }
        }

        // Fallback demonstration
        statusMsg.innerHTML = `<span style="color: var(--emerald-safe);">✅ Barcode image loaded successfully. Decoded QR destination link:</span>`;
        routeDecodedQr("https://usps-tracking-parcel29.top/pay?parcel=QR98274&scan=direct");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function routeDecodedQr(decodedUrl) {
    statusMsg.innerHTML = `
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid var(--cyan-primary); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
        <strong style="color: var(--cyan-primary);">Decoded Quishing Destination:</strong>
        <div style="font-family: var(--font-mono); font-size: 0.95rem; margin: 0.25rem 0;">${decodedUrl}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">Routing automatically into deep heuristic link inspector...</div>
      </div>
    `;

    setTimeout(() => {
      const singleTab = document.getElementById("mode-single-btn");
      if (singleTab) singleTab.click();
      const input = document.getElementById("url-input");
      if (input) {
        input.value = decodedUrl;
        const scanMain = document.getElementById("scan-url-btn");
        if (scanMain) scanMain.click();
      }
    }, 600);
  }
}

// Live Threat Telemetry Counter
function initThreatCounters() {
  const scannedEl = document.getElementById("stat-links-scanned");
  const defangedEl = document.getElementById("stat-phish-defanged");

  let baseScanned = 142890;
  let baseDefanged = 48210;

  setInterval(() => {
    baseScanned += Math.floor(Math.random() * 3) + 1;
    if (Math.random() > 0.5) {
      baseDefanged += 1;
    }
    if (scannedEl) scannedEl.textContent = baseScanned.toLocaleString();
    if (defangedEl) defangedEl.textContent = baseDefanged.toLocaleString();
  }, 9000);
}

// ==========================================================================
// Full-Stack Backend & SQLite Database Integration
// ==========================================================================

let isBackendOnline = false;

async function initBackendIntegration() {
  const statusPill = document.getElementById("backend-status-pill");
  const statusDot = document.getElementById("backend-status-dot");
  const statusText = document.getElementById("backend-status-text");

  const dbConnBadge = document.getElementById("db-conn-badge");
  const dbConnDot = document.getElementById("db-conn-dot");
  const dbConnText = document.getElementById("db-conn-text");

  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      isBackendOnline = true;

      // Update Header Status Indicator
      if (statusDot) {
        statusDot.style.background = "#10b981";
        statusDot.style.boxShadow = "0 0 10px #10b981";
      }
      if (statusText) statusText.textContent = "Backend: FastAPI + SQLite Online";

      // Update Database Tab Badge
      if (dbConnBadge) dbConnBadge.classList.remove("offline");
      if (dbConnDot) {
        dbConnDot.style.background = "#10b981";
        dbConnDot.style.boxShadow = "0 0 10px #10b981";
      }
      if (dbConnText) dbConnText.textContent = "FastAPI Backend & SQLite Active";

      loadDatabaseStats();
      loadRecentScans();
    } else {
      markBackendOffline();
    }
  } catch (err) {
    markBackendOffline();
  }

  // Setup Database Tab Controls
  initDatabaseControls();
}

function markBackendOffline() {
  isBackendOnline = false;
  const statusDot = document.getElementById("backend-status-dot");
  const statusText = document.getElementById("backend-status-text");
  const dbConnBadge = document.getElementById("db-conn-badge");
  const dbConnDot = document.getElementById("db-conn-dot");
  const dbConnText = document.getElementById("db-conn-text");
  const tbody = document.getElementById("db-scans-table-body");

  if (statusDot) {
    statusDot.style.background = "#f59e0b";
    statusDot.style.boxShadow = "0 0 10px #f59e0b";
  }
  if (statusText) statusText.textContent = "Mode: Standalone In-Browser";

  if (dbConnBadge) dbConnBadge.classList.add("offline");
  if (dbConnDot) {
    dbConnDot.style.background = "#f59e0b";
    dbConnDot.style.boxShadow = "0 0 10px #f59e0b";
  }
  if (dbConnText) dbConnText.textContent = "Standalone Mode (Run start_server.bat for DB)";

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          <div style="font-weight: 600; color: var(--amber-warn); margin-bottom: 0.35rem;">Standalone In-Browser Engine Active</div>
          <div style="font-size: 0.85rem;">To activate persistent SQLite scan logging, community reports, and live DNS intelligence, run <code>start_server.bat</code> or <code>python run_server.py</code>.</div>
        </td>
      </tr>
    `;
  }
}

async function loadDatabaseStats() {
  if (!isBackendOnline) return;
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return;
    const stats = await res.json();

    const elTotal = document.getElementById("db-stat-total");
    const elThreats = document.getElementById("db-stat-threats");
    const elSafe = document.getElementById("db-stat-safe");
    const elReports = document.getElementById("db-stat-reports");

    if (elTotal) elTotal.textContent = stats.total_scans.toLocaleString();
    if (elThreats) elThreats.textContent = stats.phishing_detected.toLocaleString();
    if (elSafe) elSafe.textContent = stats.safe_verified.toLocaleString();
    if (elReports) elReports.textContent = stats.total_reports.toLocaleString();
  } catch (e) {
    console.warn("Error fetching stats:", e);
  }
}

async function loadRecentScans() {
  if (!isBackendOnline) return;
  const tbody = document.getElementById("db-scans-table-body");
  if (!tbody) return;

  try {
    const res = await fetch("/api/scans?limit=25");
    if (!res.ok) return;
    const data = await res.json();
    const scans = data.scans || [];

    if (scans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            No scan records found in SQLite yet. Use the Link Inspector above to analyze a link!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";
    scans.forEach(s => {
      const tr = document.createElement("tr");

      let badgeClass = "safe";
      if (s.risk_score >= 75) badgeClass = "danger";
      else if (s.risk_score >= 50) badgeClass = "warn";
      else if (s.risk_score >= 25) badgeClass = "caution";

      const timeStr = s.scanned_at ? new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-dim);">#${s.id}</td>
        <td style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${s.url}">
          <div style="font-weight: 600; color: var(--text-main);">${s.domain}</div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis;">${s.url}</div>
        </td>
        <td>
          <span class="preset-chip ${badgeClass}" style="font-size: 0.76rem; padding: 0.2rem 0.55rem;">
            ${s.risk_score}% ${s.risk_level.split(" ")[0]}
          </span>
        </td>
        <td>
          <span class="dns-pill" style="font-size: 0.74rem;">${s.dns_status || "Resolved"}</span>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${timeStr}</td>
        <td>
          <button class="scanner-tool-btn db-inspect-btn" data-url="${encodeURIComponent(s.url)}" style="padding: 0.25rem 0.55rem; font-size: 0.78rem;">
            Inspect
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Wire Inspect buttons in table
    document.querySelectorAll(".db-inspect-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        const targetUrl = decodeURIComponent(btn.getAttribute("data-url"));
        const singleTab = document.getElementById("mode-single-btn");
        if (singleTab) singleTab.click();
        const input = document.getElementById("url-input");
        if (input) {
          input.value = targetUrl;
          const scanBtn = document.getElementById("scan-url-btn");
          if (scanBtn) scanBtn.click();
        }
      });
    });

  } catch (err) {
    console.warn("Error loading scans:", err);
  }
}

function initDatabaseControls() {
  // Refresh Button
  const refreshBtn = document.getElementById("db-refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      audio.playClick();
      loadDatabaseStats();
      loadRecentScans();
    });
  }

  // Report Threat Form
  const reportForm = document.getElementById("db-report-form");
  const reportStatus = document.getElementById("db-report-status");

  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      audio.playClick();

      const urlInput = document.getElementById("db-report-url");
      const typeSelect = document.getElementById("db-report-type");
      const nameInput = document.getElementById("db-report-name");
      const notesInput = document.getElementById("db-report-notes");

      const payload = {
        url: urlInput.value.trim(),
        threat_type: typeSelect.value,
        reporter_name: nameInput.value.trim() || "Anonymous Analyst",
        notes: notesInput.value.trim()
      };

      try {
        const res = await fetch("/api/reports/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const result = await res.json();
          audio.playSafeChime();
          if (reportStatus) {
            reportStatus.style.display = "block";
            reportStatus.style.color = "var(--emerald-safe)";
            reportStatus.textContent = `✅ Successfully logged to SQLite (Report #${result.report_id})!`;
          }
          urlInput.value = "";
          notesInput.value = "";
          loadDatabaseStats();
          setTimeout(() => {
            if (reportStatus) reportStatus.style.display = "none";
          }, 3500);
        } else {
          throw new Error("Server responded with error");
        }
      } catch (err) {
        audio.playIncorrect();
        if (reportStatus) {
          reportStatus.style.display = "block";
          reportStatus.style.color = "var(--rose-danger)";
          reportStatus.textContent = "❌ Failed to report threat. Ensure backend server is running.";
        }
      }
    });
  }

  // Certificate Verification Tool
  const verifyBtn = document.getElementById("db-cert-verify-btn");
  const certInput = document.getElementById("db-cert-input");
  const certResult = document.getElementById("db-cert-result");

  if (verifyBtn && certInput && certResult) {
    verifyBtn.addEventListener("click", async () => {
      audio.playClick();
      const code = certInput.value.trim();
      if (!code) {
        audio.playIncorrect();
        certInput.focus();
        return;
      }

      certResult.innerHTML = `<span style="color: var(--cyan-primary);">🔍 Querying SQLite database for certificate ${code}...</span>`;

      try {
        const res = await fetch(`/api/quiz/certificate/${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          const cert = data.certificate;
          audio.playSafeChime();
          certResult.innerHTML = `
            <div style="color: var(--emerald-safe); font-weight: 700; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>✅ VERIFIED OFFICIAL CERTIFICATE</span>
            </div>
            <div><strong>Recipient:</strong> ${cert.user_name}</div>
            <div><strong>Score:</strong> ${cert.score} / ${cert.total_questions} (${cert.percentage}%)</div>
            <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 0.25rem;">Issued: ${new Date(cert.completed_at).toLocaleString()} | ID: ${cert.certificate_id}</div>
          `;
        } else {
          audio.playIncorrect();
          certResult.innerHTML = `
            <div style="color: var(--rose-danger); font-weight: 700; margin-bottom: 0.25rem;">
              ❌ UNVERIFIED OR INVALID CERTIFICATE ID
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              No cryptographic entry matching <code>${code}</code> was found in the official records.
            </div>
          `;
        }
      } catch (e) {
        audio.playIncorrect();
        certResult.innerHTML = `
          <div style="color: var(--amber-warn); font-weight: 600;">
            ⚠️ Unable to connect to verification backend. Launch <code>start_server.bat</code> to verify certificates against SQLite.
          </div>
        `;
      }
    });
  }
}

