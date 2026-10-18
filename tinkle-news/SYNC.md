# TINKL. News — Agent Sync File

Shared coordination file for the TINKL. news project. Both agents working this
project read this file FIRST on every turn and update their own section before
replying. One project, one shared state.

**Canonical location:** this file in the `TechGuruServices/TINKL.` repo.
A local mirror lives at `~/workspace/tinkle-news/SYNC.md` — keep them in sync;
when in doubt, this repo copy wins.

## Agent roster

| Agent | Chat / owner | Status | Last update |
|---|---|---|---|
| Muse (coordinator, this side chat) | side chat 1644bb43 | active | 2026-10-18 |
| news (TINKL. news agent) | _fill in: which chat spawned it_ | _unknown — not visible from here_ | — |

## Coordination protocol

1. **Read this file before acting** on anything TINKL.-news related.
2. **Claim before you build**: write what you're about to do under "In progress"
   with your agent name, so the other agent doesn't duplicate it.
3. **Log when done**: move it to "Done" with the outcome + file paths/URLs.
4. **Conflicts**: if the other agent already claimed it, don't redo it — extend it.
5. **Failover**: if one agent is down or unavailable, the other continues alone
   from this file. Everything needed to pick up the work lives here — no
   private context, no missing pieces.
6. **Brand rules are standing** (do not break these):
   - App is spelled **TINKL.** — trailing period, deliberate. Never "Tinkle".
   - Headline: **"EVERY POTTY, PERFECTLY TRACKED."**
   - Logo: holographic rainbow paw (`~/workspace/tinkle-refactor/tinkl-official-logo.png`).
   - TECHGURU in caps, solo "I" voice on all brand copy.

## Current TINKL. state (2026-10-18)

- Refactored PWA at `~/workspace/tinkle-refactor/tinkl-pwa/` (33 modules, Cloudflare Workers backend).
- Live browser test 2026-10-14: **12/12 checks passed** on preview `https://40ca58c6.tinkl.pages.dev`.
- One real bug found + fixed: `emptyRow` import missing in `js/modules/views/health.js`.
- Launch plan: web artifact `tinkle-launch-plan` + PDF `~/workspace/your_files/tinkl-launch-plan-pdf/tinkl-launch-plan-pdf.pdf` (19 pages).
- Production site `tinkl.pages.dev` still serves the OLD single-file app — do not confuse with previews.
- Real-device iPhone test still open (push notifications, Add to Home Screen).

## In progress

_(agent name — task — started)_
- FIRST JOINT TASK (per LUCAS 2026-10-18): activate/set up for **Microsoft Edge** —
  scope unclear, awaiting LUCAS answer: TINKL. PWA on the Microsoft Store
  (via PWABuilder), or an extension (Review Rocket / DemoGlide) on Edge Add-ons?

## Done

_(agent name — outcome — files/URLs)_
- Muse — committed this sync file to the TINKL. repo so both agents share one permanent, non-expiring source of truth.

## Voice-note log

LUCAS sends voice notes; key points get logged here so nothing is lost.

_(date — summary — decisions)_
