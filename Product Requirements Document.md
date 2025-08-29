# Life Event AI Navigator Agent — Product Requirements Document (PRD)

**Tagline:** *From crisis to care — one AI agent that helps Australians understand, access, and complete government services with clarity, empathy, and inclusion.*

---

## 1) Summary

Australians struggle to navigate fragmented government services during stressful life events (birth, job loss, disasters, becoming a carer). This PRD defines a multimodal, inclusive AI agent that provides **navigation** (find the right services, explain eligibility) and **agency** (generate checklists, simulate forms, set reminders, connect to a human).

**MVP (hackathon) focus:** Three demo life events — **Job loss**, **Birth of a child**, **Natural disaster** — tailored initially for South Australia (works nationally with federal services). The agent runs on web/mobile with chat + voice + SMS.

---

## 2) Objectives & Non‑Goals

**Objectives**

* Cut time-to-correct-service by 60% for common life events.
* Improve clarity: ≥80% of users rate answers as “clear” or “very clear”.
* Increase follow-through: ≥50% of users export a checklist or set an SMS reminder.
* Inclusive reach: ≥25% of sessions use accessibility or multilingual features.

**Non‑Goals (MVP)**

* No direct lodgement to government portals (simulate only; deep-link where possible).
* No storage of sensitive PII beyond session unless the user opts in for reminders.
* No case management dashboard for agencies (post‑MVP).

---

## 3) Scope (MVP)

* **Channels:** Web chat UI (desktop/mobile). Voice TTS playback. SMS fallback for updates/reminders.
* **Life events:**

  1. *Job loss*: JobSeeker Payment; Rent Assistance; employment services; multilingual phone numbers.
  2. *Birth of a child*: Medicare enrolment; Parental Leave Pay; Child Care Subsidy (callout only).
  3. *Natural disaster*: Disaster Recovery Payment; state/local relief & housing directories.
* **Agent behaviours:**

  * Intent detection from plain language (e.g., “I lost my job”, “I had a baby”).
  * Service retrieval from indexed datasets; ranking with fairness weighting.
  * Plain‑English (Grade 6) explanations + citations panel.
  * **Checklist generator** with step‑by‑step actions and required documents.
  * **Action simulation**: pre‑fill demo forms; compose email/SMS scripts; set reminders.
  * **Escalation**: surface human help numbers; crisis routing (e.g., 000 for emergencies).

Out of scope: identity verification (myGov), payments, or storing official application data.

---

## 4) Personas (incl. inclusion needs)

* **P1: New parent (CALD)** — prefers Vietnamese; low time; wants a simple checklist and voice readout.
* **P2: Regional jobseeker** — intermittent data; prefers SMS reminders; needs rent support guidance.
* **P3: Older carer** — limited tech confidence; needs large fonts, high contrast, plain language.
* **P4: Disaster‑affected resident** — high stress; wants immediate steps and local relief info.

Accessibility commitments (MVP): WCAG 2.2 AA, keyboard/screen‑reader support, focus states, target sizes, TTS, downloadable checklists, offline‑friendly print view.

---

## 5) Key User Journeys

### A) “I lost my job and can’t pay rent” (Web → SMS)

1. User types message; intent = *job loss*.
2. Agent proposes: JobSeeker Payment, Rent Assistance, employment help.
3. Explainability panel shows *why* (age, residence, income/assets checks; rent threshold).
4. Checklist created (documents, steps, deep links, phone numbers).
5. User opts into SMS reminders (opt‑in consent). First SMS contains deep link to checklist.

### B) “We just had a baby” (Web → Voice)

1. Intent = *birth of a child*.
2. Agent proposes: Medicare enrolment, Parental Leave Pay.
3. Voice playback summarizes steps and documents (Newborn Child Declaration, ID).
4. User prints or saves checklist; can request translated version.

### C) “Flood damaged our house” (Web)

1. Intent = *natural disaster*.
2. Agent proposes: Disaster Recovery Payment (AGDRP) and local relief.
3. Checklist + local contacts; map of nearby service centres (optional toggle).

---

## 6) Functional Requirements

1. **Multimodal input/output**: text, TTS voice; SMS reminders (send + stop commands).
2. **Intent understanding**: detect life events, location (postcode), constraints.
3. **Service retrieval (RAG)**: query federal/state/local service indices; normalize records.
4. **Eligibility explanation**: simple rules extraction (age, residence, income, situation); plain language.
5. **Checklist generator**: per service, produce sequenced tasks with time estimates and docs list.
6. **Explainability panel**: show data badges (dataset name), “why this service”, and source excerpt.
7. **Action simulation**: pre‑filled example forms (mock), call scripts, and email templates.
8. **Reminders**: schedule SMS/email nudges with consent; allow STOP/HELP keywords.
9. **Localization**: translate content to at least 3 languages (e.g., Vietnamese, Arabic, Mandarin).
10. **Accessibility**: WCAG 2.2 AA conformance; high contrast mode; large‑text toggle; keyboard nav.
11. **Logging & analytics**: session transcript (non‑PII), service clicks, checklist exports, consent events.
12. **Crisis guardrails**: detect self‑harm/violence keywords; show 000 and relevant helplines.

---

## 7) Non‑Functional Requirements

* **Performance**: P95 response ≤ 3.0s (cached answers); ≤ 6.0s with retrieval.
* **Availability**: 99.5% for demo; graceful SMS degradation if API down.
* **Privacy**: consent gating; data minimization; at‑rest encryption; delete on request; no model training on user content.
* **Security**: TLS 1.2+; rate limiting; input validation; audit trail for consent and reminders.
* **Safety & trust**: visible citations; disclaimers (“information only, not legal advice”); human handoff.
* **Compliance**: DSS, WCAG 2.2 AA; align with Australia’s AI Ethics Principles and AI in Government Policy (non‑binding for demo).

---

## 8) Data Sources (MVP)

*(Design for pluggability; start with a curated subset.)*

* **Federal**: Services Australia (JobSeeker, Rent Assistance, Parental Leave Pay, Disaster Recovery Payment).
* **Directories**: SAcommunity; MyCommunityDirectory (Adelaide); data.gov.au portal datasets (e.g., National Public Toilet Map for accessibility overlay).
* **Contextual**: ABS SEIFA 2021 (postcode/SA2 vulnerability weighting for fairness); state disaster pages.

**Record normalization fields**

* `service_id`, `title`, `agency`, `jurisdiction` (federal/state/local), `life_event`, `eligibility_rules` (text + rule tags), `required_documents`, `apply_url`, `phone`, `address/coverage`, `languages`, `updated_at`, `source_url`.

**Refresh cadence**: pull nightly for static datasets; hotfix manual updates during demo.

---

## 9) Architecture (MVP)

```
Client (Web/Mobile)
  ├─ Chat UI + Explainability panel + Checklist view
  ├─ TTS player, Large-text toggle, High-contrast mode
  └─ SMS opt-in

Backend (API Gateway)
  ├─ Orchestrator (LLM + policy guardrails)
  ├─ Retrieval Service (vector + keyword index over datasets)
  ├─ Eligibility & Explainability (rules extraction, citation pack)
  ├─ Checklist Service (templater)
  ├─ Localization Service (i18n + glossary)
  ├─ Notifications (SMS/Email)
  └─ Telemetry & Audit (privacy-aware)

Data Layer
  ├─ Dataset ETL (ingest, clean, normalize)
  ├─ Search index (BM25 + embeddings)
  └─ Feature store (postcode, SEIFA decile)
```

**LLM pattern**: *Retrieve → Draft → Ground → Cite → Simplify (grade level) → Verify → Output.*

**Fairness weighting**: re-rank results using location + SEIFA decile to avoid systematically under‑surfacing services for disadvantaged areas. Allow user override.

---

## 10) Trust, Safety & Explainability

* **Dataset badges** in the UI (e.g., ABS / Services Australia / SAcommunity).
* **Inline “Why this?”**: bullet points referencing key rule snippets and location coverage.
* **Crisis handling**: if self‑harm/violence detected → display emergency info and helplines; minimize agent verbosity.
* **Content filters**: no legal/financial advice beyond official wording; prefer deep links to official pages.

---

## 11) Inclusion & Accessibility Features

* **WCAG 2.2 AA**: focus not obscured, target size (min), redundant entry avoidance; consistent help.
* **Language support**: translated summaries; multilingual phone numbers; glossary for plain English terms.
* **Low‑bandwidth mode**: compressed UI, text‑only, SMS step packs.
* **Assistive aids**: TTS on every answer; printable/exportable checklists; high contrast; large font preset.

---

## 12) API Design (prototype)

**POST** `/v1/interpret`

* **Req** `{ message, locale, postcode?, channel }`
* **Res** `{ intent, life_event, entities, confidence }`

**POST** `/v1/services/search`

* **Req** `{ life_event, postcode?, seifa_decile?, limit }`
* **Res** `[{ service_id, title, agency, why:[...], citation:{source, url}, apply_url }]`

**POST** `/v1/checklist`

* **Req** `{ service_id | services:[...], user_prefs:{language, channel} }`
* **Res** `{ steps:[{id, title, desc, docs:[...] , est_minutes, link?}], export:{pdf_url} }`

**POST** `/v1/notify`

* **Req** `{ channel:"sms"|"email", contact, consent_token, schedule:[...] , checklist_id }`
* **Res** `{ status:"scheduled" }`

**POST** `/v1/translate`

* **Req** `{ text, target_lang }`
* **Res** `{ text_translated }`

---

## 13) Data Model (excerpt)

```json
{
  "service_id": "sa_jobseeker",
  "title": "JobSeeker Payment",
  "agency": "Services Australia",
  "jurisdiction": "Federal",
  "life_event": ["job_loss"],
  "eligibility_rules": [
    {"type":"age","value":"22 to Age Pension age"},
    {"type":"residence","value":"Australian resident"},
    {"type":"income_assets","value":"thresholds apply"}
  ],
  "required_documents": ["ID","Bank details","Income info"],
  "apply_url": "https://...",
  "phone": "131 202 (multilingual)",
  "coverage": {"states":["All"], "notes":""},
  "languages": ["en","vi","ar","zh"],
  "updated_at": "2025-08-15",
  "source_url": "https://..."
}
```

---

## 14) UX & UI (demo)

* **Layout**: Left chat; Right explainability panel with dataset badges + rule snippets; Bottom checklist drawer with “Mark done”.
* **Components**: language picker; large‑text switch; “Play audio” button; “Send SMS reminder”.
* **Tone**: empathetic, direct, non‑judgmental. Grade‑6 reading level.

---

## 15) Delivery Plan (hackathon → pilot)

**Day 0 (prep)**: curate 20–30 service records per life event; seed rules; set up search index.

**Day 1**

* Build chat UI skeleton; implement `/interpret` with few-shot prompts.
* Ingest datasets (CSV/JSON) into search index; build `/services/search`.
* Implement explainability panel and checklist templating.

**Day 2**

* Add TTS + language toggle; SMS reminders (webhook handler + STOP/HELP).
* Add disaster flow and postcode‑aware re‑ranking; crisis phrases.
* Polish accessibility (focus order, tab traps, contrast, target size).

**Post‑hack (2–4 wks)**: expand datasets; real-time updates; pilot with community partners; add IVR voice path.

---

## 16) Success Metrics & Evaluation

* **Task success**: correct service identified (human‑labeled test set) ≥90%.
* **Time‑to‑service**: median ≤ 45 seconds to first correct recommendation.
* **Clarity score**: ≥80% “clear/very clear”.
* **Inclusion usage**: ≥25% sessions use language/voice/SMS aids.
* **Fairness**: parity in success across SEIFA deciles (Δ ≤ 5 pp).
* **Safety**: 0 PII leaks in logs; 100% of crisis scenarios show correct helplines.

---

## 17) Risk & Mitigations

* **Out‑of‑date info** → show timestamps, citations; nightly refresh; human curation for demo set.
* **Eligibility nuance** → limit to official wording; disclaimers; deep links.
* **Hallucination** → retrieval‑first prompting; quote‑and‑cite; refusal on low confidence.
* **SMS misuse** → rate limits; opt‑in consent and clear STOP/HELP.
* **Accessibility gaps** → manual audits; use WCAG 2.2 checklists; include screen‑reader QA.

---

## 18) Open Questions

* Which agencies will co‑design content after hackathon?
* What minimal PII (if any) can be retained for reminders under consent?
* Which languages beyond the initial three are highest priority locally?
* What human handoff partners (e.g., Service SA counters, NGOs) for pilot?

---

## 19) Demo Script (2 minutes)

1. Problem framing (life‑event confusion).
2. Live demo: “I lost my job” → recommendations → checklist → SMS reminder.
3. Show explainability panel (dataset badges).
4. Voice playback + language toggle.
5. Wrap with inclusivity stats and roadmap.

---

## 20) Appendix — Sample Checklists (abbrev.)

### A) Job loss

* Create/verify myGov account.
* Gather ID, bank details, income info.
* Check JobSeeker rules (age 22–Age Pension age; residence; income/assets).
* Start claim (deep link) or call multilingual line.
* Ask landlord for statement (for Rent Assistance evidence).

### B) Birth of a child

* Use Newborn Child Declaration from Parent Pack (or birth certificate).
* Enrol baby in Medicare (steps + deep link).
* Check Parental Leave Pay eligibility; choose claim timing; notify employer if relevant.

### C) Natural disaster

* Check Disaster Recovery Payment activation for your LGA.
* Gather ID and evidence of impact.
* Start claim online; list of local relief centres and housing contacts.

---

**End of PRD**
