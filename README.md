# WORK BRIDGE 🌉

> **Local Work. Trusted People. Simple Access.**

An India-focused local employment and work-connection platform connecting people who need work with employers who need workers.

Designed especially for daily-wage workers, skilled and semi-skilled workers, practical learners without formal certificates, rural/semi-urban citizens, low-literacy users, first-time smartphone users, and employers seeking reliable nearby help quickly.

---

## 🌟 Key Features

- **Civic & Accessible UI:** Designed with high contrast, large touch targets (44px+), minimal cognitive load, and clean public-service aesthetics (Navy `#123B63`, Blue `#1E5A8A`).
- **13 Indian Languages:** Instant switching across English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Assamese (অসমీয়া), and Urdu (اردو). Language is completely independent of location.
- **Transparent Two-Sided Trust System:** No arbitrary black-box scores. Separates **Identity Verification** (KYC) from **Skill Verification** (Self-declared vs. Evidence vs. Platform Work History). Certificates are **never mandatory** for basic participation.
- **Voice-First Experience:** 
  - `🎤 Speak to Find Work` via Web Speech API with NLP intent extraction.
  - `🔊 Listen` speech synthesis audio read-outs for job cards and requirements.
- **Deterministic Match Engine:** Explainable 5-factor scoring (Skill 40%, Distance 25%, Wage 15%, Availability 10%, Duration 10%) with visible match reasons.
- **Complete Work Lifecycle:** Request Sent ➔ Employer Review ➔ Accepted ➔ Work Started ➔ Completed ➔ Payment Confirmation ➔ 2-Way Rating.
- **Service Recovery & Replacement Engine:** When problems arise (worker delayed, incomplete work), employers can immediately find and select nearby alternative workers.
- **Admin Trust & Safety Portal:** Comprehensive oversight of verifications, dispute resolution, replacement requests, audit trails, and deterministic suspicious-job detection.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **UI Components & Icons:** Lucide React, Radix UI primitives, Tailwind Merge, Class Variance Authority
- **State Management:** Zustand
- **Speech Integration:** Web Speech API (SpeechRecognition + SpeechSynthesis)

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm / yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/work-bridge.git

# Navigate into the project directory
cd work-bridge

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The production assets will be built in the `dist/` directory.

---

## 📱 Interactive Demo Profiles

You can toggle between demo accounts directly using the header switcher:
- **Worker Demo:** Ramesh Kumar (Mason, 8 years practical experience, 18 completed jobs, 4.8★ rating, no formal certificate).
- **Employer Demo:** Venkat Rao (Construction Contractor, 24 completed contracts).
- **Admin Demo:** Trust & Safety Management Portal.

---

## 📄 License
MIT License. Free to use, adapt, and build upon for social impact.
