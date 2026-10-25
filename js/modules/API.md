# TINKL PWA — JS Module API

ES6 modules extracted from `js/legacy.js` (reference only, never shipped).
Named exports only; nothing is attached to `window`/`globalThis`.
`state.js` and `db.js` are leaves (zero imports). `js/app.js` is the only
module with side effects on import (bootstrap entry point, no exports).

## modules/icons.js
- `ICONS` — map of icon name → inline SVG inner markup (currentColor, 1em).
- `Icon(name, {label}?)` — returns a ready-to-interpolate `<svg>` string for an icon name (empty string for unknown names).
- `GEmoji(char, {label}?)` — wraps a decorative emoji in a span pinned to a stable cross-platform emoji font stack.

## modules/db.js
- `DB` — IndexedDB wrapper (`TINKL_V2`): `init()`, `tx(store, mode)`, `all(store)`, `put(store, value)`, `del(store, id)`, `clear(store)`.

## modules/state.js
- `S` — global app state: entity arrays, `activePetId`, `settings`, calendar/chart/filter UI state, `firedReminders`/`activeAlarms` sets, `online` flag.

## modules/utils.js
- `U` — utilities: `id()`, `esc()`, `fmtTime()`, `fmtDate()`, `rel()`, `greet()`, `isToday()`, `today()`, `safeNum()`, `toKg()`, `kgToLbs()`, `fmtWeight()`, `toast()`, `confirm()` (modal confirm dialog; resolves the modal lazily via dynamic import to avoid a utils↔modal cycle).
- `loadAll()` — loads all IndexedDB stores into `S` (runs `repairLogs`), restores settings + active pet from localStorage.
- `repairLogs(logs)` — one-time self-heal: rewrites legacy `at`-timestamped logs to `ts`.
- `saveSettings()` — persists `S.settings` to localStorage.
- `setActive(id)` — sets the active pet id in `S` and localStorage.

## modules/logTypes.js
- `LOG_TYPES` — log-type registry (pee, poop, accident, feed, water, walk, med, play, bath, groom) with label, emoji, icon, and CSS class.

## modules/vaccineSchedule.js
- `VACCINE_SCHEDULES` — rule-based AAHA/AAFP-derived schedule reference data (general info, not a prescription).
- `vaccinesForSpecies(species)` — schedule entries for a species (plus `both`).
- `findVaccineDef(id)` — look up one schedule entry by id.
- `suggestVaccineNextDue(vaxDef, lastGivenStr, petBirthday)` — next-due date + rationale from last-given date and pet age.

## modules/sync.js
- `SYNC` — Cloud Sync via Durable Object worker: `init()` (device id + 5-min auto-sync), `serialize()`, `pushToCloud()`, `pullFromCloud()`, `merge(cloudBackup)` (newer-wins per record), `autoSync()`, `getByIdFromStore()`, `restoreFromCloud()` (confirm + merge + reload), `deleteCloudBackup()`.

## modules/navigation.js
- `registerView(name, fn)` — registers a view name → render function (wired by `js/app.js`).
- `render(view)` — renders a registered view; unknown names are a no-op.
- `goto(view)` — switches the active `.view`, updates nav/title/sidebar, scrolls to top, dispatches `tinkl:view-change`, then renders.
- `currentView()` — name of the currently active view (defaults to `'dashboard'`).

## modules/modal.js
- `openModal({title, body, actions, onAction, onOpen})` — glass modal; returns `{el, close}`.

## modules/views/dashboard.js
- `renderDashboard()` — hero, stat grid, quick-log grid, recent feed, upcoming reminders, last-of-each list, notif dot.
- `statCard(cls, icon, lbl, val, sub)` — stat tile HTML.
- `shortLast(type)` — relative time of the most recent log of a type.
- `feedRow(l)` — activity feed row HTML (with delete button).
- `emptyRow(m)` — empty-state row HTML.
- `chartsAvailable()` — true when the Chart.js UMD global loaded (and didn't fail).
- `showChartFallback(wrapId, msg?)` — friendly message when Chart.js is unavailable.
- `computeStreak()` — consecutive days with ≥1 log for the active pet.

## modules/views/quickLog.js
- `quickLog(type, note?, ts?)` — one-tap log write for the active pet, then re-renders.
- `showLogPicker()` — modal: activity chooser + date/time/note, saves via `quickLog`.
- `openEditLogModal(logId)` — modal: edit a log's date/time/note or delete it.

## modules/views/pets.js
- `renderPets()` — pet cards grid (per-pet today counts, edit/delete, tap-to-activate).
- `showPetSwitcher()` — modal list to switch the active pet (re-renders dashboard via the navigation registry).

## modules/camera.js
- `openPhotoSourceChooser({onLibrary, onCamera})` — modal: choose library photo vs live camera.
- `openCameraCapture({onCapture, onFallback})` — live `getUserMedia` capture modal, downscales to ≤400px JPEG; falls back to the device picker.
- `openPetModal(pet?)` — add/edit pet form (photo, breed, weight with kg/lbs, birthday, chip, notes); refreshes via the navigation registry on save.

## modules/views/careLog.js
- `renderCare()` — filterable chronological care feed; rows open `openEditLogModal`, trash deletes.

## modules/views/health.js
- `calculateNextMedDue(m)` — next dose timestamp from a med's start + interval (never infers from names).
- `renderHealth()` — meds, vaccinations, weight (chart + list + unit toggle), notes/vet visits.
- `renderWeightChart(ws)` — Chart.js line chart of weight history (Chart.js is a global, never imported).
- `openMedModal(med?)` — add/edit/delete medication.
- `openVacModal(vac?)` — add/edit/delete vaccination (schedule picker + protocol-based next-due suggestion).
- `openWeightModal(w?)` — add/edit/delete weight entry.
- `openNoteModal(note?)` — add/edit/delete note / vet visit.

## modules/views/history.js
- `renderHistory()` — renders the calendar and the selected day.
- `renderCalendar()` — month grid with activity dots, today/selected states.
- `renderDay()` — feed of logs for the selected day.

## modules/views/stats.js
- `renderStats()` — avg interval, longest streak, accidents, totals + Chart.js trend / time-of-day / breakdown charts (Chart.js is a global, never imported).

## modules/reminders.js
- `formatDays(days)` — human label for repeat-day sets (`once`, `every day`, `M T W …`).
- `renderReminders()` — reminder list with toggle switch, edit, delete.
- `openRemModal()` — add-reminder form (type, time, repeat days, auto follow-up, notes).
- `openEditRemModal(remId)` — edit/delete reminder form.
- `getUpcomingAlarms(n)` — next `n` upcoming alarm occurrences with friendly `nextText`.

## modules/insights.js
- `buildInsightData(petId, range)` — structured data object for a pet over day/week/month windows (single source of truth for the grid + narratives).
- `renderInsightStatGrid(d)` — stat tiles from insight data.
- `renderInsightBreakdown(d)` — activity-type percentage bars.
- `renderInsightWeightChart(d)` — weight trend chart (Chart.js is a global, never imported).
- `renderInsightNotesFeed(d)` — notes feed with log-note fallback.
- `buildAIPrompt(d)` — plain-English structured summary used as AI input context (never UI text).
- `generateInsightNarrative(d)` — AI narrative via API with rule-based fallback on failure.
- `buildFallbackNarrative(d)` — deterministic rule-based narrative.
- `renderInsights()` — insights view: range tabs, grid, breakdown, weight chart, notes, vet report, narrative, copy/print buttons.

## modules/settings.js
- `renderSettings()` — theme picker, notification/sound/vibration/quiet-hours switches, snooze, mute-type toggles, cloud sync buttons + status.
- `setTheme(t)` — applies theme (body attr, meta theme-color), persists, re-renders.
- `requestNotifPermission()` — requests Notification permission with graceful fallbacks.
- `showAlarmNotification(r, label, quiet)` — fires via ServiceWorkerRegistration when available (iOS-safe), else `new Notification()`.
- `inQuietHours(d?)` — whether a date falls in the user's quiet-hours window.

## modules/alarms.js
- `fireAlarm(r, isFollowUp?)` — deduped alarm: vibration/sound/notification + action modal (Skip / Snooze / Done); schedules per-reminder auto follow-up.
- `loadFiredLog()` — restores today's fired-reminder dedup set from localStorage.
- `saveFiredLog()` — persists the fired-reminder dedup set.
- `checkAlarms()` — 15s tick: fires due scheduled alarms, snooze expiries, and follow-ups.
- `catchUpMissedAlarms()` — on wake/focus, surfaces reminders missed while the tab was suspended (≤12h lookback).

## modules/birthdays.js
- `loadFiredBirthdaysLog()` / `saveFiredBirthdaysLog(set)` — per-pet-per-year birthday dedup persistence.
- `checkBirthdays()` — fires a once-per-year birthday toast + notification per pet.
- `showBirthdayNotification(p)` — birthday notification via SW registration when available.
- `beep()` — short two-tone WebAudio beep.

## modules/exportImport.js
- `exportJSON()` — downloads a full `tinkl-backup-<ts>.json`.
- `exportCSV()` — downloads `tinkl-logs-<ts>.csv` (pet, type, time, note).
- `importJSON(file)` — imports a backup file into IndexedDB, then reloads.
- `buildVetReport(d)` — deterministic plain-text vet-ready report from insight data (moved here from the Smart Insights section).

## js/app.js
Bootstrap entry point — **the only module with side effects on import** (no exports).
Wires the navigation view registry, runs the scroll-aware nav init, binds all
static buttons/listeners (incl. relocated global click delegation, calendar
buttons, alarm interval + visibility/focus listeners), then runs the init
sequence exactly as legacy: `DB.init → SYNC.init → loadAll → loadFiredLog →
setTheme → goto('dashboard')` (+ `// === LAUNCH PARAM HOOK ===` marker) `→
updateOnlineStatus → catchUpMissedAlarms → checkAlarms → checkBirthdays →
notification permission prompt → SW registration` (with legacy `notif-action`
handling plus `tinkl-open-url` deep-link routing: same-origin `?view=` → `goto(view)`,
otherwise `window.location.href = url`, all in try/catch).

## modules/contactLinks.js  *(pure — no imports, unit-tested)*
- `PROVIDER_TYPES`, `providerTypeLabel(type)`, `cleanPhone(raw)`, `isEmail(raw)`.
- `telHref`, `smsHref(phone, body?)`, `mailHref(email, subject?, body?)`, `mapsHref(address, apple?)`, `isApplePlatform(ua, platform, touch)`.
- `composeRequestMessage({kind, providerName, petName, species, breed, reason, preferred, vetPassUrl, med, ownerName})`, `requestSubject(kind, pet)`, `composeVetPassMessage(...)`, `SHORT_URL_LIMIT`.

## modules/ics.js  *(pure — no imports, unit-tested)*
- `buildICS(events, {calName, now}) → {text, count}` — RFC 5545, CRLF, 75-octet folding, floating local time, stable UIDs.
- `reminderToEvent(rem, {petName, now})`, `appointmentToEvent(appt, {petName, providerName, providerAddress, providerPhone})`.
- `icsEscape`, `foldLine`, `parseLocalDateTime(date, time)`, `toISODate`, `fmtLocal`.

## modules/calendarExport.js
- `saveICS(filename, text)` — native share sheet in installed PWAs, otherwise a download.
- `addReminderToCalendar(rem)`, `addAllRemindersToCalendar()`, `addAppointmentToCalendar(appt)`.

## modules/vetPassLink.js
- `buildVetPassUrl(pet)` — async; full `…/vetpass.html#d=…` URL (payload stays in the fragment).

## modules/sendMessage.js
- `openSendModal({title, provider, subject, body, note})` — Email / Text / Copy / Share hand-off; copies the message when the link would be too long for mailto:/sms:.
- `copyText(text)`.

## modules/providers.js
- `renderProviders()`, `openProviderModal(provider?)`. Record: `{id, type, name, phone, email, address, petIds[], primary, notes, createdAt, updatedAt}`.

## modules/appointments.js
- `renderAppointments()`, `renderApptCard()` (dashboard), `openRequestModal({kind, providerId, petId})`, `openEditApptModal(id)`.
- `saveAppointment(appt)`, `syncApptReminder(appt)`, `upcomingAppointments(n)`, `pendingRequestCount()`, `primaryProviderFor(petId, type)`.
- Record: `{id, kind:'appointment'|'refill', petId, providerId, medId?, reason, preferred, ts, durationMin, status, remindMin, notes, createdAt, updatedAt}`; linked reminder id is `rm_<id>`.

## modules/reminders.js (additions)
- Reminders accept `date: 'YYYY-MM-DD'` (one-time) and `logType: ''` (to-do). `scheduleLabel(r)`, `nextOccurrence(r)`, `addAllRemindersToCalendar()`.

## modules/linkCrypto.js  *(pure — no imports, unit-tested)*
- `encryptForLink(kind, plaintext) → {iv, ct, key}` / `decryptFromLink(kind, {iv, ct, key})` — AES-256-GCM, `kind` bound as additional data.
- `parseLinkFragment('#s=…'|'#r=…') → {kind, id, secret, key} | null`, `buildLinkFragment(kind, parts)`, `b64u`.

## modules/links.js
- `secureLinksAvailable()`, `createSecureLink({kind, label, ttlHours, plaintext}) → {id, expiresAt, url}`, `listLinks()`, `revokeLink(id)`, `linkState(l)`, `clearLinkLabels()`, `TTL_OPTIONS`.
- Friendly labels are stored on-device only; the server gets a generic label.

## modules/appointments.js (additions)
- `checkClinicReplies({force})` — folds clinic replies into the tracker. Records gain `linkId`, `linkExpires`, `clinicReply {status, ts, message, responder, at}`.

## Worker API (links)
- `POST /api/links` (auth) `{kind:'share'|'request', ttlHours:1..720, iv, ct, label?}` → `{id, secret, expiresAt}`
- `GET /api/links` (auth) · `DELETE /api/links/:id` (auth)
- `POST /api/links/:id/open` `{secret}` → `{kind, label, iv, ct, expiresAt, response}` (public; 404 uniform, 410 revoked/expired)
- `POST /api/links/:id/respond` `{secret, status:'confirmed'|'proposed'|'declined', ts?, message?, responder?}` (public, requests only)
