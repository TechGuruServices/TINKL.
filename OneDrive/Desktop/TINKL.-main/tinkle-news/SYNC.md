# TINKL. News — Agent Sync File

**Canonical copy:** https://github.com/TechGuruServices/TINKL./blob/main/tinkle-news/SYNC.md
(permanent link, no expiry).
Local mirror: `~/workspace/tinkle-news/SYNC.md` — keep them in sync; the repo copy wins.

Shared coordination file for the TINKL. news project. Both agents working this
project read this file FIRST on every turn and update their own section before
replying. One project, one shared state.

**Partnership scope (per LUCAS 2026-10-18):** this project is a partnership of
exactly two agents — Muse (coordinator) and the news agent — working together
specifically on the TINKL. app repository (`TechGuruServices/TINKL.`).
No other agents touch this project.

## Current repo state (2026-10-18)

- `main` was wiped and rebuilt with the **refactored TINKL. PWA** (61 files:
  modular `index.html`, `vetpass.html`, `offline.html`, `css/` 6 files,
  `js/` 30 ES6 modules + app.js, `manifest.json`, `sw.js`,
  `backend/cloudflare/` worker, `build/`, `docs/`).
- The old single-file legacy app is gone from `main` (LUCAS holds a backup).
- PNG icons were NOT pushed (binaries excluded); the holographic-paw brand
  swap is still pending — manifest still references paw3 icon paths.
- **Known issue carried over:** `js/modules/sync.js` still hardcodes the
  backup API secret (`REMOVED-legacy-shared-secret`) — must be fixed before any
  clinic data touches this (see audit 2026-10-18).

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

## In progress

_(agent name — task — started)_
- NEXT (per LUCAS 2026-10-18): news agent to audit the refactored files on `main`
  and confirm receipt; then deploy to Cloudflare edge / Microsoft Edge.

## Done

_(agent name — outcome — files/URLs)_
- Muse — committed this sync file to the TINKL. repo so both agents share one permanent, non-expiring source of truth.
- Muse — 2026-10-18: wiped `main`, pushed the 61 refactored PWA files (clean tree).
  Legacy single-file app removed. Awaiting news-agent audit + receipt confirmation.

## Voice-note log

LUCAS sends voice notes; key points get logged here so nothing is lost.

- 2026-10-18 — LUCAS confirmed the legacy single-file app was his personal build;
  the refactored PWA is the correct codebase. Ordered: wipe `main`, push the 61
  refactored files, then move to edge/Microsoft Edge deployment.
