# GemmaGuru

AI Tutor for NCERT topics.

## Project Structure

```
gemmaguru/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + PWA meta tags
│   ├── page.tsx                  # Language selection / onboarding
│   ├── ask/
│   │   └── page.tsx              # Main chat/ask screen
│   ├── progress/
│   │   └── page.tsx              # Dashboard + charts
│   └── api/
│       ├── ask/route.ts          # RAG + Gemma stream endpoint
│       ├── embed/route.ts        # Embedding generation
│       └── tts/route.ts          # TTS trigger (optional server-side)
│
├── components/
│   ├── VoiceInput.tsx            # Mic button + Web Speech API
│   ├── ImageCapture.tsx          # Camera + Tesseract OCR
│   ├── ChatBubble.tsx            # Message display + TTS play button
│   ├── FollowUpChips.tsx         # Suggested next questions
│   ├── ProgressChart.tsx         # Recharts radar/bar charts
│   ├── StreakBadge.tsx            # Gamification component
│   └── LanguagePicker.tsx        # Marathi / Hindi / Hinglish
│
├── lib/
│   ├── ollama.ts                 # Ollama API client (chat + embeddings)
│   ├── rag.ts                    # pgvector search + context builder
│   ├── prompt.ts                 # Prompt templates per language/level
│   ├── idb.ts                    # IndexedDB helpers (idb library)
│   ├── firebase.ts               # Firestore sync client
│   ├── stt.ts                    # Speech-to-text (Web Speech API)
│   └── tts.ts                    # Text-to-speech (SpeechSynthesis)
│
├── scripts/
│   ├── ingest.ts                 # NCERT PDF → chunks → pgvector
│   └── seed-demo.ts              # Seed 2 weeks of fake student data
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker (via next-pwa)
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   └── offline.html              # Offline fallback page
│
├── docker-compose.yml            # PostgreSQL + pgvector
├── next.config.js                # next-pwa config
├── .env.local                    # OLLAMA_URL, FIREBASE_*, DATABASE_URL
└── README.md
```
