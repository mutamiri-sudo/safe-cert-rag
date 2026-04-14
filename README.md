# SAFe Practitioner 6.0 — Certification Study Assistant

A RAG-powered Q&A tool that helps aspiring SAFe Practitioners prepare for the SP 6.0 certification exam. Ask questions about any of the 7 exam domains and get instant, sourced answers from a curated knowledge base.

![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![React](https://img.shields.io/badge/React-18-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **7 Exam Domains** — Browse and study all weighted domains (Plan the Work, Deliver Value, etc.)
- **Smart Search (TF-IDF)** — Keyword-based retrieval ranks the most relevant knowledge chunks for your question
- **Source Citations** — Every answer shows which knowledge documents were referenced and their relevance score
- **Exam Tips** — Answers include domain weighting so you know where to focus your study time
- **Quick-Start Questions** — Pre-built prompts to jump right into studying
- **Dark Theme UI** — Clean, modern interface built with React

## Current Status

### V1 — Knowledge Search (Current)
The current version uses **TF-IDF text search** to retrieve relevant SAFe 6.0 content and present structured answers directly from the knowledge base. No external API keys are required — the entire system runs locally with zero cost.

### V2 — AI-Powered Chat (Planned)
A follow-up release will integrate an LLM (e.g., Google Gemini, OpenAI) to provide **conversational, AI-generated answers** grounded in the same knowledge base. This will enable:
- Natural language conversation with follow-up questions
- Practice exam questions with AI-generated explanations
- Personalized study recommendations based on weak areas

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | React 18 |
| Search | TF-IDF with cosine similarity |
| Knowledge Base | 36 curated SAFe 6.0 documents (JSON) |
| Deployment | Vercel (serverless) |

## Exam Quick Facts

| Detail | Value |
|--------|-------|
| Questions | 45 multiple-choice |
| Time | 90 minutes |
| Passing Score | 80% (36/45) |
| Format | Closed book, web-based |
| Free Attempts | 2 (included with course) |
| Retake Fee | $50 |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/safe-cert-rag.git
cd safe-cert-rag

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Run Locally

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
safe-cert-rag/
├── backend/
│   ├── server.js                  # Express server
│   ├── routes/chat.js             # POST /api/chat
│   ├── services/
│   │   ├── tfidfSearch.js         # TF-IDF search engine
│   │   └── rag.js                 # Answer formatting + exam tips
│   └── data/safe-knowledge.json   # 36 SAFe 6.0 knowledge docs
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main app layout
│   │   ├── App.css                # Dark theme styles
│   │   └── components/
│   │       ├── ChatInterface.js   # Chat UI with quick questions
│   │       ├── MessageBubble.js   # Message rendering + sources
│   │       └── DomainSidebar.js   # Exam domain browser
├── api/                           # Vercel serverless functions
│   ├── chat.js
│   ├── domains.js
│   └── health.js
└── vercel.json
```

## Knowledge Base

The knowledge base covers all 7 SP 6.0 exam domains with 36 curated documents sourced from the [official SAFe 6.0 exam study guide](https://support.scaledagile.com/en/articles/9791370-exam-study-guide-sp-6-0-safe-practitioner):

- **Introducing SAFe** (6-12%) — Business agility, Lean-Agile mindset, core values, 10 SAFe principles
- **Forming Agile Teams as Trains** (15-21%) — Team roles, Scrum, Kanban, ART structure
- **Connect to the Customer** (9-14%) — Design thinking, vision, roadmaps, stories & features
- **Plan the Work** (21-25%) — PI Planning, WSJF, estimation, backlog management
- **Deliver Value** (13-18%) — Continuous delivery pipeline, built-in quality, DevOps
- **Get Feedback** (6-12%) — Team/system demos, feedback techniques
- **Improve Relentlessly** (13-18%) — Inspect & Adapt, flow metrics, outcomes

## License

MIT
