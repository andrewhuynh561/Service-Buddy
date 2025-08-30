# Copilot Coding Agent Onboarding Instructions

## High-Level Repository Overview

**Project Name:** Service-Buddy

**Summary:**
Service-Buddy is an AI-powered agent designed to help Australians navigate government services during stressful life events (e.g., job loss, birth of a child, natural disaster). The agent is powered exclusively by Google Gemini Flash and offers both Basic mode (limited daily usage using our API) and Advanced mode (unlimited with user's API key). The agent provides service recommendations, eligibility explanations, checklists, simulated forms, reminders, and escalation to human help. The MVP focuses on three life events and is tailored for South Australia, but works nationally with federal services.

**Repository Size:** Small to medium (PRD + Next.js application).

**Project Type:** Frontend-focused Next.js application with lightweight backend API routes

**Languages/Frameworks:** Next.js 14, React 18, TypeScript, Tailwind CSS

**Target Runtime:** Node.js 18+, deployed to web (Vercel/Netlify recommended)

---

## Build, Test, and Validation Instructions

**Prerequisites:**
- Node.js 18+ (tested with 18.17.1)
- npm or yarn package manager

**Setup Steps:**
1. **Always navigate to the service-buddy-ui directory first**:
   ```powershell
   Set-Location "service-buddy-ui"
   ```

2. **Install dependencies** (required before any other operations):
   ```powershell
   npm install
   ```

3. **Environment setup** (recommended for full AI functionality):
   - Copy `.env.local` for environment variables
   - Add `GOOGLE_GEMINI_API_KEY=your_key_here` for enhanced AI responses

**Development Commands:**
- **Start dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build for production**: `npm run build`
- **Start production**: `npm start`
- **Lint code**: `npm run lint`

**Validated Working Commands:**
1. `cd service-buddy-ui` → `npm install` → `npm run dev` ✅
2. Dev server starts successfully on port 3000 ✅
3. TypeScript compilation works with some warnings (expected) ✅

**Known Issues & Workarounds:**
- **Node version warning**: TypeScript ESLint requires Node 18.18+, but 18.17.1 works with warnings
- **PowerShell navigation**: Use `Set-Location` instead of `cd` for directory changes
- **TSConfig auto-generation**: Next.js automatically creates tsconfig.json on first run

---

## Project Layout and Architecture

**Current Layout:**
```
Service-Buddy/
├── Product Requirements Document.md (PRD)
├── .github/copilot-instructions.md
└── service-buddy-ui/ (Next.js App)
    ├── app/
    │   ├── api/chat/route.ts (Lightweight backend)
    │   ├── layout.tsx (Root layout)
    │   └── page.tsx (Home page)
    ├── components/
    │   └── ChatInterface.tsx (Main chat component)
    ├── styles/
    │   └── globals.css (Tailwind + custom styles)
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── .env.local (environment variables)
    └── README.md
```

**Key Architecture Facts:**
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom gradient themes
- **Backend**: Lightweight API routes in `/app/api/`
- **State Management**: React hooks (useState, useRef, useEffect)
- **AI Integration**: Google Gemini Flast (exclusive AI provider)

**API Endpoints:**
- `POST /api/chat`: Processes user messages, returns service recommendations (Gemini-powered)
- `GET /api/usage`: Returns current usage statistics for basic mode limits
- Mock data for 3 life events: job_loss, birth, disaster
- Intent detection via keyword matching
- Basic mode: 10 daily AI responses using our Google Gemini Flash API
- Advanced mode: Unlimited responses using user's Google Gemini API key
- Graceful fallback to local processing if API fails

**Configuration Files:**
- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Custom gradients and animations
- `postcss.config.js`: PostCSS for Tailwind
- `tsconfig.json`: Auto-generated TypeScript config

**Development Workflow:**
1. Always work in `/service-buddy-ui/` directory
2. Install dependencies first: `npm install`
3. Start dev server: `npm run dev`
4. App runs on http://localhost:3000
5. Hot reload enabled for development

**Instructions for Coding Agent:**
- **Always navigate to service-buddy-ui directory first** before running any npm commands
- Trust these build instructions - they have been validated and work
- Use the PRD for feature requirements and API design guidance
- The chat interface is fully functional with mock data
- API route handles intent detection and service retrieval
- Only search for additional context if these instructions are incomplete

---

## File Inventory

**Root Directory:**
- `Product Requirements Document.md`: Complete requirements and architecture

**service-buddy-ui/ (Next.js App):**
- `package.json`: Dependencies and scripts
- `README.md`: Setup and usage instructions
- `app/page.tsx`: Main application page
- `app/layout.tsx`: Root layout component
- `app/api/chat/route.ts`: Chat API endpoint
- `components/ChatInterface.tsx`: Main chat component (270+ lines)
- `styles/globals.css`: Tailwind CSS with custom styles
- Configuration: `next.config.js`, `tailwind.config.js`, `postcss.config.js`

---

## Final Notes

**Working Setup:**
- The Next.js application is fully functional and tested
- Development server runs successfully on http://localhost:3000
- Chat interface works with mock data for 3 life events
- Responsive design with gradient theme as requested
- TypeScript compilation works with minor warnings (expected)

**Next Development Steps:**
- Enhance Google Gemini integration with multimodal capabilities
- Implement voice TTS playback functionality
- Add SMS/notification features for reminders
- Integrate with real government service APIs
- Add accessibility features (WCAG 2.2 AA compliance)
- Implement multilingual support

**Critical Reminder:**
Always run commands from the `service-buddy-ui/` directory, not the root!
