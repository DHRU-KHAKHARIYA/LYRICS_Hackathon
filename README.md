# LyricFlow

An AI-powered lyrics analysis platform that fetches, romanizes, translates, and enriches song lyrics — built for music lovers who want to truly understand and learn songs in any language.

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## What It Does

Search any song → the pipeline fetches lyrics → detects language per line → romanizes → translates → serves everything in a rich interactive UI.

**Three unique features:**
- **Cultural Context Annotations** — explains Korean/Japanese cultural references that translation alone can't capture
- **Emotional Arc** — maps the emotional journey of a song section by section, visualized as a waveform chart
- **Practice Mode** — flips the layout so romanized text is the primary focus, with audio pronunciation per line

---

## Demo

https://github.com/user-attachments/assets/placeholder

---

## Tech Stack

### Backend
| Library | Purpose |
|---|---|
| FastAPI | REST API server |
| lyricsgenius | Fetch lyrics from Genius |
| langdetect | Language detection fallback |
| hangul-romanize | Korean → romanized text |
| pykakasi | Japanese → Hepburn romanization |
| openai | GPT-based translation |
| uvicorn | ASGI server |

### Frontend
| Library | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| Framer Motion | Animations and transitions |
| Recharts | Emotion arc chart |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| iTunes Search API | Song autocomplete (free, no key) |
| Web Speech API | Browser-native audio pronunciation |

---

## Project Structure

```
LYRICS_Hackathon/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── lyrics.py       # Raw lyrics endpoints
│   │   │   └── process.py      # Full pipeline endpoint
│   │   └── server.py           # FastAPI app + static file serving
│   ├── core/
│   │   ├── fetcher.py          # Genius lyrics fetcher
│   │   ├── detector.py         # Per-line language detection
│   │   ├── romanizer.py        # Korean + Japanese romanization
│   │   ├── translator.py       # GPT translation
│   │   ├── preprocess.py       # Line cleaning and section parsing
│   │   └── processor.py        # Pipeline orchestrator
│   ├── models/
│   │   ├── lyrics.py           # Fetch request/response models
│   │   └── process.py          # Processed output models
│   └── config.py               # Settings via pydantic
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Search bar with iTunes autocomplete
│   │   │   ├── Sidebar.jsx     # Song info, emotion arc, member stats
│   │   │   ├── LyricsPanel.jsx # Grouped lyrics with mode toggle
│   │   │   ├── LyricCard.jsx   # Reading + Practice mode cards
│   │   │   ├── EmotionArc.jsx  # Recharts waveform chart
│   │   │   ├── MemberStats.jsx # Animated member line breakdown
│   │   │   └── BackgroundOrbs.jsx # Animated gradient background
│   │   ├── utils/
│   │   │   └── enrichLyrics.js # Emotion tagging + cultural notes
│   │   └── App.jsx             # Root component + state
│   └── package.json
├── main.py                     # CLI: process / build / serve
├── requirements.txt
└── .env.example
```

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Genius API token — [get one here](https://genius.com/api-clients)
- OpenAI API key — [get one here](https://platform.openai.com/api-keys)

### 1. Clone and install

```bash
git clone https://github.com/DHRU-KHAKHARIYA/LYRICS_Hackathon.git
cd LYRICS_Hackathon

# Python dependencies
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:
```
GENIUS_API_TOKEN=your_genius_token
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

---

## Running

### Development (recommended)

Two terminals — instant hot reload on frontend changes:

```bash
# Terminal 1: backend
python main.py serve

# Terminal 2: frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Production (single server)

```bash
# Build frontend once
python main.py build

# Serve everything on one port
python main.py serve
```

Open **http://localhost:8000**

---

## Pipeline

```
User searches song
        ↓
iTunes API → autocomplete suggestions
        ↓
POST /api/v1/process { title, artist }
        ↓
1. Fetch raw lyrics from Genius
2. Clean & split into individual lines
3. Detect language per line (Unicode range analysis + langdetect fallback)
4. Romanize non-English lines (hangul-romanize for Korean, pykakasi for Japanese)
5. Translate non-English lines via GPT
6. Return structured JSON
        ↓
Frontend enriches client-side:
- Emotion per section (rule-based mapping)
- Cultural notes (Korean keyword matching)
- Member stats (parsed from section labels)
- Emotion arc data points (for chart)
```

**Key design decision:** Language detection runs per line, not per song. BTS songs can switch between Korean and English mid-verse — per-line detection handles this correctly.

---

## Supported Languages

| Language | Fetch | Detect | Romanize | Translate | Audio |
|---|---|---|---|---|---|
| Korean | ✅ | ✅ | ✅ | ✅ | ✅ |
| Japanese | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chinese | ✅ | ✅ | ❌ | ✅ | ✅ |
| English | ✅ | ✅ | ❌ | ❌ | ✅ |
| Other | ✅ | ✅ | ❌ | ✅ | depends on OS |

---

## CLI Commands

```bash
# Process a song and save to file
python main.py process "Dynamite" "BTS" --output output/result.json

# Build the React frontend
python main.py build

# Start the server
python main.py serve
```

---

## License

MIT
