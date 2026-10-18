# TINKL. — iPhone Smoke Test Checklist (~10 minutes)

**Prerequisite (one time):** deploy the refactored build to a preview URL first —
the live tinkl.pages.dev still serves the OLD single-file app. From `tinkl-pwa/`:

```bash
./build/build.sh . ./dist && cp backend/cloudflare/_headers ./dist/_headers
npx wrangler pages deploy ./dist --project-name=tinkl   # use the preview URL it prints
```

Open the preview URL in Safari on the iPhone for every step below.

## 1. Install (2 min)
- [ ] Safari → Share → **Add to Home Screen** → open from the home screen icon
- [ ] App launches standalone (no Safari address bar), splash screen shows
- [ ] Icon on home screen looks right (paw logo, not a screenshot thumbnail)

## 2. Offline (1 min)
- [ ] With the app open once, turn on **Airplane Mode**, kill the app, relaunch from home screen
- [ ] App shell loads (not the offline fallback page — that only shows on first-ever visit)
- [ ] Turn airplane mode off → app recovers without a manual refresh

## 3. Core logging (3 min)
- [ ] Add a pet (photo, name, breed, weight) → appears in pets grid
- [ ] Dashboard → one-tap **Log Pee** and **Log Poop** → both appear in today's feed with correct time
- [ ] Care Log view shows the entries; delete one → it disappears

## 4. Health (2 min)
- [ ] Add a medication with a daily schedule → adherence % appears on the med row
- [ ] Log a weight → weight chart renders in Insights; breed percentile line shows (if breed known)
- [ ] Add a vaccination with a due date → shows under upcoming

## 5. Radar, reminders, Vet Pass (2 min)
- [ ] Insights → **Health Radar** card renders (may say "not enough data" — that's fine on day one)
- [ ] Set a reminder 2 minutes out → notification fires on time → tapping it opens the app
- [ ] Health → **Vet Pass** → link copies; open it → read-only report renders with your data

## 6. Sync (if the worker is deployed)
- [ ] Settings → Backup → backup succeeds; delete a log, Restore → it comes back

## Report back
For anything that fails: **what you tapped → what you expected → what happened**
(a screenshot of the broken state is gold). Pass/fail per section is enough —
don't debug, just report.
