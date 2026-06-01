# Vibemap

**AI-powered semantic map for any GitHub repository.**

Paste a repo URL and instantly get an interactive map that groups files by purpose — auth, UI, API, config, tests. Chat with the codebase, open files, and understand architecture in minutes.

🔗 **Live at [vibemap.nocodly.com](https://vibemap.nocodly.com)**

---

## What it does

- **Semantic map** — AI groups files into logical blocks (auth, UI, API, config, etc.)
- **Chat with your codebase** — ask questions, get answers grounded in the actual code
- **File explorer** — browse and read any file directly in the browser
- **No login required** — works with any public repo instantly

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Claude (Anthropic) |
| Auth | GitHub OAuth |
| Deployment | Railway |

---

## Getting started (local)

```bash
# Clone the repo
git clone https://github.com/nocodly/vibemap.git
cd vibemap

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your keys (see .env.example)

# Run dev
npm run dev
```

---

## Environment variables

See `.env.example` for the full list. You'll need:

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth app
- `ANTHROPIC_API_KEY` — Claude API key
- `SESSION_SECRET` — any random string

---

## Project structure

```
vibemap/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── services/     # GitHub API, AI calls
│       └── store/        # Zustand state
└── server/          # Node.js backend
    └── src/
        ├── routes/       # auth, ai endpoints
        └── index.js      # Express app
```

---

Built by [Nocodly](https://nocodly.com)
