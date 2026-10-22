<div align="center">

<br />

<img src="tinkl-logo-paw3.png" alt="TINKL Logo" width="120" height="120" />

<br />

# TINKL.

### Every Potty. Perfectly Tracked.

**A premium pet care progressive web app — beautifully designed, works offline, syncs to the cloud.**

<br />

[![Deploy Status](https://img.shields.io/badge/Cloudflare_Pages-Live-orange?style=for-the-badge&logo=cloudflare&logoColor=white)](https://tinkl.pages.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://tinkl.pages.dev)
[![Offline First](https://img.shields.io/badge/Offline-First-34d399?style=for-the-badge&logo=serviceworker&logoColor=white)](#)
[![No Server](https://img.shields.io/badge/No_Backend-IndexedDB-60a5fa?style=for-the-badge&logo=databricks&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-f472b6?style=for-the-badge)](#license)

<br />

---

<br />

</div>

## What is TINKL?

TINKL is a **premium pet care tracker** built as a single-file Progressive Web App. It runs entirely in the browser — no accounts, no subscription, no backend required for core features. Every log, reminder, and health record is stored locally in IndexedDB, and optionally synced to the cloud via a Cloudflare Worker + Durable Object so your data follows you across every device.

Think of it as the pet care journal you always wished Apple built — dark glass UI, instant logging, smart reminders, health records, charts, and cloud backup — all in a ~400KB file you can install on your home screen in seconds.

<br />

---

<br />

## Features

<br />

### 🐾 Multi-Pet Management

Add unlimited pets with photos, breed, birthdate, and weight history. Switch between pets instantly from any screen. Every piece of data — logs, meds, reminders, notes — is scoped to the active pet.

<br />

### ⚡️ One-Tap Activity Logging

Log any care event in one tap from the dashboard. Ten activity types supported out of the box:

| Activity | | Activity | |
|---|---|---|---|
| 💧 Pee | Potty tracking | 🍽 Feed | Meal times |
| 💩 Poop | Bowel tracking | 💦 Water | Hydration |
| ⚠️ Accident | Incident log | 💊 Med | Medication |
| 🚶 Walk | Exercise | 🎾 Play | Enrichment |
| 🛁 Bath | Grooming | ✂️ Groom | Styling |

Every log captures a timestamp, optional note, and links to the active pet automatically.

<br />

### 🔔 Smart Reminders & Alarms

Set recurring or one-time reminders for any activity type. Reminders fire via the Web Notifications API — even on iOS 16.4+ when installed as a home screen app. Includes:

- **Quiet Hours** — suppress notifications between custom start/end times
- **Per-type muting** — silence specific activity types without turning off all alerts
- **Snooze** — configurable snooze duration (default 5 min)
- **Vibration patterns** — custom haptic feedback on mobile

<br />

### 🏥 Health Records

Track your pet's full medical picture:

- **Medications** — name, dose, frequency, start/end dates, notes
- **Vaccinations** — vaccine name, date given, due date, vet name, notes
- **Weight history** — logged weights with full Chart.js timeline
- **Health notes** — free-form journal entries with timestamps

<br />

### 📊 Stats & Insights

A dedicated stats view breaks down activity over time with Chart.js visualisations:

- **Activity distribution** — doughnut chart showing breakdown across all log types
- **Daily frequency** — bar chart of logs per day for the selected time window
- **Time range filter** — 7 days / 30 days / 90 days / all time
- **Weight trend** — line chart with min/max annotations

<br />

### 📅 History & Calendar

Browse a month-view calendar where days with logged activity are highlighted. Tap any date to see a full list of that day's logs with times, types, and notes. Scroll back through any month.

<br />

### ☁️ Cloud Sync

Back up and restore your entire dataset to Cloudflare's edge network with one tap:

- **Backup** — serialises all IndexedDB stores and pushes to a Cloudflare Durable Object
- **Restore** — pulls the latest snapshot and merges by timestamp (newer entry always wins)
- **Delete** — permanently wipe cloud data from the privacy settings
- **Auto-sync** — background push every 5 minutes when the app is open
- **Device ID** — stable anonymous device identifier (no account required)
- **Auth** — Bearer token protection on the Worker endpoint

<br />

### 🎨 Five Themes

TINKL ships with five hand-crafted themes, switchable from Settings with a single tap:

| Theme | Aesthetic |
|---|---|
| **Dark** | Deep space — the default. Near-black with indigo glass cards |
| **Light** | Frosted white — bright glass, subtle purple-pink gradients |
| **Aurora** | Teal midnight — emerald and cyan glow against near-black |
| **Sunset** | Warm dusk — amber and rose gradients |
| **Midnight** | Cobalt night — deep blue with electric highlights |

All themes use CSS custom properties and animated ambient background gradients.

<br />

### 📲 PWA — Install Anywhere

TINKL is a fully compliant Progressive Web App:

- **Installable** on iOS (Add to Home Screen), Android, macOS, and Windows via Chrome/Edge
- **Offline-first** — the service worker pre-caches the app shell so it loads with zero network
- **App-like** — no browser chrome, status bar integration on iOS, custom splash screen
- **Notification routing** — tapping a notification opens the right screen even when the app is closed

<br />

---

<br />

## Tech Stack

| Layer | Technology |
|---|---|
| **App shell** | Single-file HTML — CSS + JS inline, zero build step |
| **Storage** | IndexedDB (via custom `DB` helper) |
| **Charts** | Chart.js 4.4 (CDN, cached by service worker) |
| **Offline** | Service Worker with cache-first / stale-while-revalidate strategies |
| **Cloud sync** | Cloudflare Worker (routing) + Durable Objects (strongly consistent KV) |
| **Hosting** | Cloudflare Pages (static, global CDN) |
| **Icons** | Custom inline SVG icon set (no external icon font) |

No React. No bundler. No npm. Open `index.html` and it runs. Deploy the worker with one command.

<br />

---

<br />

## Quick Start

### Run Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/tinkl.git
cd tinkl

# Open in browser — no build step needed
open index.html
# or: npx serve .
```

The app works fully offline with no cloud sync. To enable cloud backup, see the full setup guide below.

<br />

### Deploy to Cloudflare (Full Setup)

See **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** for the complete step-by-step guide.

The short version:

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Authenticate
wrangler login

# 3. Deploy the Worker + Durable Object
wrangler deploy

# 4. Set the API secret (must match API_SECRET in index.html)
wrangler secret put API_SECRET

# 5. Connect the repo to Cloudflare Pages in the dashboard
#    Build command: (blank)   Output directory: /
```

<br />

---

<br />

## Project Structure

```
tinkl/
├── index.html                 # The entire app — HTML, CSS, JS in one file
├── sw.js                      # Service worker — offline caching + notification routing
├── manifest.webmanifest       # PWA manifest — icons, display mode, theme
├── _headers                   # Cloudflare Pages headers — cache policies, security
├── wrangler.toml              # Cloudflare Worker config — DO bindings, migrations
│
├── worker/
│   ├── worker.js              # Worker entrypoint — CORS, auth, routing
│   └── durable-object.js      # TinklBackup DO — persistent KV backup storage
│
├── tinkl-logo-paw3.png        # 512×512 app icon
├── tinkl-logo-paw3-192.png    # 192×192 app icon (PWA required)
└── ...                        # Additional icon sizes + favicons
```

<br />

---

<br />

## Configuration

All runtime configuration lives at the top of the `SYNC` object in `index.html`:

```js
const SYNC = {
  WORKER_URL: 'https://tinkl-sync.yoursubdomain.workers.dev',
  API_SECRET: 'your-secret-here',   // Must match `wrangler secret put API_SECRET`
  SYNC_INTERVAL_MS: 5 * 60 * 1000, // Auto-sync interval (default: 5 min)
  DATA_VERSION: 1,                  // Bump when you change the DB schema
};
```

The Worker reads `env.API_SECRET` — set it with:

```bash
wrangler secret put API_SECRET
# Enter value: your-secret-here
```

The secret is never committed to source control. It lives encrypted in Cloudflare's edge environment.

<br />

---

<br />

## Data & Privacy

- **All data is yours.** Nothing is sent anywhere without your explicit action.
- Core data lives in **IndexedDB on your device** — private, local, persistent.
- Cloud backup is **opt-in** and stored in a Cloudflare Durable Object scoped to your API secret.
- **No analytics**, no tracking pixels, no third-party scripts beyond Chart.js (loaded from a pinned CDN URL and cached offline after first load).
- Cloud backup can be permanently deleted at any time from **Settings → Delete Cloud Backup**.

<br />

---

<br />

## Browser Support

| Browser | Install as PWA | Notifications | Cloud Sync |
|---|---|---|---|
| Chrome (Android/Desktop) | ✅ | ✅ | ✅ |
| Safari (iOS 16.4+) | ✅ | ✅ (home screen only) | ✅ |
| Edge (Desktop) | ✅ | ✅ | ✅ |
| Firefox | ❌ (no install) | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ |

<br />

---

<br />

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

When contributing:

- Keep the zero-build-step philosophy — no bundler, no transpiler required
- All JS is ES2020+ targeting modern browsers only — no IE, no polyfills
- Test offline behaviour by throttling to "Offline" in DevTools → Network
- Test notifications by setting a reminder 1 minute in the future

<br />

---

<br />

## License

MIT — see [LICENSE](LICENSE) for details.

<br />

---

<br />

<div align="center">

Made with care for the dogs, cats, and creatures that make life worth tracking.

<br />

**[⭐ Star this repo](https://github.com/yourusername/tinkl)** · **[🐛 Report a bug](https://github.com/yourusername/tinkl/issues)** · **[💡 Request a feature](https://github.com/yourusername/tinkl/issues)**

<br />

*TINKL — Every Potty. Perfectly Tracked.*

</div>
