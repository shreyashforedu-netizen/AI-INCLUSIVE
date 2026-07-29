# 🌍 AI for Inclusive Opportunities

> AI-powered platform for career guidance, scholarships, and government schemes.  
> Supporting **SDG 1 (No Poverty)** and **SDG 10 (Reduced Inequalities)** — UN Agenda 2030.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10 or higher** → [Download from python.org](https://www.python.org/downloads/)
  > ✅ During installation, check **"Add Python to PATH"**

### Step 1 — Install Dependencies
Open a terminal (PowerShell or CMD) in this folder and run:
```bash
pip install -r requirements.txt
```

### Step 2 — Run the App
```bash
python app.py
```

### Step 3 — Open in Browser
Visit: **http://localhost:5000**

---

## 📁 Project Structure

```
AI-FOR INCLUSIVE/
├── app.py                    ← Flask backend (routes + AI engine)
├── requirements.txt          ← Python dependencies
├── database/
│   └── db.py                 ← SQLite models (UserProfile, Recommendation, Contact, Notification)
├── notifications/
│   └── notifier.py           ← In-app notification system
├── static/
│   ├── css/                  ← Page stylesheets
│   ├── js/                   ← Page JavaScript modules
│   └── videos/               ← Place hero-bg.mp4 here (see below)
└── templates/                ← HTML pages (Jinja2)
    ├── base.html
    ├── index.html            ← Home
    ├── about.html
    ├── finder.html           ← Opportunity Finder (3-step form)
    ├── recommendations.html  ← AI Dashboard
    ├── dashboard.html        ← Stats Dashboard
    └── contact.html
```

---

## 🎥 Background Video (Optional)

To enable the hero background video:
1. Download a free video from [Pexels Video 3196572](https://www.pexels.com/video/3196572/)
2. Rename it to `hero-bg.mp4`
3. Place it at `static/videos/hero-bg.mp4`

**Add ambient audio** (optional):
```bash
ffmpeg -i video.mp4 -i music.mp3 -shortest static/videos/hero-bg.mp4
```
Get free music from [Pixabay Music](https://pixabay.com/music/search/hopeful/)

The page works beautifully with the animated CSS fallback even without the video.

---

## 🌐 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, SDG badges, features, stats |
| About | `/about` | Inclusion, poverty causes, AI solutions, mission/vision |
| Opportunity Finder | `/finder` | 3-step profile form |
| AI Recommendations | `/recommendations` | Jobs, courses, scholarships, schemes, roadmap |
| Dashboard | `/dashboard` | Stats, profile completion, progress |
| Contact | `/contact` | Feedback form, FAQ, social links |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit` | Submit profile → generate recommendations |
| `GET` | `/api/recommendations/<id>` | Fetch recommendations by user ID |
| `GET` | `/api/recommendations/latest` | Fetch most recent recommendation |
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/contact` | Submit contact/feedback form |
| `GET` | `/api/notifications` | Fetch all notifications |
| `POST` | `/api/notifications/read` | Mark all notifications as read |

---

## 🎨 Design System

- **Font:** Outfit + Inter (Google Fonts)
- **Colors:** Dark Navy `#060b1f` + Indigo `#6c63ff` + Gold `#FFD700`
- **Style:** Glassmorphism cards, gradient buttons, smooth animations
- **Icons:** Font Awesome 6

---

## 📱 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ 3-step Opportunity Finder form with real-time validation
- ✅ AI rule-based recommendation engine (jobs, courses, scholarships, schemes)
- ✅ Notification bell with live badge + slide-in panel
- ✅ Toast notifications
- ✅ Scroll reveal animations
- ✅ Animated counters
- ✅ Profile completion ring chart
- ✅ Opportunity score gauge
- ✅ Career roadmap timeline
- ✅ Star rating in contact form
- ✅ Video background with mute/unmute toggle (when video file is added)

---

## 📞 Support

- Email: support@aiinclusive.org  
- Built with ❤️ for SDG 1 & SDG 10 | Made in India 🇮🇳
