# Patch — AI-Powered IT Support Platform

A full-stack Next.js 16 application providing AI-driven IT support with incident management, chat interface, and PDF knowledge base.

## Features

- **Authentication** — Email/password signup & login with NextAuth.js (JWT sessions)
- **Support Chat** — Device tile-based support initiation + free-text chat interface
- **AI Agent** — Ollama-powered chat using `gemma4:31b-cloud` with RAG from uploaded PDFs
- **PDF Upload** — Upload PDF documents per incident; text extracted and stored for retrieval
- **Incident Management** — Create, track, and resolve incidents with status timeline
- **Escalation Logic** — Automatic escalation when AI cannot resolve the issue
- **Feedback System** — Collect user ratings and resolution notes on incident close

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js v4 (Credentials provider, JWT)
- **AI**: Ollama (`gemma4:31b-cloud`)
- **PDF Parsing**: pdfjs-dist
- **Styling**: Tailwind CSS v4
- **Testing**: Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Ollama running locally with `gemma4:31b-cloud` model

### Setup

1. Clone and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Edit `.env` with your values:

```
MONGODB_URI=mongodb://localhost:27017/patch
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
OLLAMA_URL=http://localhost:11434
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Access | Description |
|---|---|---|
| `/signup` | Public | Create an account |
| `/login` | Public | Log in |
| `/` | Protected | Main support page with device tiles & chat |
| `/incidents` | Protected | List of your incidents |
| `/incidents/[id]` | Protected | Incident detail with timeline & chat |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/signup` | POST | Register new user |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/incidents` | GET/POST | List or create incidents |
| `/api/incidents/[id]` | GET/PATCH | Get or update incident |
| `/api/chat` | POST | Send message, get AI response |
| `/api/upload` | POST | Upload PDF for text extraction |

## Deployment

Deploy on Vercel. Set environment variables in the Vercel dashboard.
