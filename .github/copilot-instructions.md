# Copilot Coding Agent Onboarding Instructions

## High-Level Repository Overview

**Project Name:** Service-Buddy

**Summary:**
Service-Buddy is an AI-powered agent designed to help Australians navigate government services during stressful life events (e.g., job loss, birth of a child, natural disaster). The agent provides service recommendations, eligibility explanations, checklists, simulated forms, reminders, and escalation to human help. The MVP focuses on three life events and is tailored for South Australia, but works nationally with federal services. Channels include web chat, voice playback, and SMS reminders.

**Repository Size:** Small (single PRD file at root; no source code or build scripts yet).

**Project Type:** Early-stage product requirements/design documentation. No implementation code present.

**Languages/Frameworks:** Not yet implemented. Future plans suggest web/mobile frontend, backend API gateway, and data layer (see PRD for architecture).

**Target Runtime:** Not applicable yet; future plans may involve Python, JavaScript/TypeScript, web frameworks, and cloud APIs.

---

## Build, Test, and Validation Instructions

**Current State:**
- No build, bootstrap, test, run, or lint scripts are present.
- No source code, configuration, or CI/CD pipelines exist yet.
- No environment setup required at this stage.
- No validation steps or automated checks are available.

**Instructions:**
- If code is added, always create and document build, test, and validation steps in the README.md and/or relevant scripts.
- If you add CI/CD workflows, document their triggers and validation steps here and in workflow files.
- If you add dependencies, document installation and setup steps.
- Always run `npm install` (for Node.js), `pip install -r requirements.txt` (for Python), or equivalent before building or testing, if such files exist.
- If you encounter build or test errors, document the error and the workaround in this file.

---

## Project Layout and Architecture

**Current Layout:**
- Root: `Product Requirements Document.md` (PRD)
- `.github/`: For Copilot and future workflow/configuration files

**Key Facts:**
- The PRD contains all product requirements, architecture, API design, data model, UX, delivery plan, and validation metrics.
- No source code, scripts, or configuration files are present yet.
- No README.md, CONTRIBUTING.md, or other documentation files exist.
- No build, lint, or test configuration files exist.
- No GitHub Actions or CI/CD workflows are present.

**Instructions for Coding Agent:**
- Trust these instructions and the PRD for all high-level context.
- Only perform additional searches if these instructions or the PRD are incomplete or found to be in error.
- When code is added, update this file with build, test, and validation steps, and document any issues or workarounds.
- If implementing features, use the architecture and API design described in the PRD as your guide.
- If adding new files, prefer descriptive names and document their purpose in the README.md and here.

---

## File Inventory (Root)
- `Product Requirements Document.md`: Comprehensive requirements, architecture, and design for Service-Buddy.

## File Inventory (`.github/`)
- `copilot-instructions.md`: This onboarding file for Copilot coding agent.

---

## Final Notes
- This repository is currently documentation-only. Implementation code, build/test scripts, and configuration files should be added as the project progresses.
- Always update this file and the README.md with new build, test, and validation instructions as the codebase evolves.
- If you encounter missing or ambiguous information, refer to the PRD first, then perform targeted searches only as needed.
