# DSEH Tutor

Personal tutor app for the **University of Milan "Data Science for Economics and Health (DSEH)"** background knowledge test.

## What's included

| Feature | Description |
|---|---|
| **Syllabus Manager** | Paste notes and bibliography chunks per subject |
| **Exam Simulation** | 40 AI-generated questions, 60-min timer, pass/fail report |
| **Topic Practice** | Choose subject, subtopic, difficulty, and question count |
| **Weak-Area Practice** | Auto-detects low-accuracy topics from your history |
| **Dashboard** | Per-subject accuracy bars and weak-area list |
| **Tutor Chat** | AI tutor (Socratic style) with syllabus context |

---

## Prerequisites

- **Node.js 18+** (`node -v`)
- An **Anthropic API key** – get one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install

# Create the environment file
copy .env.example .env
# Then edit backend/.env and paste your Anthropic API key
```

Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
AI_MODEL=claude-sonnet-4-6
PORT=3001
```

Start the backend:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

### 2. Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## Project structure

```
Tutor Agent/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── types.ts              # Shared TypeScript types
│   │   ├── ai/
│   │   │   ├── aiClient.ts       # Anthropic SDK wrapper
│   │   │   └── prompts.ts        # System prompts & builders
│   │   └── routes/
│   │       ├── questions.ts      # POST /api/questions/generate
│   │       └── chat.ts           # POST /api/chat
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Router + layout
│   │   ├── types/index.ts        # TypeScript types & constants
│   │   ├── api/backendApi.ts     # Fetch wrapper for backend
│   │   ├── repositories/         # localStorage CRUD helpers
│   │   │   ├── syllabusRepository.ts
│   │   │   ├── questionRepository.ts
│   │   │   └── attemptRepository.ts
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── SubjectBadge.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── pages/
│   │       ├── Home.tsx
│   │       ├── Syllabus.tsx
│   │       ├── Practice.tsx      # Exam / Topic / Weak-Area modes
│   │       ├── Dashboard.tsx
│   │       └── TutorChat.tsx
│   └── package.json
│
└── README.md
```

---

## How to use

### 1. Add syllabus content
Go to **Syllabus** → click **+ Add Topic** → paste content from your bibliography (e.g., chapters from Varian, MGB, etc.) and assign a subject and optional subtopic. The AI uses this to generate on-topic questions.

### 2. Practice
Go to **Practice** → choose a mode:
- **Exam Simulation** – full 40-question timed test
- **Topic Practice** – focused drill by subject/difficulty
- **Weak-Area Practice** – auto-targets your lowest accuracy topics

### 3. Chat with the tutor
Go to **Tutor Chat** and ask anything:
- "Explain consumer surplus"
- "Give me a hard Statistics question on regression"
- "What's the difference between correlation and causation?"

The tutor will ask you to try first, then guide you step-by-step.

### 4. Track progress
**Dashboard** shows per-subject accuracy, predicted exam score, and weak areas with direct "Practice" buttons.

---

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express + TypeScript (`tsx` for zero-compile dev)
- **AI**: Anthropic Claude via `@anthropic-ai/sdk`
- **Storage**: Browser `localStorage` (no database needed)

---

## Adding a different AI provider

Edit `backend/src/ai/aiClient.ts`. The `callLLM` function is the single integration point – swap in OpenAI or any other provider there.
