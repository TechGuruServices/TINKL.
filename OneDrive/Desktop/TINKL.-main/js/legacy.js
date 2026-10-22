// Verbatim extraction of the single inline <script> from legacy index.html.
// REFERENCE ONLY — Pass 2 refactors this into ES6 modules under js/modules/.

    /* ================ Glass Icon System ================
       Apple/SF-Symbols-style inline SVG icons, replacing native emoji so
       every icon renders identically on every OS and inherits the app's
       theme colors via currentColor (impossible with emoji, whose colors
       are baked in by the OS, not by CSS). Icon(name) returns a ready-to-
       interpolate <svg> string sized 1em square, so it automatically
       matches whatever font-size/color the surrounding element (nav-ic,
       icon-btn, feed-ic, ...) already defines - no CSS changes needed
       anywhere an icon already had a font-size + color.
       GEmoji(char) wraps a genuine decorative emoji so its font stays
       pinned to a stable cross-platform stack. Used only for the handful
       of personal/decorative touches we keep as real emoji rather than
       converting to iconography. */
    const ICONS = {
      home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"/>',
      paw: '<circle cx="7" cy="8" r="1.6"/><circle cx="12" cy="6.2" r="1.6"/><circle cx="17" cy="8" r="1.6"/><path d="M12 12c-3 0-5.2 2-5.2 4.3 0 1.7 1.4 2.7 3 2.2.7-.2 1.4-.5 2.2-.5s1.5.3 2.2.5c1.6.5 3-.5 3-2.2C17.2 14 15 12 12 12Z"/>',
      book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"/>',
      pill: '<g transform="rotate(-45 12 12)"><rect x="4" y="9" width="16" height="6" rx="3"/><line x1="12" y1="9" x2="12" y2="15"/></g>',
      calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>',
      barchart: '<path d="M4 20v-6M10 20V9M16 20v-9"/><path d="M2.5 20h19"/>',
      alarm: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l3 2"/><path d="M5 3 2.5 5.5M19 3l2.5 2.5"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>',
      menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
      moon: '<path d="M20 13.6A8.5 8.5 0 1 1 10.4 4a6.7 6.7 0 0 0 9.6 9.6Z"/>',
      sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/>',
      sparkle: '<path d="M12 3 13.4 9.6 20 11 13.4 12.4 12 19 10.6 12.4 4 11 10.6 9.6Z"/>',
      sunset: '<circle cx="12" cy="10" r="3.5"/><path d="M4 17h16M2.5 20.5h19M6 14l-1.8-1.8M18 14l1.8-1.8M12 4.5V2.5"/>',
      stars: '<circle cx="7" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="17" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/><path d="M12 3 12.9 5.6 15.5 6.5 12.9 7.4 12 10 11.1 7.4 8.5 6.5 11.1 5.6Z"/>',
      comet: '<circle cx="8" cy="16" r="2.2"/><path d="M10.5 13.5 19 5M14 5h5v5"/>',
      gem: '<path d="M5 4h14l3 5-10 11L2 9Z"/><path d="M2 9h20M9 4 7 9l5 11 5-11-2-5"/>',
      wave: '<path d="M2 16c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/><path d="M2 11c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>',
      bell: '<path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14.5 6 10.5Z"/><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0"/>',
      bellOff: '<path d="M6 10.5a6 6 0 0 1 3.3-5.3M13.8 4.9A6 6 0 0 1 18 10.5c0 4 1.5 5.5 1.5 5.5H8.5"/><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0"/><path d="M3.5 3.5l17 17"/>',
      refresh: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>',
      chevronLeft: '<path d="M14.5 5 8 12l6.5 7"/>',
      chevronRight: '<path d="M9.5 5 16 12l-6.5 7"/>',
      trash: '<path d="M4.5 7h15"/><path d="M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2"/><path d="M6.5 7 7.3 19.5A2 2 0 0 0 9.3 21.3h5.4a2 2 0 0 0 2-1.8L17.5 7"/><path d="M10.3 11v6M13.7 11v6"/>',
      trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5.5A2.5 2.5 0 0 0 5 9.9L8 11M16 5h2.5A2.5 2.5 0 0 1 19 9.9L16 11"/><path d="M12 13v3M9 20h6M9.5 20c0-2 .8-2.7 1-4h3c.2 1.3 1 2 1 4"/>',
      trendUp: '<path d="M3.5 17 9.5 11l4 4 6.5-7"/><path d="M16 8h4v4"/>',
      trendDown: '<path d="M3.5 7 9.5 13l4-4 6.5 7"/><path d="M16 16h4v-4"/>',
      flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6 0-3-1.8-4.7-2.6-7-1 1.6-1.7 2.4-2.4 2.4C13 8 13.5 5 11.5 3c.3 3-2.6 4.4-4 7-.8 1.5-1.5 2.9-1.5 5 0 3.4 2.5 6 6 6Z"/><path d="M12 21a3 3 0 0 0 1.5-5.5c-.6.9-1 1.3-1.5 1.3s-.9-.4-1.4-1.2A3 3 0 0 0 12 21Z"/>',
      check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
      wifiOff: '<path d="M2.5 8.8a15 15 0 0 1 5.4-3.3M9.5 5A15 15 0 0 1 21.5 8.8M5.3 12.5a10.5 10.5 0 0 1 3-1.8M15.7 10.7a10.5 10.5 0 0 1 3 1.8M8.3 16.2a5.8 5.8 0 0 1 3.4-1.2M12 15a5.8 5.8 0 0 1 3.3 1.1"/><path d="M12 19v.01"/><path d="M2.5 2.5l19 19"/>',
      plus: '<path d="M12 4.5v15M4.5 12h15"/>',
      droplet: '<path d="M12 3.5c3 4 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 3-7 6-11Z"/>',
      cup: '<path d="M6 3.5h9l-.9 13a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9L6 3.5Z"/><path d="M4.5 3.5h12"/><path d="M15 7.5h2a2 2 0 0 1 0 4h-1.6"/>',
      bowl: '<path d="M4 12h16"/><path d="M4 12a8 8 0 0 0 16 0"/><path d="M8 12V8M16 12V8"/>',
      walking: '<circle cx="13.5" cy="4.5" r="1.6"/><path d="M9.5 21 12 15l-1-4 2.5-2 2 3 3 1"/><path d="M11 11l-3 2.5"/>',
      ball: '<circle cx="12" cy="12" r="8"/><path d="M6 6c2 2 2 10 0 12M18 6c-2 2-2 10 0 12"/>',
      bath: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z"/><path d="M4 12V9.5A2.5 2.5 0 0 1 6.5 7c1 0 1.6.4 2 1"/><path d="M2.5 19h19"/>',
      scissors: '<circle cx="6.5" cy="6.5" r="2"/><circle cx="6.5" cy="17.5" r="2"/><path d="M8.2 7.8 20 19M20 5 8.2 16.2"/>',
      syringe: '<path d="M20 4 16 8"/><path d="M17.5 5.5 4 19l-1.5 3 3-1.5L19 6.5Z"/><path d="M13 8l3 3"/>',
      scale: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 12 15 9"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
      note: '<path d="M4 20 4.8 16.8 16 5.6a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.3 20.2 4 20Z"/><path d="M14.5 7 17.5 10"/>',
      palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.5-.6 1.5-1.5 0-.5-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.7.6-1.2 1.3-1.2H15a4 4 0 0 0 4-4 8.4 8.4 0 0 0-7-8.2Z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="11" r="1" fill="currentColor" stroke="none"/>',
      upload: '<path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
      download: '<path d="M12 4v11"/><path d="M8 11l4 4 4-4"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
      grid: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.5 4v16M15 4v16"/>',
      folder: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4.2l1.6 2H19A1.5 1.5 0 0 1 20.5 9v8A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17V7Z"/>',
      camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.3"/>',
      close: '<path d="M6 6l12 12M18 6 6 18"/>',
      alertTriangle: '<path d="M10.6 4.4 2.9 18.5A1.7 1.7 0 0 0 4.4 21h15.2a1.7 1.7 0 0 0 1.5-2.5L13.4 4.4a1.7 1.7 0 0 0-2.8 0Z"/><path d="M12 9.5v4.2"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
      poop: '<path d="M12 20.5c-4 0-6-1.7-6-3.8 0-1.3.9-2.2 2-2.6-.5-.5-.8-1.1-.8-1.9 0-1.3 1-2.3 2.3-2.5-.3-.4-.5-.9-.5-1.4 0-1.4 1.3-2.5 2.9-2.5.6 0 1.1.1 1.6.4.3-1 1.3-1.7 2.5-1.7 1.5 0 2.7 1.1 2.7 2.5 0 .3 0 .6-.1.9 1.2.3 2 1.3 2 2.5 0 .7-.3 1.3-.7 1.7 1.1.4 1.9 1.4 1.9 2.6 0 2.1-2.7 3.8-7.8 3.8Z"/><circle cx="9.7" cy="15.2" r=".6" fill="currentColor" stroke="none"/><circle cx="14.3" cy="15.2" r=".6" fill="currentColor" stroke="none"/><path d="M10.5 17.4c.6.5 1.9.5 2.4 0"/>',
    };

    /**
     * Icon(name, opts?) -> inline <svg> markup string.
     * Drop straight into any template literal: `<button>${Icon('trash')}</button>`
     * The svg is 1em square and uses currentColor, so it automatically
     * matches whatever font-size/color the surrounding element already
     * defines - no CSS changes needed at any existing icon slot.
     */
    function Icon(name, { label } = {}) {
      const inner = ICONS[name];
      if (!inner) return '';
      const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
      return `<svg class="gicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${inner}</svg>`;
    }

    /**
     * GEmoji(char, opts?) -> a span pinning a genuine decorative emoji to a
     * consistent cross-platform emoji font stack. Used only for the few
     * personal/decorative touches we keep as real emoji (a wave in a
     * greeting, a dedication) rather than converting to iconography.
     */
    function GEmoji(char, { label } = {}) {
      const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"';
      return `<span class="gemoji"${a11y}>${char}</span>`;
    }

    /* ================ IndexedDB ================ */
    const DB = {
      db: null, name: 'TINKL_V2', ver: 1,
      async init() {
        return new Promise((res, rej) => {
          const r = indexedDB.open(this.name, this.ver);
          r.onerror = () => rej(r.error);
          r.onsuccess = () => { this.db = r.result; res(); };
          r.onupgradeneeded = (e) => {
            const db = e.target.result;
            ['pets', 'logs', 'reminders', 'weights', 'meds', 'vaccinations', 'notes'].forEach(s => {
              if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
            });
          };
        });
      },
      tx(s, m = 'readonly') { return this.db.transaction(s, m).objectStore(s); },
      all(s) { return new Promise((r, e) => { const q = this.tx(s).getAll(); q.onsuccess = () => r(q.result || []); q.onerror = () => e(q.error); }); },
      put(s, v) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').put(v); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); },
      del(s, id) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').delete(id); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); },
      clear(s) { return new Promise((r, e) => { const q = this.tx(s, 'readwrite').clear(); q.onsuccess = () => r(); q.onerror = () => e(q.error); }); }
    };

    /* ================ State ================ */
    const S = {
      pets: [], logs: [], reminders: [], weights: [], meds: [], vaccinations: [], notes: [],
      activePetId: null,
      settings: {
        theme: 'dark',
        notifications: true,
        sound: true,
        vibration: true,
        snoozeMinutes: 10,
        quietHours: false,
        quietStart: '22:00',
        quietEnd: '07:00',
        mutedTypes: [],
        weightUnit: 'kg',
      },
      calDate: new Date(), calSel: new Date(),
      chartRange: 7, careFilter: 'all',
      firedReminders: new Set(),
      activeAlarms: new Set(),
      online: navigator.onLine,
    };




    /* ================ Utils ================ */
    const U = {
      id: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      esc(s) { if (s == null) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; },
      fmtTime(d) { return new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); },
      fmtDate(d, o = { month: 'short', day: 'numeric' }) { return new Date(d).toLocaleDateString([], o); },
      rel(d) {
        const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return Math.floor(s / 60) + 'm ago';
        if (s < 86400) return Math.floor(s / 3600) + 'h ago';
        return Math.floor(s / 86400) + 'd ago';
      },
      greet() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; },
      isToday(d) { return new Date(d).toDateString() === new Date().toDateString(); },
      today(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; },
      // Guards every numeric display against undefined/null/blank/non-numeric
      // input turning into NaN on screen (e.g. corrupted records, cleared
      // inputs, bad cloud-restore data). Never throws, always returns a number.
      safeNum(val, fallback = 0) {
        const n = typeof val === 'string' ? parseFloat(val) : val;
        return Number.isFinite(n) ? n : fallback;
      },
      // Weights can be logged in kg or lbs per-entry; everything that
      // compares/plots multiple entries together must normalize to a single
      // source of truth first (kg) or the numbers are meaningless.
      toKg(value, unit) { const n = U.safeNum(value); return unit === 'lbs' ? n / 2.20462 : n; },
      kgToLbs(kg) { return U.safeNum(kg) * 2.20462; },
      fmtWeight(kg, unit) { return unit === 'lbs' ? (U.kgToLbs(kg)).toFixed(1) + ' lbs' : U.safeNum(kg).toFixed(1) + ' kg'; },
      toast(m, t = 'info') {
        const w = document.getElementById('toastWrap');
        const e = document.createElement('div');
        e.className = 'toast ' + t; e.textContent = m;
        w.appendChild(e);
        setTimeout(() => { e.style.transition = 'all .3s'; e.style.opacity = 0; e.style.transform = 'translateX(120%)'; setTimeout(() => e.remove(), 300); }, 3200);
      },
      confirm(title, msg) {
        return new Promise((res) => {
          openModal({
            title, body: `<p class="text-mut">${U.esc(msg)}</p>`,
            actions: [{ label: 'Cancel', kind: 'secondary', v: false }, { label: 'Confirm', kind: 'danger', v: true }],
            onAction: (v, close) => { close(); res(v); }
          });
        });
      }
    };

    /* ================ Log Types ================ */
    const LOG_TYPES = {
      pee: { label: 'Pee', emoji: '💧', icon: 'droplet', cls: 'ic-pee' },
      poop: { label: 'Poop', emoji: '💩', icon: 'poop', cls: 'ic-poop' },
      accident: { label: 'Accident', emoji: '⚠️', icon: 'alertTriangle', cls: 'ic-alert' },
      feed: { label: 'Feed', emoji: '🍽', icon: 'bowl', cls: 'ic-food' },
      water: { label: 'Water', emoji: '💦', icon: 'cup', cls: 'ic-water' },
      walk: { label: 'Walk', emoji: '🚶', icon: 'walking', cls: 'ic-walk' },
      med: { label: 'Med', emoji: '💊', icon: 'pill', cls: 'ic-med' },
      play: { label: 'Play', emoji: '🎾', icon: 'ball', cls: 'ic-brand' },
      bath: { label: 'Bath', emoji: '🛁', icon: 'bath', cls: 'ic-water' },
      groom: { label: 'Groom', emoji: '✂️', icon: 'scissors', cls: 'ic-brand' },
    };

    /* ================ Vaccine Schedule Reference ================ */
    // Rule-based, deterministic schedule data reflecting standard,
    // widely-published veterinary guidance (AAHA canine vaccination
    // guidelines; AAFP feline vaccination guidelines). This is general
    // reference information, not a prescription — the pet's actual vet
    // always has the final say based on regional disease risk, vaccine
    // brand/label, and the individual animal's health.
    //
    // seriesIntervalWeeks: spacing between doses while still a puppy/kitten
    // initialAgeWeeksMax: age by which the puppy/kitten series should be done
    // boosterAfterFirstMonths: booster timing after the FIRST-EVER adult dose
    // adultIntervalMonths: standard re-vaccination interval once established
    const VACCINE_SCHEDULES = [
      {
        id: 'rabies_dog', name: 'Rabies', species: 'dog', core: true,
        seriesIntervalWeeks: null, initialAgeWeeksMin: 12, initialAgeWeeksMax: 16,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 36,
        info: 'Core. First dose at 12–16 weeks old, booster 1 year later, then typically every 3 years (varies by vaccine label & local/state law).'
      },
      {
        id: 'dhpp_dog', name: 'DHPP (Distemper / Parvo Combo)', species: 'dog', core: true,
        seriesIntervalWeeks: 3.5, initialAgeWeeksMin: 6, initialAgeWeeksMax: 16,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 36,
        info: 'Core. Puppy series every 3–4 weeks from 6 to 16 weeks old, booster 1 year after the last puppy dose, then every 3 years.'
      },
      {
        id: 'bordetella_dog', name: 'Bordetella (Kennel Cough)', species: 'dog', core: false,
        seriesIntervalWeeks: null, initialAgeWeeksMin: 8, initialAgeWeeksMax: null,
        boosterAfterFirstMonths: 6, adultIntervalMonths: 6,
        info: 'Non-core. Recommended for dogs boarding, in daycare, or socializing often. Re-vaccinate every 6–12 months.'
      },
      {
        id: 'lepto_dog', name: 'Leptospirosis', species: 'dog', core: false,
        seriesIntervalWeeks: 3, initialAgeWeeksMin: 8, initialAgeWeeksMax: null,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 12,
        info: 'Non-core, increasingly recommended broadly. Initial 2 doses 2–4 weeks apart, then annually.'
      },
      {
        id: 'influenza_dog', name: 'Canine Influenza (H3N2/H3N8)', species: 'dog', core: false,
        seriesIntervalWeeks: 3, initialAgeWeeksMin: 8, initialAgeWeeksMax: null,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 12,
        info: 'Non-core. Initial 2 doses 2–4 weeks apart, then annually. Recommended for social/boarding dogs.'
      },
      {
        id: 'lyme_dog', name: 'Lyme Disease', species: 'dog', core: false,
        seriesIntervalWeeks: 3, initialAgeWeeksMin: 8, initialAgeWeeksMax: null,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 12,
        info: 'Non-core, risk-based for tick-endemic areas. Initial 2 doses 2–4 weeks apart, then annually.'
      },
      {
        id: 'fvrcp_cat', name: 'FVRCP (Feline Distemper Combo)', species: 'cat', core: true,
        seriesIntervalWeeks: 3.5, initialAgeWeeksMin: 6, initialAgeWeeksMax: 16,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 36,
        info: 'Core. Kitten series every 3–4 weeks from 6 to 16 weeks old, booster 1 year after the last kitten dose, then every 3 years.'
      },
      {
        id: 'rabies_cat', name: 'Rabies', species: 'cat', core: true,
        seriesIntervalWeeks: null, initialAgeWeeksMin: 12, initialAgeWeeksMax: 16,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 12,
        info: 'Core. First dose at 12–16 weeks old, booster 1 year later, then annually or every 3 years depending on vaccine label.'
      },
      {
        id: 'felv_cat', name: 'FeLV (Feline Leukemia)', species: 'cat', core: false,
        seriesIntervalWeeks: 3.5, initialAgeWeeksMin: 8, initialAgeWeeksMax: 16,
        boosterAfterFirstMonths: 12, adultIntervalMonths: 12,
        info: 'Core for kittens (per AAFP), risk-based for adults. Initial 2 doses 3–4 weeks apart, then annually if at-risk (outdoor/multi-cat).'
      },
      {
        id: 'custom', name: 'Other / Custom vaccine', species: 'both', core: false,
        seriesIntervalWeeks: null, initialAgeWeeksMin: null, initialAgeWeeksMax: null,
        boosterAfterFirstMonths: null, adultIntervalMonths: null,
        info: 'Set your own schedule — enter the next due date manually based on your vet\'s recommendation.'
      },
    ];
    function vaccinesForSpecies(species) {
      return VACCINE_SCHEDULES.filter(v => v.species === species || v.species === 'both');
    }
    function findVaccineDef(id) { return VACCINE_SCHEDULES.find(v => v.id === id); }

    // Suggests a next-due date from the last-given date, using the pet's
    // age (if birthday is known) to decide whether this is still part of
    // the puppy/kitten series or an established-adult booster. Always
    // returns a rationale string so the suggestion is never a black box.
    function suggestVaccineNextDue(vaxDef, lastGivenStr, petBirthday) {
      if (!vaxDef || !lastGivenStr) return null;
      const lastGiven = new Date(lastGivenStr);
      if (Number.isNaN(lastGiven.getTime())) return null;
      if (vaxDef.id === 'custom') return null;

      let ageWeeksAtDose = null;
      if (petBirthday) {
        const bday = new Date(petBirthday);
        if (!Number.isNaN(bday.getTime())) ageWeeksAtDose = (lastGiven - bday) / (7 * 86400000);
      }

      const stillInSeries = vaxDef.seriesIntervalWeeks && ageWeeksAtDose !== null &&
        ageWeeksAtDose < (vaxDef.initialAgeWeeksMax || 16) + 2; // +2wk grace window

      if (stillInSeries) {
        const next = new Date(lastGiven.getTime() + vaxDef.seriesIntervalWeeks * 7 * 86400000);
        return {
          date: next.toISOString().slice(0, 10),
          rationale: `Still within the puppy/kitten series window — next dose suggested ${vaxDef.seriesIntervalWeeks} weeks later, per standard protocol.`
        };
      }
      // Otherwise treat as an adult / established booster.
      // If we can tell this is the pet's very first-ever adult dose (age just
      // past the series window), use the "1 year after first dose" rule;
      // otherwise use the standard ongoing re-vaccination interval.
      const justFinishedSeries = vaxDef.seriesIntervalWeeks && ageWeeksAtDose !== null &&
        ageWeeksAtDose < (vaxDef.initialAgeWeeksMax || 16) + 12;
      const months = justFinishedSeries ? vaxDef.boosterAfterFirstMonths : vaxDef.adultIntervalMonths;
      const next = new Date(lastGiven); next.setMonth(next.getMonth() + months);
      return {
        date: next.toISOString().slice(0, 10),
        rationale: justFinishedSeries
          ? `First adult booster — suggested ${months} month${months !== 1 ? 's' : ''} after this dose, per standard protocol.`
          : `Standard re-vaccination interval for this vaccine is every ${months >= 12 ? (months / 12) + ' year' + (months > 12 ? 's' : '') : months + ' months'}.`
      };
    }
    async function loadAll() {
      const [pets, logs, reminders, weights, meds, vaccinations, notes] = await Promise.all([
        DB.all('pets'), DB.all('logs'), DB.all('reminders'), DB.all('weights'),
        DB.all('meds'), DB.all('vaccinations'), DB.all('notes')
      ]);
      Object.assign(S, { pets, logs: await repairLogs(logs), reminders, weights, meds, vaccinations, notes });
      const s = localStorage.getItem('tinkl_settings');
      if (s) S.settings = Object.assign(S.settings, JSON.parse(s));
      if (!S.activePetId && pets.length) S.activePetId = pets[0].id;
      const ap = localStorage.getItem('tinkl_active');
      if (ap && pets.find(p => p.id === ap)) S.activePetId = ap;
    }

    /**
     * One-time self-heal for logs written before a fixed bug where reminder
     * "✅ Done" completions stored the timestamp as `at` instead of `ts`.
     * Those records have `ts === undefined`, which turns any stat computed
     * from timestamp arithmetic (Avg interval, streaks, trend chart) into
     * NaN — a single bad record poisons the whole average. Runs once per
     * load; only writes back to IndexedDB when a record actually needed it,
     * so this is a no-op after the first pass on a given device.
     */
    async function repairLogs(logs) {
      const fixes = [];
      for (const log of logs) {
        if (Number.isFinite(log.ts)) continue;
        if (Number.isFinite(log.at)) {
          log.ts = log.at;
          delete log.at;
        } else {
          log.ts = Date.now();
        }
        fixes.push(log);
      }
      if (fixes.length) {
        await Promise.all(fixes.map(log => DB.put('logs', log)));
        console.warn(`[TINKL] Repaired ${fixes.length} log record(s) with a missing/invalid timestamp.`);
      }
      return logs;
    }

    /* ================ Cloud Sync (Durable Objects) ================ */
    const SYNC = {
      // Configuration
      WORKER_URL: 'https://tinkl-sync.techguruofficial.workers.dev',
      API_SECRET: 'tinkl-sync-secret-123', // Must match the Cloudflare Worker secret

      SYNC_INTERVAL_MS: 5 * 60 * 1000, // Auto-sync every 5 minutes (optional)
      DEVICE_ID: null, // Set on app init
      DATA_VERSION: 1, // Bump this if you change the data schema

      async init() {
        // Generate a stable device ID (stored in localStorage)
        this.DEVICE_ID = localStorage.getItem('tinkl_device_id');
        if (!this.DEVICE_ID) {
          this.DEVICE_ID = `device_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem('tinkl_device_id', this.DEVICE_ID);
        }

        // Start auto-sync in background (optional — user can also tap "Sync Now" button)
        setInterval(() => this.autoSync(), this.SYNC_INTERVAL_MS);
        console.log('[SYNC] Initialized. Device ID:', this.DEVICE_ID);
      },

      /**
       * Serialize all app data into a backup object
       * Called before pushing to cloud or importing from cloud
       */
      async serialize() {
        return {
          ts: Date.now(),
          device: this.DEVICE_ID,
          dataVersion: this.DATA_VERSION,
          data: {
            pets: await DB.all('pets'),
            logs: await DB.all('logs'),
            reminders: await DB.all('reminders'),
            meds: await DB.all('meds'),
            vaccinations: await DB.all('vaccinations'),
            weights: await DB.all('weights'),
            notes: await DB.all('notes'),
            settings: JSON.parse(localStorage.getItem('tinkl_settings') || '{}'),
            activePetId: localStorage.getItem('tinkl_active'),
          },
        };
      },

      /**
       * Push local data to cloud
       * Call this when user taps "Back Up to Cloud" button
       */
      async pushToCloud() {
        try {
          const backup = await this.serialize();
          const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.API_SECRET}`,
            },
            body: JSON.stringify(backup),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const result = await res.json();
          localStorage.setItem('tinkl_last_sync_push', String(Date.now()));
          console.log('[SYNC] Pushed to cloud:', result);
          U.toast('✅ Backed up to cloud', 'success');
          return result;
        } catch (err) {
          console.error('[SYNC] Push failed:', err);
          U.toast(`❌ Backup failed: ${err.message}`, 'error');
          throw err;
        }
      },

      /**
       * Pull data from cloud
       * Call this when user taps "Restore from Cloud" button
       */
      async pullFromCloud() {
        try {
          const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.API_SECRET}` },
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const backup = await res.json();

          if (!backup || !backup.data) {
            U.toast('No cloud backup found', 'info');
            return null;
          }

          console.log('[SYNC] Pulled from cloud:', backup);
          return backup;
        } catch (err) {
          console.error('[SYNC] Pull failed:', err);
          U.toast(`❌ Restore failed: ${err.message}`, 'error');
          throw err;
        }
      },

      /**
       * Merge strategy: pull cloud data, compare timestamps, keep newer
       * This is safe for pet care data: each entry (log, reminder, pet) has
       * a unique ID and timestamp. If both local and cloud have the same ID,
       * keep the newer one. Anything only in cloud is imported.
       */
      async merge(cloudBackup) {
        if (!cloudBackup || !cloudBackup.data) return;

        const cloud = cloudBackup.data;
        const mergeTable = async (storeName, table) => {
          if (!Array.isArray(table)) return;
          for (const item of table) {
            const existing = await this.getByIdFromStore(storeName, item.id);
            // Keep newer timestamp (ts or at field depending on table)
            const itemTs = item.ts || item.at || 0;
            const existingTs = existing?.ts || existing?.at || 0;
            if (!existing || itemTs > existingTs) {
              await DB.put(storeName, item);
            }
          }
        };

        // Merge each table
        await mergeTable('pets', cloud.pets);
        await mergeTable('logs', cloud.logs);
        await mergeTable('reminders', cloud.reminders);
        await mergeTable('meds', cloud.meds);
        await mergeTable('vaccinations', cloud.vaccinations);
        await mergeTable('weights', cloud.weights);
        await mergeTable('notes', cloud.notes);

        // Merge settings (cloud wins, or merge strategically)
        if (cloud.settings) {
          const local = JSON.parse(localStorage.getItem('tinkl_settings') || '{}');
          Object.assign(local, cloud.settings);
          localStorage.setItem('tinkl_settings', JSON.stringify(local));
        }

        localStorage.setItem('tinkl_last_sync_pull', String(Date.now()));
        console.log('[SYNC] Merged cloud data into local');
      },

      /**
       * Auto-sync: every SYNC_INTERVAL_MS, push local → cloud if changed
       * (You can make this smarter: only push if data actually changed)
       */
      async autoSync() {
        const lastPush = Number(localStorage.getItem('tinkl_last_sync_push') || 0);
        const now = Date.now();
        if (now - lastPush > this.SYNC_INTERVAL_MS) {
          try {
            await this.pushToCloud();
          } catch {
            // Silently fail, will retry next interval
            console.warn('[SYNC] Auto-sync push failed, will retry');
          }
        }
      },

      /**
       * Helper: get an item by ID from a store
       */
      async getByIdFromStore(storeName, id) {
        return new Promise((res, rej) => {
          const req = DB.tx(storeName).get(id);
          req.onsuccess = () => res(req.result || null);
          req.onerror = () => rej(req.error);
        });
      },

      /**
       * Full restore: pull from cloud, ask user, merge if approved
       */
      async restoreFromCloud() {
        const backup = await this.pullFromCloud();
        if (!backup) return;

        const msg = `Cloud backup from ${new Date(backup.ts).toLocaleDateString()} (${backup.device}).\n\nMerge with local data? Newer entries win.`;
        const ok = await U.confirm('Restore Cloud Backup', msg);
        if (ok) {
          await this.merge(backup);
          await loadAll();
          render(currentView());
          U.toast('✅ Restored from cloud', 'success');
        }
      },

      /**
       * Delete cloud backup (user privacy)
       */
      async deleteCloudBackup() {
        const ok = await U.confirm('Delete Cloud Backup', 'This cannot be undone.');
        if (!ok) return;
        try {
          const res = await fetch(`${this.WORKER_URL}/api/backup/latest`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.API_SECRET}` },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          U.toast('✅ Cloud backup deleted', 'success');
        } catch (err) {
          U.toast(`❌ Delete failed: ${err.message}`, 'error');
        }
      },
    };

    function saveSettings() { localStorage.setItem('tinkl_settings', JSON.stringify(S.settings)); }
    function setActive(id) { S.activePetId = id; localStorage.setItem('tinkl_active', id); }

    /* ================ Navigation ================ */
    function goto(view) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const t = document.getElementById('view-' + view);
      if (t) t.classList.add('active');
      document.querySelectorAll('[data-view]').forEach(n => n.classList.toggle('active', n.dataset.view === view));
      const titles = { dashboard: 'Dashboard', pets: 'My Pets', care: 'Care Log', health: 'Health', history: 'History', stats: 'Statistics', reminders: 'Reminders', settings: 'Settings' };
      document.getElementById('pageTitle').textContent = titles[view] || 'TINKL';
      document.getElementById('sidebar').classList.remove('open');
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('tinkl:view-change'));
      render(view);
    }

    function render(view) {
      switch (view) {
        case 'dashboard': renderDashboard(); break;
        case 'pets': renderPets(); break;
        case 'care': renderCare(); break;
        case 'health': renderHealth(); break;
        case 'history': renderHistory(); break;
        case 'stats': renderStats(); break;
        case 'insights': renderInsights(); break;
        case 'reminders': renderReminders(); break;
        case 'settings': renderSettings(); break;
      }
    }

    /* ================ Modal ================ */
    function openModal({ title, body, actions = [], onAction, onOpen }) {
      const b = document.createElement('div');
      b.className = 'backdrop';
      const btns = actions.map((a, i) => `<button class="btn btn-${a.kind || 'secondary'}" data-i="${i}">${U.esc(a.label)}</button>`).join('');
      b.innerHTML = `<div class="modal">
    <div class="modal-head">
      <h3 class="modal-title">${U.esc(title)}</h3>
      <button class="modal-close" data-close aria-label="Close">${Icon('close')}</button>
    </div>
    <div>${body}</div>
    ${actions.length ? `<div class="modal-foot">${btns}</div>` : ''}
  </div>`;
      document.body.appendChild(b);
      const close = () => b.remove();
      b.addEventListener('click', (e) => { if (e.target === b) close(); });
      b.querySelector('[data-close]').addEventListener('click', close);
      b.querySelectorAll('[data-i]').forEach(btn => {
        btn.addEventListener('click', () => {
          const a = actions[+btn.dataset.i];
          if (onAction) onAction(a.v, close, b);
        });
      });
      if (onOpen) onOpen(b, close);
      return { el: b, close };
    }

    /* ================ Dashboard ================ */
    function renderDashboard() {
      const active = S.pets.find(p => p.id === S.activePetId);
      const now = new Date();
      document.getElementById('hero').innerHTML = `
    <div class="hero-top">
      <div>
        <div class="hero-greet">${U.greet()}${active ? ', ' + U.esc(active.parent || 'friend') : ''}</div>
        <div class="hero-name">${active ? 'Hi, ' + U.esc(active.name) + '! ' + GEmoji('👋') : 'Welcome to TINKL'}</div>
        <div class="hero-date">${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
    ${active ? `
      <div class="hero-pet">
        <div class="hero-pet-avatar">${active.photo ? `<img src="${active.photo}">` : Icon('paw')}</div>
        <div style="flex:1;min-width:0">
          <div class="hero-pet-name">${U.esc(active.name)}</div>
          <div class="hero-pet-meta">${U.esc(active.breed || 'Good boy')} · ${active.weight ? U.kgToLbs(active.weight).toFixed(1) + ' lbs' : 'Weight not set'}</div>
        </div>
        ${S.pets.length > 1 ? `<button class="icon-btn" id="switchPet" title="Switch pet">${Icon('refresh')}</button>` : ''}
      </div>
    ` : `
      <div style="margin-top:14px"><button class="btn btn-primary" id="firstPetBtn">+ Add your first pet</button></div>
    `}
  `;
      const sp = document.getElementById('switchPet'); if (sp) sp.addEventListener('click', showPetSwitcher);
      const fp = document.getElementById('firstPetBtn'); if (fp) fp.addEventListener('click', () => openPetModal());

      // Stats
      const todayLogs = S.logs.filter(l => l.petId === S.activePetId && U.isToday(l.ts));
      const c = (type) => todayLogs.filter(l => l.type === type).length;
      const streak = computeStreak();
      document.getElementById('statsGrid').innerHTML = `
    ${statCard('ic-pee', 'droplet', 'Pee today', c('pee'), c('pee') ? 'last ' + shortLast('pee') : 'no logs')}
    ${statCard('ic-poop', 'poop', 'Poop today', c('poop'), c('poop') ? 'last ' + shortLast('poop') : 'no logs')}
    ${statCard('ic-food', 'bowl', 'Feed', c('feed'), c('feed') ? 'last ' + shortLast('feed') : 'not fed yet')}
    ${statCard('ic-walk', 'walking', 'Walks', c('walk'), c('walk') ? 'last ' + shortLast('walk') : 'no walks yet')}
    ${statCard('ic-streak', 'flame', 'Streak', streak, 'days logged')}
    ${statCard('ic-alert', 'alertTriangle', 'Accidents', c('accident'), 'today')}
  `;

      // Quick
      const quicks = ['pee', 'poop', 'feed', 'water', 'walk', 'med', 'play', 'accident'];
      document.getElementById('quickGrid').innerHTML = quicks.map(t => `
    <button class="quick-btn" data-quick="${t}">
      <span class="q-ic ${LOG_TYPES[t].cls}">${Icon(LOG_TYPES[t].icon)}</span>
      ${LOG_TYPES[t].label}
    </button>
  `).join('');
      document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => quickLog(b.dataset.quick)));

      // Recent
      const recent = [...S.logs].filter(l => l.petId === S.activePetId).sort((a, b) => b.ts - a.ts).slice(0, 5);
      document.getElementById('recentFeed').innerHTML = recent.length ? recent.map(feedRow).join('') : emptyRow('No activity yet');

      // Upcoming
      const upcoming = getUpcomingAlarms(5);
      document.getElementById('upcomingFeed').innerHTML = upcoming.length ? upcoming.map(r => `
    <div class="feed-item">
      <div class="feed-ic ${LOG_TYPES[r.logType]?.cls || 'ic-brand'}">${Icon(LOG_TYPES[r.logType]?.icon || 'alarm')}</div>
      <div class="feed-body">
        <div class="feed-title">${U.esc(r.title)}</div>
        <div class="feed-meta">${r.nextText}</div>
      </div>
    </div>
  `).join('') : emptyRow('No reminders set');

      // Last of each
      const lastList = ['pee', 'poop', 'feed', 'water', 'walk', 'med'];
      document.getElementById('lastOf').innerHTML = `<div class="feed">` + lastList.map(t => {
        const l = S.logs.filter(x => x.petId === S.activePetId && x.type === t).sort((a, b) => b.ts - a.ts)[0];
        return `<div class="feed-item">
      <div class="feed-ic ${LOG_TYPES[t].cls}">${Icon(LOG_TYPES[t].icon)}</div>
      <div class="feed-body">
        <div class="feed-title">Last ${LOG_TYPES[t].label}</div>
        <div class="feed-meta">${l ? U.rel(l.ts) + ' · ' + U.fmtTime(l.ts) : '—'}</div>
      </div>
    </div>`;
      }).join('') + '</div>';

      document.getElementById('notifDot').style.display = upcoming.length ? 'block' : 'none';
    }
    function statCard(cls, icon, lbl, val, sub) {
      return `<div class="stat"><div class="stat-ic ${cls}">${Icon(icon)}</div><div class="stat-lbl">${lbl}</div><div class="stat-val">${val}</div><div class="stat-sub">${sub}</div></div>`;
    }
    function shortLast(type) {
      const l = S.logs.filter(x => x.petId === S.activePetId && x.type === type).sort((a, b) => b.ts - a.ts)[0];
      return l ? U.rel(l.ts) : '—';
    }
    function feedRow(l) {
      const t = LOG_TYPES[l.type] || { label: l.type, emoji: '•', cls: 'ic-brand' };
      return `<div class="feed-item">
    <div class="feed-ic ${t.cls}">${Icon(t.icon)}</div>
    <div class="feed-body">
      <div class="feed-title">${t.label}${l.note ? ' · ' + U.esc(l.note) : ''}</div>
      <div class="feed-meta">${U.fmtTime(l.ts)} · ${U.rel(l.ts)}</div>
    </div>
    <button class="feed-del" data-del-log="${l.id}">${Icon('trash')}</button>
  </div>`;
    }
    function emptyRow(m) { return `<div class="empty" style="padding:20px 8px"><div class="empty-ic">${Icon('sparkle')}</div><div class="empty-sub">${m}</div></div>`; }

    // Chart.js is loaded from a CDN and may fail (offline first install, CDN
    // hiccup, etc). Guard every chart render so a missing library shows a
    // friendly message instead of throwing and breaking the whole view.
    function chartsAvailable() { return typeof Chart !== 'undefined' && !window.__chartJsFailed; }
    function showChartFallback(wrapId, msg) {
      const wrap = document.getElementById(wrapId);
      if (wrap) wrap.innerHTML = `<div class="chart-fallback">${Icon('trendDown')} ${msg || "Charts couldn't load. Check your connection and reopen the app."}</div>`;
    }

    function computeStreak() {
      const days = new Set(S.logs.filter(l => l.petId === S.activePetId).map(l => U.today(l.ts).getTime()));
      let s = 0; const d = U.today();
      while (days.has(d.getTime())) { s++; d.setDate(d.getDate() - 1); }
      return s;
    }

    document.addEventListener('click', async (e) => {
      const del = e.target.closest('[data-del-log]');
      if (del) {
        if (await U.confirm('Delete log?', 'This will remove this entry permanently.')) {
          await DB.del('logs', del.dataset.delLog);
          await loadAll(); render(currentView());
          U.toast('Log deleted', 'info');
        }
      }
      const gt = e.target.closest('[data-goto]');
      if (gt) goto(gt.dataset.goto);
    });

    /* ================ Quick Log ================ */
    async function quickLog(type, note = '', ts = Date.now()) {
      if (!S.activePetId) {
        U.toast('Add a pet first', 'error'); goto('pets'); return;
      }
      const log = { id: U.id(), petId: S.activePetId, type, ts, note };
      await DB.put('logs', log);
      await loadAll(); render(currentView());
      U.toast(LOG_TYPES[type].label + ' logged!', 'success');
      if (navigator.vibrate) navigator.vibrate(30);
    }
    function currentView() { return document.querySelector('.view.active')?.id.replace('view-', '') || 'dashboard'; }

    function showLogPicker() {
      const types = Object.keys(LOG_TYPES);
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5);
      
      openModal({
        title: 'Log an activity',
        body: `<div class="chooser-grid" id="logChooser">
      ${types.map(t => `<div class="chooser" data-t="${t}"><span class="cic">${Icon(LOG_TYPES[t].icon)}</span>${LOG_TYPES[t].label}</div>`).join('')}
    </div>
    <div class="form-row"><label>Date</label><input type="date" id="logDate" value="${dateStr}" /></div>
    <div class="form-row"><label>Time</label><input type="time" id="logTime" value="${timeStr}" /></div>
    <div class="form-row"><label>Note (optional)</label><input id="logNote" placeholder="e.g. after dinner" /></div>`,
        actions: [{ label: 'Cancel', v: 'c' }],
        onAction: (v, close) => close(),
        onOpen: (b, close) => {
          let selectedType = null;
          b.querySelectorAll('[data-t]').forEach(c => c.addEventListener('click', async () => {
            selectedType = c.dataset.t;
            const dateVal = b.querySelector('#logDate').value;
            const timeVal = b.querySelector('#logTime').value;
            const note = b.querySelector('#logNote').value.trim();
            
            const [y, m, d] = dateVal.split('-').map(Number);
            const [h, mi] = timeVal.split(':').map(Number);
            const logDate = new Date(y, m - 1, d, h, mi, 0, 0);
            const ts = logDate.getTime();
            
            close();
            await quickLog(selectedType, note, ts);
          }));
        }
      });
    }

    async function openEditLogModal(logId) {
      const log = S.logs.find(l => l.id === logId);
      if (!log) return;
      
      const t = LOG_TYPES[log.type] || { label: log.type, emoji: '•', cls: 'ic-brand' };
      const logDate = new Date(log.ts);
      const dateStr = logDate.toISOString().slice(0, 10);
      const timeStr = logDate.toTimeString().slice(0, 5);
      
      openModal({
        title: `Edit ${t.label}`,
        body: `
      <div class="form-row"><label>Date</label><input type="date" id="editLogDate" value="${dateStr}" /></div>
      <div class="form-row"><label>Time</label><input type="time" id="editLogTime" value="${timeStr}" /></div>
      <div class="form-row"><label>Note</label><input id="editLogNote" value="${U.esc(log.note || '')}" placeholder="Optional" /></div>
    `,
        actions: [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }],
        onAction: async (v, close, b) => {
          if (v === 'delete') {
            if (await U.confirm('Delete this log?', 'This action cannot be undone.')) {
              await DB.del('logs', logId);
              await loadAll(); render(currentView());
              close();
            }
            return;
          }
          if (!v) return close();
          
          const dateVal = b.querySelector('#editLogDate').value;
          const timeVal = b.querySelector('#editLogTime').value;
          const note = b.querySelector('#editLogNote').value.trim();
          
          const [y, m, d] = dateVal.split('-').map(Number);
          const [h, mi] = timeVal.split(':').map(Number);
          const newDate = new Date(y, m - 1, d, h, mi, 0, 0);
          
          log.ts = newDate.getTime();
          log.note = note;
          await DB.put('logs', log);
          await loadAll(); render(currentView());
          U.toast('Log updated', 'success');
          close();
        }
      });
    }

    /* ================ Pets ================ */
    function renderPets() {
      const g = document.getElementById('petsGrid');
      if (!S.pets.length) {
        g.innerHTML = `<div class="card" style="grid-column:1/-1"><div class="empty">
      <div class="empty-ic">${Icon('paw')}</div><div class="empty-title">No pets yet</div>
      <div class="empty-sub">Add your first furry friend</div>
      <div style="margin-top:14px"><button class="btn btn-primary" id="empAdd">+ Add pet</button></div>
    </div></div>`;
        document.getElementById('empAdd').addEventListener('click', () => openPetModal());
        return;
      }
      g.innerHTML = S.pets.map(p => {
        const logs = S.logs.filter(l => l.petId === p.id);
        const today = logs.filter(l => U.isToday(l.ts));
        return `<div class="pet-card ${p.id === S.activePetId ? 'active' : ''}" data-pet="${p.id}">
      <div class="pet-card-top">
        <div class="pet-avatar">${p.photo ? `<img src="${p.photo}">` : Icon('paw')}</div>
        <div style="flex:1;min-width:0">
          <div class="pet-name">${U.esc(p.name)}</div>
          <div class="pet-breed">${U.esc(p.breed || 'Mixed breed')}</div>
          ${p.weight ? `<div class="pet-breed" style="font-size:0.85rem;color:var(--text-2)">${U.kgToLbs(p.weight).toFixed(1)} lbs</div>` : ''}
          ${p.id === S.activePetId ? '<div class="tag ok" style="margin-top:6px">Active</div>' : ''}
        </div>
      </div>
      <div class="pet-meta">
        <div class="pet-meta-cell"><b>${today.filter(l => l.type === 'pee').length}</b><span>Pee</span></div>
        <div class="pet-meta-cell"><b>${today.filter(l => l.type === 'poop').length}</b><span>Poop</span></div>
        <div class="pet-meta-cell"><b>${today.filter(l => l.type === 'walk').length}</b><span>Walk</span></div>
        <div class="pet-meta-cell"><b>${today.filter(l => l.type === 'feed').length}</b><span>Feed</span></div>
      </div>
      <div class="pet-actions">
        <button class="btn btn-secondary btn-sm" style="flex:1" data-edit-pet="${p.id}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-del-pet="${p.id}">${Icon('trash')}</button>
      </div>
    </div>`;
      }).join('');
      g.querySelectorAll('[data-pet]').forEach(c => c.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit-pet]') || e.target.closest('[data-del-pet]')) return;
        setActive(c.dataset.pet); renderPets(); U.toast('Active pet: ' + S.pets.find(p => p.id === c.dataset.pet).name, 'info');
      }));
      g.querySelectorAll('[data-edit-pet]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); openPetModal(S.pets.find(p => p.id === b.dataset.editPet)); }));
      g.querySelectorAll('[data-del-pet]').forEach(b => b.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (await U.confirm('Delete pet?', 'This removes the pet and all associated logs.')) {
          const id = b.dataset.delPet;
          await DB.del('pets', id);
          const logs = S.logs.filter(l => l.petId === id);
          for (const l of logs) await DB.del('logs', l.id);
          if (S.activePetId === id) setActive(S.pets.find(p => p.id !== id)?.id || null);
          await loadAll(); renderPets();
          U.toast('Pet deleted', 'info');
        }
      }));
    }

    function showPetSwitcher() {
      openModal({
        title: 'Switch active pet',
        body: `<div class="feed">${S.pets.map(p => `
      <div class="feed-item" data-sw="${p.id}" style="cursor:pointer">
        <div class="feed-ic ic-brand" style="overflow:hidden">${p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">` : Icon('paw')}</div>
        <div class="feed-body"><div class="feed-title">${U.esc(p.name)}</div><div class="feed-meta">${U.esc(p.breed || '')}</div></div>
        ${p.id === S.activePetId ? '<div class="tag ok">Active</div>' : ''}
      </div>`).join('')}</div>`,
        actions: [{ label: 'Close', v: 'c' }],
        onAction: (v, close) => close(),
        onOpen: (b, close) => b.querySelectorAll('[data-sw]').forEach(el => el.addEventListener('click', () => {
          setActive(el.dataset.sw); close(); renderDashboard();
        }))
      });
    }

    /* ================ Photo source chooser + live camera ================ */
    function openPhotoSourceChooser({ onLibrary, onCamera }) {
      const { close } = openModal({
        title: 'Add photo',
        body: `<div class="chooser-grid" style="grid-template-columns:repeat(2,1fr)">
      <div class="chooser" data-choice="library"><span class="cic">${Icon('folder')}</span>Choose Photo</div>
      <div class="chooser" data-choice="camera"><span class="cic">${Icon('camera')}</span>Take Photo</div>
    </div>`,
        onOpen: (b) => {
          b.querySelectorAll('[data-choice]').forEach(el => el.addEventListener('click', () => {
            const choice = el.dataset.choice;
            close();
            if (choice === 'library') onLibrary(); else onCamera();
          }));
        }
      });
    }

    function openCameraCapture({ onCapture, onFallback }) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        U.toast('Live camera not available here — using your device picker', 'info');
        onFallback();
        return;
      }
      let stream = null;
      const cleanup = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } };
      const { close } = openModal({
        title: 'Take a photo',
        body: `<div class="camera-wrap"><video id="camVideo" autoplay playsinline muted></video></div>
    <div class="camera-shutter-row"><div class="camera-shutter" id="camShutter"></div></div>`,
        onOpen: async (b) => {
          b.addEventListener('click', (e) => { if (e.target === b) cleanup(); });
          b.querySelector('[data-close]').addEventListener('click', cleanup);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            const video = b.querySelector('#camVideo');
            video.srcObject = stream;
            b.querySelector('#camShutter').addEventListener('click', () => {
              const max = 400; let w = video.videoWidth, h = video.videoHeight;
              if (w > max || h > max) { if (w > h) { h = h / w * max; w = max; } else { w = w / h * max; h = max; } }
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              c.getContext('2d').drawImage(video, 0, 0, w, h);
              const dataUrl = c.toDataURL('image/jpeg', 0.82);
              cleanup(); close();
              onCapture(dataUrl);
            });
          } catch (err) {
            cleanup(); close();
            U.toast('Could not access camera — using your device picker', 'info');
            onFallback();
          }
        }
      });
    }

    function openPetModal(pet) {
      const edit = !!pet;
      const body = `
    <div class="photo-up" id="photoUp">${pet?.photo ? `<img src="${pet.photo}">` : Icon('camera')}</div>
    <input type="file" id="photoInLibrary" accept="image/*" hidden />
    <input type="file" id="photoInCamera" accept="image/*" capture="environment" hidden />
    <div class="form-row"><label>Name *</label><input id="pName" value="${pet ? U.esc(pet.name) : ''}" placeholder="Buddy" /></div>
    <div class="form-grid">
      <div class="form-row"><label>Species *</label><select id="pSpecies">
        <option value="dog" ${(!pet || pet.species === 'dog') ? 'selected' : ''}>Dog</option>
        <option value="cat" ${pet?.species === 'cat' ? 'selected' : ''}>Cat</option>
        <option value="other" ${pet?.species === 'other' ? 'selected' : ''}>Other</option>
      </select></div>
      <div class="form-row"><label>Gender</label><select id="pGender"><option value="">—</option><option ${pet?.gender === 'male' ? 'selected' : ''}>male</option><option ${pet?.gender === 'female' ? 'selected' : ''}>female</option></select></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Breed</label><select id="pBreed">
        <option value="">— Choose a breed or enter custom —</option>
        ${['Labrador Retriever','Golden Retriever','German Shepherd','French Bulldog','Poodle','Bulldog','Rottweiler','Beagle','Dachshund','German Shorthaired Pointer','Pembroke Welsh Corgi','Australian Shepherd','Yorkshire Terrier','Boxer','Great Dane','Siberian Husky','Cavalier King Charles Spaniel','Doberman Pinscher','Miniature Schnauzer','Shih Tzu','Border Collie','Boston Terrier','Pomeranian','Havanese','Chihuahua','Shetland Sheepdog','Bernese Mountain Dog','Brittany','English Springer Spaniel','Pug','Cocker Spaniel','Mixed breed','Domestic Shorthair Cat','Domestic Longhair Cat','Maine Coon','Siamese','Persian','Ragdoll','British Shorthair','Bengal','Sphynx'].map(b => `<option value="${b}" ${pet?.breed === b ? 'selected' : ''}>${b}</option>`).join('')}
      </select></div>
      <div class="form-row" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end"><label style="grid-column:1/-1">Weight</label><input type="number" step="0.1" id="pWeight" placeholder="120" /><select id="pWeightUnit"><option value="lbs" selected>lbs</option><option value="kg">kg</option></select></div>
    </div>
    <div class="form-row"><label>Birthday</label><input type="date" id="pBirth" value="${pet?.birthday || ''}" /></div>
    <div class="form-row"><label>Pet parent name</label><input id="pParent" value="${pet ? U.esc(pet.parent || '') : ''}" placeholder="Your name" /></div>
    <div class="form-row"><label>Microchip #</label><input id="pChip" value="${pet ? U.esc(pet.chip || '') : ''}" placeholder="Optional" /></div>
    <div class="form-row"><label>Notes</label><textarea id="pNotes" placeholder="Allergies, quirks, favourites…">${pet ? U.esc(pet.notes || '') : ''}</textarea></div>
  `;
      openModal({
        title: edit ? 'Edit pet' : 'Add a new pet',
        body,
        actions: [{ label: 'Cancel', v: false }, { label: edit ? 'Save' : 'Add pet', kind: 'primary', v: true }],
        onOpen: (b) => {
          let photo = pet?.photo || '';
          const setPhoto = (dataUrl) => { photo = dataUrl; b.querySelector('#photoUp').innerHTML = `<img src="${photo}">`; };
          const processFile = (f) => {
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement('canvas');
                const max = 400; let w = img.width, h = img.height;
                if (w > max || h > max) { if (w > h) { h = h / w * max; w = max; } else { w = w / h * max; h = max; } }
                c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
                setPhoto(c.toDataURL('image/jpeg', 0.82));
              };
              img.src = ev.target.result;
            };
            r.readAsDataURL(f);
          };
          const libIn = b.querySelector('#photoInLibrary');
          const camIn = b.querySelector('#photoInCamera');
          b.querySelector('#photoUp').addEventListener('click', () => openPhotoSourceChooser({
            onLibrary: () => libIn.click(),
            onCamera: () => openCameraCapture({ onCapture: setPhoto, onFallback: () => camIn.click() })
          }));
          libIn.addEventListener('change', (e) => { processFile(e.target.files[0]); e.target.value = ''; });
          camIn.addEventListener('change', (e) => { processFile(e.target.files[0]); e.target.value = ''; });
          b._save = async () => {
            const name = b.querySelector('#pName').value.trim();
            if (!name) { U.toast('Name is required', 'error'); return false; }
            const weightVal = b.querySelector('#pWeight').value;
            const weightUnit = b.querySelector('#pWeightUnit').value;
            // Store everything in kg internally (single source of truth),
            // but remember the unit the user preferred so we can convert it back on edit
            const weightKg = weightVal ? U.toKg(U.safeNum(weightVal), weightUnit) : '';
            const data = {
              id: pet?.id || U.id(), name,
              species: b.querySelector('#pSpecies').value,
              breed: b.querySelector('#pBreed').value.trim(),
              gender: b.querySelector('#pGender').value,
              birthday: b.querySelector('#pBirth').value,
              weight: weightKg,
              weightUnit: weightUnit,
              parent: b.querySelector('#pParent').value.trim(),
              chip: b.querySelector('#pChip').value.trim(),
              notes: b.querySelector('#pNotes').value.trim(),
              photo, createdAt: pet?.createdAt || Date.now()
            };
            await DB.put('pets', data);
            await loadAll();
            if (!S.activePetId) setActive(data.id);
            U.toast(edit ? 'Pet updated!' : 'Pet added!', 'success');
            renderPets(); renderDashboard();
            return true;
          };
          // When editing: convert stored kg back to the unit they prefer
          if (pet?.weight && pet?.weight !== '') {
            const unit = pet?.weightUnit || 'lbs';
            b.querySelector('#pWeightUnit').value = unit;
            const kgVal = U.safeNum(pet.weight);
            const displayVal = unit === 'lbs' ? U.kgToLbs(kgVal) : kgVal;
            b.querySelector('#pWeight').value = displayVal.toFixed(1);
          }
        },
        onAction: async (v, close, b) => {
          if (!v) return close();
          if (await b._save()) close();
        }
      });
    }

    /* ================ Care Log ================ */
    function renderCare() {
      const f = document.getElementById('careFeed');
      const filter = S.careFilter;
      const list = S.logs.filter(l => l.petId === S.activePetId && (filter === 'all' || l.type === filter))
        .sort((a, b) => b.ts - a.ts);
      f.innerHTML = list.length ? list.map(l => {
        const t = LOG_TYPES[l.type] || { label: l.type, emoji: '•', cls: 'ic-brand' };
        return `<div class="feed-item" data-edit-log="${l.id}" style="cursor:pointer">
      <div class="feed-ic ${t.cls}">${Icon(t.icon)}</div>
      <div class="feed-body">
        <div class="feed-title">${t.label}${l.note ? ' · ' + U.esc(l.note) : ''}</div>
        <div class="feed-meta">${U.fmtDate(l.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · ${U.rel(l.ts)}</div>
      </div>
      <button class="feed-del" data-del-log="${l.id}">${Icon('trash')}</button>
    </div>`;
      }).join('') : emptyRow('No entries yet — tap + Log to start');
      document.querySelectorAll('#careFilters [data-f]').forEach(t => {
        t.classList.toggle('active', t.dataset.f === filter);
        t.onclick = () => { S.careFilter = t.dataset.f; renderCare(); };
      });
      document.querySelectorAll('[data-edit-log]').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.closest('[data-del-log]')) return;
          openEditLogModal(el.dataset.editLog);
        });
      });
      document.querySelectorAll('[data-del-log]').forEach(b => {
        b.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (await U.confirm('Delete log?', 'This action cannot be undone.')) {
            await DB.del('logs', b.dataset.delLog); await loadAll(); renderCare();
          }
        });
      });
    }

    /* ================ Health ================ */
    // Rule-based, deterministic schedule math — never guesses or infers from
    // a medication's name. Only fires off numbers the user explicitly
    // entered (start date + repeat interval), the same way vaccination
    // "next due" dates are just stored/read, never invented.
    function calculateNextMedDue(m) {
      if (!m.intervalDays || !m.start) return null;
      const interval = U.safeNum(m.intervalDays);
      if (interval <= 0) return null;
      const start = new Date(m.start); if (Number.isNaN(start.getTime())) return null;
      const now = Date.now();
      if (start.getTime() > now) return start.getTime();
      const cycles = Math.ceil((now - start.getTime()) / (interval * 86400000));
      const next = start.getTime() + cycles * interval * 86400000;
      if (m.until) { const until = new Date(m.until).getTime(); if (!Number.isNaN(until) && next > until) return null; }
      return next;
    }
    function renderHealth() {
      // Meds
      const meds = S.meds.filter(m => m.petId === S.activePetId);
      document.getElementById('medList').innerHTML = meds.length ? meds.map(m => {
        const nextDue = calculateNextMedDue(m);
        const overdue = nextDue && nextDue < Date.now();
        const dueTxt = nextDue ? ` · ${overdue ? '⚠️ overdue' : 'next dose'} ${U.fmtDate(nextDue)}` : '';
        return `
    <div class="feed-item" data-edit-med="${m.id}" style="cursor:pointer">
      <div class="feed-ic ic-med">${Icon('pill')}</div>
      <div class="feed-body">
        <div class="feed-title">${U.esc(m.name)} ${m.dose ? '· ' + U.esc(m.dose) : ''}</div>
        <div class="feed-meta">${U.esc(m.schedule || 'As needed')}${m.until ? ' · until ' + U.fmtDate(m.until) : ''}${dueTxt}</div>
      </div>
      <button class="feed-del" data-del-med="${m.id}">${Icon('trash')}</button>
    </div>
  `;
      }).join('') : emptyRow('No medications yet');
      document.querySelectorAll('[data-edit-med]').forEach(row => row.onclick = (e) => {
        if (e.target.closest('[data-del-med]')) return;
        openMedModal(S.meds.find(m => m.id === row.dataset.editMed));
      });
      document.querySelectorAll('[data-del-med]').forEach(b => b.onclick = async (e) => {
        e.stopPropagation();
        if (await U.confirm('Remove medication?', 'This removes the medication entry.')) {
          await DB.del('meds', b.dataset.delMed); await loadAll(); renderHealth();
        }
      });

      // Vaccinations
      const vacs = S.vaccinations.filter(v => v.petId === S.activePetId).sort((a, b) => new Date(a.nextDue || 0) - new Date(b.nextDue || 0));
      document.getElementById('vacList').innerHTML = vacs.length ? vacs.map(v => {
        const due = v.nextDue ? new Date(v.nextDue) : null;
        const days = due ? Math.ceil((due - Date.now()) / 86400000) : null;
        const tag = days == null ? '' : days < 0 ? `<div class="tag due">Overdue</div>` : days < 30 ? `<div class="tag warn">Due in ${days}d</div>` : `<div class="tag ok">${days}d</div>`;
        const coreTag = v.core ? '<span style="font-size:0.68rem;color:var(--brand);font-weight:600">CORE</span> · ' : '';
        return `<div class="feed-item" data-edit-vac="${v.id}" style="cursor:pointer">
      <div class="feed-ic ic-food">${Icon('syringe')}</div>
      <div class="feed-body">
        <div class="feed-title">${U.esc(v.name)}</div>
        <div class="feed-meta">${coreTag}Last: ${v.lastGiven ? U.fmtDate(v.lastGiven) : '—'}${v.nextDue ? ' · Next: ' + U.fmtDate(v.nextDue) : ''}</div>
      </div>
      ${tag}
      <button class="feed-del" data-del-vac="${v.id}">${Icon('trash')}</button>
    </div>`;
      }).join('') : emptyRow('No vaccinations tracked');
      document.querySelectorAll('[data-edit-vac]').forEach(row => row.onclick = (e) => {
        if (e.target.closest('[data-del-vac]')) return;
        openVacModal(S.vaccinations.find(v => v.id === row.dataset.editVac));
      });
      document.querySelectorAll('[data-del-vac]').forEach(b => b.onclick = async (e) => {
        e.stopPropagation();
        if (await U.confirm('Remove vaccination?', 'This removes the vaccination record.')) {
          await DB.del('vaccinations', b.dataset.delVac); await loadAll(); renderHealth();
        }
      });

      // Weight
      const ws = S.weights.filter(w => w.petId === S.activePetId).sort((a, b) => a.ts - b.ts);
      renderWeightChart(ws);
      const wu = S.settings.weightUnit || 'kg';
      document.querySelectorAll('#weightUnitToggle [data-wunit]').forEach(b => {
        b.classList.toggle('active', b.dataset.wunit === wu);
        b.onclick = () => { S.settings.weightUnit = b.dataset.wunit; saveSettings(); renderHealth(); };
      });
      document.getElementById('weightList').innerHTML = ws.length ? [...ws].reverse().slice(0, 6).map(w => `
    <div class="feed-item" data-edit-w="${w.id}" style="cursor:pointer">
      <div class="feed-ic ic-brand">${Icon('scale')}</div>
      <div class="feed-body">
        <div class="feed-title">${U.fmtWeight(U.toKg(w.value, w.unit), wu)}</div>
        <div class="feed-meta">${U.fmtDate(w.ts, { year: 'numeric', month: 'short', day: 'numeric' })}${w.note ? ' · ' + U.esc(w.note) : ''}</div>
      </div>
      <button class="feed-del" data-del-w="${w.id}">${Icon('trash')}</button>
    </div>
  `).join('') : emptyRow('No weight entries');
      document.querySelectorAll('[data-edit-w]').forEach(row => row.onclick = (e) => {
        if (e.target.closest('[data-del-w]')) return;
        openWeightModal(S.weights.find(w => w.id === row.dataset.editW));
      });
      document.querySelectorAll('[data-del-w]').forEach(b => b.onclick = async (e) => {
        e.stopPropagation();
        await DB.del('weights', b.dataset.delW); await loadAll(); renderHealth();
      });

      // Notes
      const notes = S.notes.filter(n => n.petId === S.activePetId).sort((a, b) => b.ts - a.ts);
      document.getElementById('noteList').innerHTML = notes.length ? notes.map(n => `
    <div class="feed-item" data-edit-n="${n.id}" style="cursor:pointer">
      <div class="feed-ic ic-brand">${Icon('note')}</div>
      <div class="feed-body">
        <div class="feed-title">${U.esc(n.title)}</div>
        <div class="feed-meta">${U.fmtDate(n.ts, { month: 'short', day: 'numeric', year: 'numeric' })}${n.body ? ' · ' + U.esc(n.body) : ''}</div>
      </div>
      <button class="feed-del" data-del-n="${n.id}">${Icon('trash')}</button>
    </div>
  `).join('') : emptyRow('No notes or vet visits logged');
      document.querySelectorAll('[data-edit-n]').forEach(row => row.onclick = (e) => {
        if (e.target.closest('[data-del-n]')) return;
        openNoteModal(S.notes.find(n => n.id === row.dataset.editN));
      });
      document.querySelectorAll('[data-del-n]').forEach(b => b.onclick = async (e) => {
        e.stopPropagation();
        await DB.del('notes', b.dataset.delN); await loadAll(); renderHealth();
      });
    }

    let weightChartI;
    function renderWeightChart(ws) {
      if (!chartsAvailable()) { showChartFallback('weightChartWrap', ws.length ? 'Weight chart unavailable — Chart.js failed to load.' : undefined); return; }
      const ctx = document.getElementById('weightChart'); if (!ctx) return;
      if (weightChartI) weightChartI.destroy();
      if (!ws.length) return;
      const wu = S.settings.weightUnit || 'kg';
      // Every entry may have been logged in kg or lbs independently — always
      // normalize to kg first (single source of truth), then convert once to
      // whichever unit the user wants displayed. Never mix raw stored values.
      const plotVals = ws.map(w => {
        const kg = U.toKg(w.value, w.unit);
        return wu === 'lbs' ? U.kgToLbs(kg) : kg;
      });
      weightChartI = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ws.map(w => U.fmtDate(w.ts)),
          datasets: [{
            label: `Weight (${wu})`, data: plotVals,
            borderColor: '#7c8cff', backgroundColor: 'rgba(124,140,255,0.15)',
            fill: true, tension: 0.35, borderWidth: 3, pointRadius: 3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
      });
    }

    function openMedModal(med) {
      const edit = !!med;
      openModal({
        title: edit ? 'Edit medication' : 'Add medication',
        body: `
      <div class="form-row"><label>Medication name *</label><input id="mName" value="${edit ? U.esc(med.name || '') : ''}" placeholder="Apoquel" /></div>
      <div class="form-grid">
        <div class="form-row"><label>Dose</label><input id="mDose" value="${edit ? U.esc(med.dose || '') : ''}" placeholder="5mg" /></div>
        <div class="form-row"><label>Schedule</label><input id="mSched" value="${edit ? U.esc(med.schedule || '') : ''}" placeholder="1x daily, morning" /></div>
      </div>
      <div class="form-grid">
        <div class="form-row"><label>Started</label><input type="date" id="mStart" value="${med?.start || new Date().toISOString().slice(0, 10)}" /></div>
        <div class="form-row"><label>Until (optional)</label><input type="date" id="mUntil" value="${med?.until || ''}" /></div>
      </div>
      <div class="form-row"><label>Repeats every (days, optional)</label><input type="number" min="1" step="1" id="mInterval" value="${med?.intervalDays || ''}" placeholder="e.g. 30 for a monthly flea/tick dose" /></div>
    `,
        actions: edit
          ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
          : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
        onAction: async (v, close, b) => {
          if (!v) return close();
          if (v === 'delete') {
            if (await U.confirm('Remove medication?', 'This removes the medication entry.')) {
              await DB.del('meds', med.id); await loadAll(); renderHealth(); close();
            }
            return;
          }
          const name = b.querySelector('#mName').value.trim();
          if (!name || !S.activePetId) return U.toast('Name & active pet required', 'error');
          await DB.put('meds', {
            id: med?.id || U.id(), petId: S.activePetId, name,
            dose: b.querySelector('#mDose').value.trim(),
            schedule: b.querySelector('#mSched').value.trim(),
            start: b.querySelector('#mStart').value,
            until: b.querySelector('#mUntil').value,
            intervalDays: b.querySelector('#mInterval').value ? U.safeNum(b.querySelector('#mInterval').value) : null,
            createdAt: med?.createdAt || Date.now()
          });
          await loadAll(); renderHealth(); close(); U.toast(edit ? 'Medication updated' : 'Medication added', 'success');
        }
      });
    }
    function openVacModal(vac) {
      const edit = !!vac;
      const pet = S.pets.find(p => p.id === S.activePetId);
      const species = pet?.species || 'dog';
      const options = vaccinesForSpecies(species);
      const currentDefId = vac ? (VACCINE_SCHEDULES.find(v => v.name === vac.name)?.id || 'custom') : options[0]?.id;

      openModal({
        title: edit ? 'Edit vaccination' : 'Add vaccination',
        body: `
      <div class="form-row"><label>Vaccine *</label><select id="vDef">
        ${options.map(o => `<option value="${o.id}" ${o.id === currentDefId ? 'selected' : ''}>${o.name}${o.core ? ' (core)' : ''}</option>`).join('')}
      </select></div>
      <div class="form-row" id="vCustomNameRow" style="display:none">
        <label>Custom vaccine name *</label><input id="vCustomName" value="${edit && currentDefId === 'custom' ? U.esc(vac.name || '') : ''}" placeholder="e.g. Feline FIP" />
      </div>
      <div class="form-row" id="vInfoRow" style="background:var(--surface-2);border-radius:10px;padding:10px 12px;font-size:0.8rem;color:var(--text-2);line-height:1.5"></div>
      <div class="form-grid">
        <div class="form-row"><label>Last given</label><input type="date" id="vLast" value="${vac?.lastGiven || new Date().toISOString().slice(0, 10)}" /></div>
        <div class="form-row"><label>Next due</label><input type="date" id="vNext" value="${vac?.nextDue || ''}" /></div>
      </div>
      <div class="form-row" id="vSuggestRow" style="font-size:0.78rem;color:var(--brand);display:none"></div>
      <div class="form-row"><label>Vet / clinic</label><input id="vVet" value="${edit ? U.esc(vac.vet || '') : ''}" placeholder="Dr. Smith" /></div>
    `,
        actions: edit
          ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
          : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
        onOpen: (b) => {
          const defSel = b.querySelector('#vDef');
          const customRow = b.querySelector('#vCustomNameRow');
          const infoRow = b.querySelector('#vInfoRow');
          const suggestRow = b.querySelector('#vSuggestRow');
          const lastInput = b.querySelector('#vLast');
          const nextInput = b.querySelector('#vNext');
          let userEditedNext = !!vac?.nextDue; // don't clobber a manually-set date on open

          const refreshInfo = () => {
            const def = findVaccineDef(defSel.value);
            customRow.style.display = def?.id === 'custom' ? '' : 'none';
            infoRow.textContent = def ? (def.core ? '🛡️ ' : 'ℹ️ ') + def.info : '';
          };
          const refreshSuggestion = () => {
            const def = findVaccineDef(defSel.value);
            const suggestion = suggestVaccineNextDue(def, lastInput.value, pet?.birthday);
            if (suggestion && !userEditedNext) {
              nextInput.value = suggestion.date;
              suggestRow.style.display = '';
              suggestRow.textContent = `✨ Suggested per standard protocol: ${suggestion.rationale} You can override this date.`;
            } else if (suggestion) {
              suggestRow.style.display = '';
              suggestRow.textContent = `ℹ️ Standard protocol would suggest ${U.fmtDate(suggestion.date)}. ${suggestion.rationale}`;
            } else {
              suggestRow.style.display = 'none';
            }
          };

          defSel.onchange = () => { userEditedNext = false; refreshInfo(); refreshSuggestion(); };
          lastInput.onchange = () => { userEditedNext = false; refreshSuggestion(); };
          nextInput.onchange = () => { userEditedNext = true; };

          refreshInfo(); refreshSuggestion();

          b._save = async () => {
            const def = findVaccineDef(defSel.value);
            const name = def?.id === 'custom' ? b.querySelector('#vCustomName').value.trim() : def?.name;
            if (!name || !S.activePetId) { U.toast('Vaccine name & active pet required', 'error'); return false; }
            const data = {
              id: vac?.id || U.id(), petId: S.activePetId, name,
              lastGiven: lastInput.value,
              nextDue: nextInput.value,
              vet: b.querySelector('#vVet').value.trim(),
              core: !!def?.core,
              createdAt: vac?.createdAt || Date.now()
            };
            await DB.put('vaccinations', data);
            await loadAll(); renderHealth();
            U.toast(edit ? 'Vaccination updated' : 'Vaccination saved', 'success');
            return true;
          };
        },
        onAction: async (v, close, b) => {
          if (!v) return close();
          if (v === 'delete') {
            if (await U.confirm('Remove vaccination?', 'This removes the vaccination record.')) {
              await DB.del('vaccinations', vac.id); await loadAll(); renderHealth(); close();
            }
            return;
          }
          if (await b._save()) close();
        }
      });
    }
    function openWeightModal(w) {
      const edit = !!w;
      openModal({
        title: edit ? 'Edit weight entry' : 'Log weight',
        body: `
      <div class="form-row"><label>Date</label><input type="date" id="wDate" value="${w ? new Date(w.ts).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}" /></div>
      <div class="form-grid">
        <div class="form-row"><label>Weight *</label><input type="number" step="0.1" id="wVal" value="${w ? w.value : ''}" placeholder="12.5" /></div>
        <div class="form-row"><label>Unit</label><select id="wUnit"><option ${(w?.unit || S.settings.weightUnit || 'kg') === 'kg' ? 'selected' : ''}>kg</option><option ${(w?.unit || S.settings.weightUnit || 'kg') === 'lbs' ? 'selected' : ''}>lbs</option></select></div>
      </div>
      <div class="form-row"><label>Note</label><input id="wNote" value="${edit ? U.esc(w.note || '') : ''}" placeholder="After vet visit" /></div>
    `,
        actions: edit
          ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
          : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
        onAction: async (v, close, b) => {
          if (!v) return close();
          if (v === 'delete') {
            if (await U.confirm('Remove weight entry?', 'This removes the logged weight.')) {
              await DB.del('weights', w.id); await loadAll(); renderHealth(); close();
            }
            return;
          }
          const val = b.querySelector('#wVal').value;
          if (!val || !S.activePetId) return U.toast('Weight & active pet required', 'error');
          await DB.put('weights', {
            id: w?.id || U.id(), petId: S.activePetId, ts: new Date(b.querySelector('#wDate').value).getTime(),
            value: U.safeNum(val), unit: b.querySelector('#wUnit').value, note: b.querySelector('#wNote').value.trim()
          });
          await loadAll(); renderHealth(); close(); U.toast(edit ? 'Weight entry updated' : 'Weight logged', 'success');
        }
      });
    }
    function openNoteModal(note) {
      const edit = !!note;
      openModal({
        title: edit ? 'Edit note / vet visit' : 'Add note / vet visit',
        body: `
      <div class="form-row"><label>Title *</label><input id="nTitle" value="${edit ? U.esc(note.title || '') : ''}" placeholder="Vet check-up" /></div>
      <div class="form-row"><label>Date</label><input type="date" id="nDate" value="${note ? new Date(note.ts).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}" /></div>
      <div class="form-row"><label>Details</label><textarea id="nBody" placeholder="Everything is looking healthy…">${edit ? U.esc(note.body || '') : ''}</textarea></div>
    `,
        actions: edit
          ? [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }]
          : [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
        onAction: async (v, close, b) => {
          if (!v) return close();
          if (v === 'delete') {
            if (await U.confirm('Remove note?', 'This removes the note / vet visit record.')) {
              await DB.del('notes', note.id); await loadAll(); renderHealth(); close();
            }
            return;
          }
          const t = b.querySelector('#nTitle').value.trim();
          if (!t || !S.activePetId) return U.toast('Title & active pet required', 'error');
          await DB.put('notes', {
            id: note?.id || U.id(), petId: S.activePetId, title: t,
            body: b.querySelector('#nBody').value.trim(),
            ts: new Date(b.querySelector('#nDate').value).getTime()
          });
          await loadAll(); renderHealth(); close(); U.toast(edit ? 'Note updated' : 'Note added', 'success');
        }
      });
    }

    /* ================ History ================ */
    function renderHistory() { renderCalendar(); renderDay(); }
    function renderCalendar() {
      const y = S.calDate.getFullYear(), m = S.calDate.getMonth();
      document.getElementById('calTitle').textContent = S.calDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
      const first = new Date(y, m, 1); const startDow = first.getDay();
      const last = new Date(y, m + 1, 0).getDate();
      const prevLast = new Date(y, m, 0).getDate();
      const grid = document.getElementById('calGrid');
      const wds = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="cal-wd">${d}</div>`).join('');
      const cells = [];
      for (let i = startDow - 1; i >= 0; i--) cells.push({ d: prevLast - i, other: true, ts: null });
      for (let d = 1; d <= last; d++) cells.push({ d, other: false, ts: new Date(y, m, d) });
      while (cells.length % 7 !== 0) cells.push({ d: cells.length - startDow - last + 1, other: true, ts: null });

      grid.innerHTML = wds + cells.map(c => {
        if (c.other) return `<div class="cal-day other">${c.d}</div>`;
        const today = c.ts.toDateString() === new Date().toDateString();
        const sel = c.ts.toDateString() === S.calSel.toDateString();
        const has = S.logs.some(l => l.petId === S.activePetId && new Date(l.ts).toDateString() === c.ts.toDateString());
        return `<div class="cal-day ${today ? 'today' : ''} ${sel ? 'selected' : ''}" data-day="${c.ts.toISOString()}">${c.d}${has ? '<div class="dot"></div>' : ''}</div>`;
      }).join('');
      grid.querySelectorAll('[data-day]').forEach(el => el.onclick = () => { S.calSel = new Date(el.dataset.day); renderCalendar(); renderDay(); });
    }
    function renderDay() {
      const day = S.calSel;
      document.getElementById('dayTitle').textContent = day.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      const logs = S.logs.filter(l => l.petId === S.activePetId && new Date(l.ts).toDateString() === day.toDateString()).sort((a, b) => b.ts - a.ts);
      document.getElementById('dayFeed').innerHTML = logs.length ? logs.map(feedRow).join('') : emptyRow('No activity for this day');
    }
    document.getElementById('calPrev').onclick = () => { S.calDate = new Date(S.calDate.setMonth(S.calDate.getMonth() - 1)); renderCalendar(); };
    document.getElementById('calNext').onclick = () => { S.calDate = new Date(S.calDate.setMonth(S.calDate.getMonth() + 1)); renderCalendar(); };
    document.getElementById('calToday').onclick = () => { S.calDate = new Date(); S.calSel = new Date(); renderCalendar(); renderDay(); };

    /* ================ Stats ================ */
    let trendC, timeC, breakC;
    function renderStats() {
      // Defensive guard: repairLogs() heals bad records on load, but this
      // filter means a single malformed entry (e.g. from an old cloud
      // backup restore) can never turn the average into NaN again — it's
      // simply excluded from the calculation instead.
      const logs = S.logs.filter(l => l.petId === S.activePetId && Number.isFinite(l.ts));
      const days = new Set(logs.map(l => U.today(l.ts).getTime()));
      let long = 0, cur = 0; const sortedDays = [...days].sort();
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0 || sortedDays[i] - sortedDays[i - 1] === 86400000) cur++; else cur = 1;
        long = Math.max(long, cur);
      }
      const sortedByTs = [...logs].sort((a, b) => a.ts - b.ts);
      const gaps = [];
      for (let i = 1; i < sortedByTs.length; i++) gaps.push((sortedByTs[i].ts - sortedByTs[i - 1].ts) / 3600000);
      const avg = gaps.length ? (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1) : '—';

      document.getElementById('statsBig').innerHTML = `
    ${statCard('ic-brand', 'trendUp', 'Avg interval', avg, 'hours between')}
    ${statCard('ic-streak', 'trophy', 'Longest streak', long, 'days')}
    ${statCard('ic-alert', 'alertTriangle', 'Accidents', logs.filter(l => l.type === 'accident').length, 'all time')}
    ${statCard('ic-pee', 'barchart', 'Total logs', logs.length, 'all time')}
  `;

      // Trend
      const range = S.chartRange;
      const labels = []; const dataMap = {};
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const k = d.getTime();
        labels.push(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        dataMap[k] = { pee: 0, poop: 0, walk: 0, feed: 0 };
      }
      logs.forEach(l => {
        const k = U.today(l.ts).getTime();
        if (dataMap[k] && dataMap[k][l.type] !== undefined) dataMap[k][l.type]++;
      });
      const keys = Object.keys(dataMap);
      if (trendC) trendC.destroy();
      if (!chartsAvailable()) {
        showChartFallback('trendChartWrap', 'Trend chart unavailable — Chart.js failed to load.');
      } else {
        trendC = new Chart(document.getElementById('trendChart'), {
          type: 'bar',
          data: {
            labels, datasets: [
              { label: 'Pee', data: keys.map(k => dataMap[k].pee), backgroundColor: '#38bdf8', borderRadius: 6 },
              { label: 'Poop', data: keys.map(k => dataMap[k].poop), backgroundColor: '#b08968', borderRadius: 6 },
              { label: 'Walk', data: keys.map(k => dataMap[k].walk), backgroundColor: '#34d399', borderRadius: 6 },
              { label: 'Feed', data: keys.map(k => dataMap[k].feed), backgroundColor: '#fb923c', borderRadius: 6 },
            ]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#b9bcd0' } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
        });
      }

      // Time of day
      const hours = Array(24).fill(0);
      logs.forEach(l => hours[new Date(l.ts).getHours()]++);
      if (timeC) timeC.destroy();
      if (!chartsAvailable()) {
        showChartFallback('timeChartWrap', 'Time-of-day chart unavailable — Chart.js failed to load.');
      } else {
        timeC = new Chart(document.getElementById('timeChart'), {
          type: 'line',
          data: { labels: hours.map((_, i) => i + ':00'), datasets: [{ label: 'Activity', data: hours, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0', maxTicksLimit: 8 } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
        });
      }

      // Breakdown
      const counts = {}; logs.forEach(l => counts[l.type] = (counts[l.type] || 0) + 1);
      const ks = Object.keys(counts);
      if (breakC) breakC.destroy();
      if (!chartsAvailable()) {
        showChartFallback('breakdownChartWrap', 'Breakdown chart unavailable — Chart.js failed to load.');
      } else {
        breakC = new Chart(document.getElementById('breakdownChart'), {
          type: 'doughnut',
          data: { labels: ks.map(k => LOG_TYPES[k]?.label || k), datasets: [{ data: ks.map(k => counts[k]), backgroundColor: ['#38bdf8', '#b08968', '#f87171', '#fb923c', '#60a5fa', '#34d399', '#f472b6', '#7c8cff', '#a855f7', '#facc15'], borderWidth: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#b9bcd0', boxWidth: 12 } } } }
        });
      }

      document.querySelectorAll('#view-stats [data-range]').forEach(t => {
        t.classList.toggle('active', +t.dataset.range === S.chartRange);
        t.onclick = () => { S.chartRange = +t.dataset.range; renderStats(); };
      });
    }

    /* ================ Reminders ================ */
    function formatDays(days) {
      if (!days || !days.length) return 'once';
      if (days.length === 7) return 'every day';
      const N = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return days.map(function (d) { return N[d]; }).join(' ');
    }
    /* ================ Smart Insights ================ */
    let _insightRange = 'day';
    let _insightWeightChart = null;

    // Build a structured data object from S.* for the active pet over the
    // given window. This is the single source of truth fed to both the
    // stat grid and the AI narrative, so the numbers are always consistent.
    function buildInsightData(petId, range) {
      const now = Date.now();
      const MS = { day: 86400000, week: 7 * 86400000, month: 30 * 86400000 };
      const from = now - MS[range];
      const rangeLabel = { day: 'today', week: 'the past 7 days', month: 'the past 30 days' }[range];

      const pet = S.pets.find(p => p.id === petId) || {};
      const logs = S.logs.filter(l => l.petId === petId && l.ts >= from);
      const weights = S.weights.filter(w => w.petId === petId && w.ts >= from).sort((a, b) => a.ts - b.ts);
      const meds = S.meds.filter(m => m.petId === petId);
      const vaccs = S.vaccinations.filter(v => v.petId === petId);
      const notes = S.notes ? S.notes.filter(n => n.petId === petId && n.ts >= from) : [];

      // Activity counts
      const counts = {};
      logs.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });

      // Weight trend
      const wuDisplay = S.settings.weightUnit || 'lbs';
      const wPoints = weights.map(w => ({ ts: w.ts, val: U.toKg(w.value, w.unit), display: U.fmtWeight(U.toKg(w.value, w.unit), wuDisplay) }));
      const wFirst = wPoints[0]?.val, wLast = wPoints[wPoints.length - 1]?.val;
      const wDelta = (wFirst && wLast) ? U.kgToLbs(wLast - wFirst).toFixed(1) : null;

      // Med adherence: how many meds had at least one log hit this period
      const medTypes = new Set(meds.map(m => m.name.toLowerCase()));
      const medLogs = logs.filter(l => l.type === 'med').length;

      // Upcoming meds due
      const upcomingMeds = meds.filter(m => {
        const next = calculateNextMedDue(m);
        return next && next <= now + 7 * 86400000;
      });

      // Overdue vaccs (nextDue in the past)
      const overdueVaccs = vaccs.filter(v => v.nextDue && new Date(v.nextDue).getTime() < now);

      return { pet, range, rangeLabel, from, now, logs, counts, weights: wPoints, wFirst, wLast, wDelta, wuDisplay, meds, vaccs, notes, medLogs, upcomingMeds, overdueVaccs };
    }

    function renderInsightStatGrid(d) {
      const total = d.logs.length;
      const walks = d.counts['walk'] || 0;
      const feeds = d.counts['feed'] || 0;
      const accidents = d.counts['accident'] || 0;
      const wLabel = d.weights.length >= 2
        ? `${d.wDelta > 0 ? '+' : ''}${d.wDelta} lbs`
        : d.weights.length === 1 ? d.weights[0].display : '—';
      const wSub = d.weights.length >= 2 ? 'weight change' : d.weights.length === 1 ? 'logged' : 'no weigh-ins';

      document.getElementById('insightStatGrid').innerHTML =
        statCard('ic-brand', 'chart', 'Total Events', total, d.rangeLabel) +
        statCard('ic-walk', 'walking', 'Walks', walks, d.counts['walk'] ? 'logged' : 'none logged') +
        statCard('ic-food', 'bowl', 'Feedings', feeds, d.counts['feed'] ? 'logged' : 'none logged') +
        statCard('ic-brand', 'scale', 'Weight', wLabel, wSub) +
        statCard('ic-alert', 'alertTriangle', 'Accidents', accidents, accidents ? '⚠️ check pattern' : 'none ✓') +
        statCard('ic-med', 'pill', 'Meds Given', d.medLogs, d.medLogs ? 'logged' : 'none recorded');
    }

    function renderInsightBreakdown(d) {
      const total = d.logs.length || 1;
      const rows = Object.entries(d.counts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => {
          const t = LOG_TYPES[type] || { label: type, emoji: '📝' };
          const pct = Math.round((count / total) * 100);
          return `
          <div style="display:flex;align-items:center;gap:10px">
            <span style="width:24px;text-align:center">${t.emoji}</span>
            <span style="width:90px;font-size:0.85rem;color:var(--text-2)">${t.label}</span>
            <div style="flex:1;background:var(--surface-2);border-radius:6px;height:8px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:6px;transition:width .4s"></div>
            </div>
            <span style="width:36px;text-align:right;font-size:0.82rem;color:var(--text-2)">${count}x</span>
          </div>`;
        });
      document.getElementById('insightBreakdown').innerHTML = rows.length
        ? rows.join('')
        : '<div class="text-mut" style="font-size:0.85rem">No activity logged in this period.</div>';
    }

    function renderInsightWeightChart(d) {
      const wrap = document.getElementById('insightWeightChartWrap');
      document.getElementById('insightWeightCard').style.display = d.weights.length < 2 ? 'none' : '';
      if (d.weights.length < 2) return;
      if (!chartsAvailable()) { showChartFallback('insightWeightChartWrap'); return; }
      const ctx = document.getElementById('insightWeightChart');
      if (!ctx) return;
      if (_insightWeightChart) _insightWeightChart.destroy();
      const vals = d.weights.map(w => d.wuDisplay === 'lbs' ? U.kgToLbs(w.val) : w.val);
      _insightWeightChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: d.weights.map(w => U.fmtDate(w.ts)),
          datasets: [{ label: `Weight (${d.wuDisplay})`, data: vals, borderColor: '#7c8cff', backgroundColor: 'rgba(124,140,255,0.15)', fill: true, tension: 0.35, borderWidth: 3, pointRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#b9bcd0' } }, y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#b9bcd0' } } } }
      });
    }

    function renderInsightNotesFeed(d) {
      document.getElementById('insightNotesFeed').innerHTML = d.notes.length
        ? d.notes.map(n => `<div class="feed-item"><div class="feed-body"><div class="feed-title">${U.esc(n.text || n.content || '')}</div><div class="feed-meta">${U.fmtDate(n.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>`).join('')
        : d.logs.filter(l => l.note).slice(-6).map(l => `<div class="feed-item"><div class="feed-body"><div class="feed-title">${U.esc(l.note)}</div><div class="feed-meta">${LOG_TYPES[l.type]?.emoji || '📝'} ${U.fmtDate(l.ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div></div></div>`).join('')
        || '<div class="text-mut" style="font-size:0.85rem;padding:4px 0">No notes in this period.</div>';
    }

    // Builds a plain-English structured summary for the AI to narrate from.
    // Never passed as UI text — only used as the AI's input context.
    function buildAIPrompt(d) {
      const petName = d.pet.name || 'the pet';
      const breed = d.pet.breed ? ` (${d.pet.breed})` : '';
      const age = d.pet.birthday ? (() => {
        const yrs = ((Date.now() - new Date(d.pet.birthday)) / (365.25 * 86400000));
        return yrs < 1 ? `${Math.round(yrs * 12)} months old` : `${Math.floor(yrs)} years old`;
      })() : '';
      const ageStr = age ? `, ${age}` : '';
      const total = d.logs.length;
      const walks = d.counts['walk'] || 0;
      const feeds = d.counts['feed'] || 0;
      const accidents = d.counts['accident'] || 0;
      const water = d.counts['water'] || 0;
      const play = d.counts['play'] || 0;
      const medLogs = d.medLogs;
      const wTrend = d.wDelta !== null ? `Weight changed by ${d.wDelta} lbs over the period.` : 'No weight data logged.';
      const overdueStr = d.overdueVaccs.length ? `OVERDUE VACCINATIONS: ${d.overdueVaccs.map(v => v.name).join(', ')}.` : '';
      const upcomingStr = d.upcomingMeds.length ? `Medications due soon: ${d.upcomingMeds.map(m => m.name).join(', ')}.` : '';
      const noteTexts = [...d.notes.map(n => n.text || n.content || ''), ...d.logs.filter(l => l.note).map(l => l.note)].filter(Boolean).slice(-5);
      const notesStr = noteTexts.length ? `Owner notes: ${noteTexts.join(' | ')}` : '';

      return `You are a knowledgeable, warm pet health assistant helping a pet owner understand their ${petName}${breed}${ageStr}'s health data.

DATA SUMMARY for ${d.rangeLabel.toUpperCase()}:
- Total logged events: ${total}
- Walks: ${walks} | Feedings: ${feeds} | Water: ${water} | Play sessions: ${play}
- Accidents/incidents: ${accidents}
- Medications administered: ${medLogs}
- ${wTrend}
${overdueStr}
${upcomingStr}
${notesStr}

Write a friendly, medically informative 3-5 sentence summary of ${petName}'s wellbeing over ${d.rangeLabel}. 
Highlight any patterns, concerns, or positives. Flag anything a veterinarian should know. 
End with one actionable tip. Keep it conversational, warm, and concise. No bullet points — flowing paragraph prose only.`;
    }

    // Builds the structured vet-ready plain text report (no AI needed)
    function buildVetReport(d) {
      const petName = d.pet.name || 'Unknown';
      const breed = d.pet.breed || 'Unknown';
      const dob = d.pet.birthday ? new Date(d.pet.birthday).toLocaleDateString() : 'Unknown';
      const weight = d.weights.length ? d.weights[d.weights.length - 1].display : 'Not recorded';
      const rangeStr = { day: 'Daily', week: '7-Day', month: '30-Day' }[d.range];
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const meds = d.meds.map(m => `  • ${m.name}${m.dose ? ' ' + m.dose : ''}${m.schedule ? ' — ' + m.schedule : ''}`).join('\n') || '  None recorded';
      const vaccs = d.vaccs.map(v => `  • ${v.name}${v.date ? ' (given ' + new Date(v.date).toLocaleDateString() + ')' : ''}${v.nextDue ? ' · next due ' + new Date(v.nextDue).toLocaleDateString() : ''}`).join('\n') || '  None recorded';
      const overdueVaccs = d.overdueVaccs.length ? `\n⚠️  OVERDUE: ${d.overdueVaccs.map(v => v.name).join(', ')}` : '';

      const activityLines = Object.entries(d.counts).sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `  • ${LOG_TYPES[type]?.label || type}: ${count}x`).join('\n') || '  No activity logged';

      const wTrend = d.weights.length >= 2
        ? `  Start: ${d.weights[0].display}  →  End: ${d.weights[d.weights.length - 1].display}  (Δ ${d.wDelta > 0 ? '+' : ''}${d.wDelta} lbs)`
        : d.weights.length === 1 ? `  ${d.weights[0].display} (single reading)` : '  No weight entries in this period';

      const accidents = d.counts['accident'] || 0;
      const accidentLine = accidents > 0 ? `\n⚠️  ${accidents} accident(s) recorded — may warrant discussion.` : '';

      const noteTexts = [...d.notes.map(n => n.text || n.content || ''), ...d.logs.filter(l => l.note).map(l => l.note)].filter(Boolean);
      const notesLine = noteTexts.length ? noteTexts.map(t => `  • ${t}`).join('\n') : '  No notes logged';

      return `TINKL PET HEALTH REPORT
${rangeStr} Summary  ·  Generated ${today}
${'─'.repeat(48)}

PET PROFILE
  Name:    ${petName}
  Breed:   ${breed}
  DOB:     ${dob}
  Weight:  ${weight}

ACTIVITY LOG  (${d.rangeLabel})
${activityLines}${accidentLine}

WEIGHT TREND
${wTrend}

CURRENT MEDICATIONS
${meds}

VACCINATION HISTORY${overdueVaccs}
${vaccs}

OWNER NOTES & OBSERVATIONS
${notesLine}
${'─'.repeat(48)}
Report generated by TINKL · tinkl.app`;
    }

    async function generateInsightNarrative(d) {
      const el = document.getElementById('insightNarrative');
      el.innerHTML = '<span class="text-mut" style="font-size:0.85rem">✨ Generating summary…</span>';
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 400,
            messages: [{ role: 'user', content: buildAIPrompt(d) }]
          })
        });
        if (!res.ok) throw new Error('API ' + res.status);
        const json = await res.json();
        const text = (json.content || []).map(b => b.text || '').join('').trim();
        if (!text) throw new Error('empty');
        el.innerHTML = `<p style="margin:0">${U.esc(text).replace(/\n\n/g, '</p><p style="margin:12px 0 0">').replace(/\n/g, '<br>')}</p>`;
      } catch (e) {
        // Graceful fallback: build a rule-based narrative from the same data
        el.innerHTML = buildFallbackNarrative(d);
      }
    }

    function buildFallbackNarrative(d) {
      const name = d.pet.name || 'Your pet';
      const total = d.logs.length;
      const walks = d.counts['walk'] || 0;
      const feeds = d.counts['feed'] || 0;
      const accidents = d.counts['accident'] || 0;
      const range = d.rangeLabel;

      if (!total) return `<p style="margin:0;color:var(--text-2)">No activity was logged for ${name} during ${range}. Start logging walks, feedings, and health events to unlock AI summaries.</p>`;

      let parts = [];
      parts.push(`${name} had <strong>${total} logged event${total !== 1 ? 's' : ''}</strong> during ${range}.`);
      if (walks) parts.push(`Went on <strong>${walks} walk${walks !== 1 ? 's' : ''}</strong>.`);
      if (feeds) parts.push(`Had <strong>${feeds} feeding${feeds !== 1 ? 's' : ''}</strong>.`);
      if (d.wDelta !== null) parts.push(`Weight ${d.wDelta > 0 ? 'increased' : d.wDelta < 0 ? 'decreased' : 'stayed stable'} by <strong>${Math.abs(d.wDelta)} lbs</strong>.`);
      if (accidents) parts.push(`<span style="color:var(--gold)">⚠️ ${accidents} accident${accidents !== 1 ? 's' : ''} recorded — worth mentioning to your vet.</span>`);
      if (d.overdueVaccs.length) parts.push(`<span style="color:var(--alert)">⚠️ Overdue vaccinations: ${d.overdueVaccs.map(v => v.name).join(', ')}.</span>`);
      if (d.upcomingMeds.length) parts.push(`Medications due soon: ${d.upcomingMeds.map(m => m.name).join(', ')}.`);

      return `<p style="margin:0">${parts.join(' ')}</p>`;
    }

    function renderInsights() {
      if (!S.activePetId) {
        ['insightStatGrid', 'insightNarrative', 'insightVetReport', 'insightBreakdown', 'insightNotesFeed'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = '<div class="text-mut" style="font-size:0.85rem">Add a pet first to see insights.</div>';
        });
        return;
      }

      // Range tab wiring
      document.querySelectorAll('#insightRangeTabs [data-irange]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.irange === _insightRange);
        btn.onclick = () => { _insightRange = btn.dataset.irange; renderInsights(); };
      });

      const d = buildInsightData(S.activePetId, _insightRange);

      renderInsightStatGrid(d);
      renderInsightBreakdown(d);
      renderInsightWeightChart(d);
      renderInsightNotesFeed(d);

      // Vet report (always deterministic, no AI)
      const report = buildVetReport(d);
      document.getElementById('insightVetReport').innerHTML = `<pre style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-family:var(--font-mono,monospace);font-size:0.78rem;margin:0;color:var(--text-2);max-width:100%">${U.esc(report)}</pre>`;

      // AI narrative — only generate if not already showing the same pet+range
      const cacheKey = S.activePetId + '|' + _insightRange;
      const cached = document.getElementById('insightNarrative').dataset.cacheKey;
      if (cached !== cacheKey) {
        document.getElementById('insightNarrative').dataset.cacheKey = cacheKey;
        generateInsightNarrative(d);
      }

      // Refresh button
      document.getElementById('insightRefreshBtn').onclick = () => {
        document.getElementById('insightNarrative').dataset.cacheKey = '';
        generateInsightNarrative(d);
      };

      // Copy vet report
      document.getElementById('insightCopyBtn').onclick = async () => {
        try { await navigator.clipboard.writeText(report); U.toast('Report copied to clipboard', 'success'); }
        catch { U.toast('Copy failed', 'error'); }
      };

      // Print vet report
      document.getElementById('insightPrintBtn').onclick = () => {
        const pet = d.pet;
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><title>Vet Report – ${U.esc(pet.name || 'Pet')}</title>
<style>body{font-family:monospace;font-size:13px;line-height:1.75;padding:32px;color:#111;max-width:680px;margin:0 auto}
h1{font-size:16px;margin:0 0 4px}p{margin:4px 0}pre{white-space:pre-wrap;font-family:inherit}
@media print{body{padding:0}}</style></head>
<body><pre>${U.esc(report)}</pre><script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
        win.document.close();
      };
    }

    function renderReminders() {
      const list = S.reminders.filter(r => !r.petId || r.petId === S.activePetId);
      const el = document.getElementById('remList');
      el.innerHTML = list.length ? list.map(r => {
        const followUpLabel = r.followUpMinutes ? ` · re-alerts in ${r.followUpMinutes >= 60 ? (r.followUpMinutes / 60) + 'h' : r.followUpMinutes + 'min'}` : '';
        return `
    <div class="rem" data-edit-rem="${r.id}" style="cursor:pointer">
      <div class="rem-ic ${LOG_TYPES[r.logType]?.cls || 'ic-brand'}">${Icon(LOG_TYPES[r.logType]?.icon || 'alarm')}</div>
      <div class="rem-body">
        <div class="rem-title">${U.esc(r.title)}</div>
        <div class="rem-meta">${r.time} · ${formatDays(r.days)}${followUpLabel}</div>
      </div>
      <button class="feed-del" data-del-r="${r.id}">${Icon('trash')}</button>
      <div class="switch ${r.on ? 'on' : ''}" data-tog="${r.id}"></div>
    </div>
  `;
      }).join('') : `<div class="card"><div class="empty"><div class="empty-ic">${Icon('alarm')}</div><div class="empty-title">No reminders</div><div class="empty-sub">Set alarms for walks, feeds, meds & more</div></div></div>`;
      el.querySelectorAll('[data-edit-rem]').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.closest('[data-del-r]') || e.target.closest('[data-tog]')) return;
          openEditRemModal(el.dataset.editRem);
        });
      });
      el.querySelectorAll('[data-tog]').forEach(s => s.onclick = (e) => {
        e.stopPropagation();
        const r = S.reminders.find(x => x.id === s.dataset.tog);
        r.on = !r.on; DB.put('reminders', r).then(() => { loadAll(); renderReminders(); });
      });
      el.querySelectorAll('[data-del-r]').forEach(b => b.onclick = async (e) => {
        e.stopPropagation();
        if (await U.confirm('Delete reminder?', 'This reminder will no longer fire.')) {
          await DB.del('reminders', b.dataset.delR); await loadAll(); renderReminders();
        }
      });
    }
    function openRemModal() {
      const now = new Date(); const t = now.toTimeString().slice(0, 5);
      openModal({
        title: 'Add reminder',
        body: `
      <div class="form-row"><label>Title *</label><input id="rTitle" placeholder="Morning walk" /></div>
      <div class="form-grid">
        <div class="form-row"><label>Type</label><select id="rType">${Object.keys(LOG_TYPES).map(k => `<option value="${k}">${LOG_TYPES[k].label}</option>`).join('')}</select></div>
        <div class="form-row"><label>Time</label><input type="time" id="rTime" value="${t}" /></div>
      </div>
      <div class="form-row"><label>Repeat on days</label>
        <div class="row" id="daysRow" style="gap:6px;flex-wrap:wrap">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<button type="button" class="chart-tab" data-d="${i}" style="flex:1">${d}</button>`).join('')}
        </div>
      </div>
      <div class="form-row"><label>Remind me again if not done</label>
        <select id="rFollowUp">
          <option value="0" selected>Off</option>
          <option value="15">15 min later</option>
          <option value="30">30 min later</option>
          <option value="45">45 min later</option>
          <option value="60">1 hour later</option>
          <option value="120">2 hours later</option>
        </select>
      </div>
      <div class="form-row"><label>Notes</label><input id="rNote" placeholder="Optional" /></div>
    `,
        actions: [{ label: 'Cancel', v: false }, { label: 'Add', kind: 'primary', v: true }],
        onOpen: (b) => {
          const selected = new Set([1, 2, 3, 4, 5, 6, 0]);
          const upd = () => b.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('active', selected.has(+x.dataset.d)));
          b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { const i = +x.dataset.d; if (selected.has(i)) selected.delete(i); else selected.add(i); upd(); });
          upd();
          b._save = async () => {
            const title = b.querySelector('#rTitle').value.trim();
            if (!title) return U.toast('Title required', 'error');
            const rem = {
              id: U.id(), petId: S.activePetId, title,
              logType: b.querySelector('#rType').value,
              time: b.querySelector('#rTime').value,
              days: [...selected].sort(),
              note: b.querySelector('#rNote').value.trim(),
              followUpMinutes: U.safeNum(b.querySelector('#rFollowUp').value) || 0,
              followUpAt: null,
              on: true, createdAt: Date.now()
            };
            await DB.put('reminders', rem); await loadAll(); renderReminders();
            if (S.settings.notifications) requestNotifPermission();
            U.toast('Reminder added', 'success'); return true;
          };
        },
        onAction: async (v, close, b) => { if (!v) return close(); if (await b._save()) close(); }
      });
    }
    function openEditRemModal(remId) {
      const rem = S.reminders.find(r => r.id === remId);
      if (!rem) return;
      
      openModal({
        title: `Edit reminder`,
        body: `
      <div class="form-row"><label>Title *</label><input id="rTitle" value="${U.esc(rem.title)}" placeholder="Morning walk" /></div>
      <div class="form-grid">
        <div class="form-row"><label>Type</label><select id="rType">${Object.keys(LOG_TYPES).map(k => `<option value="${k}" ${k === rem.logType ? 'selected' : ''}>${LOG_TYPES[k].label}</option>`).join('')}</select></div>
        <div class="form-row"><label>Time</label><input type="time" id="rTime" value="${rem.time}" /></div>
      </div>
      <div class="form-row"><label>Repeat on days</label>
        <div class="row" id="daysRow" style="gap:6px;flex-wrap:wrap">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<button type="button" class="chart-tab" data-d="${i}" style="flex:1">${d}</button>`).join('')}
        </div>
      </div>
      <div class="form-row"><label>Remind me again if not done</label>
        <select id="rFollowUp">
          <option value="0" ${!rem.followUpMinutes ? 'selected' : ''}>Off</option>
          <option value="15" ${rem.followUpMinutes === 15 ? 'selected' : ''}>15 min later</option>
          <option value="30" ${rem.followUpMinutes === 30 ? 'selected' : ''}>30 min later</option>
          <option value="45" ${rem.followUpMinutes === 45 ? 'selected' : ''}>45 min later</option>
          <option value="60" ${rem.followUpMinutes === 60 ? 'selected' : ''}>1 hour later</option>
          <option value="120" ${rem.followUpMinutes === 120 ? 'selected' : ''}>2 hours later</option>
        </select>
      </div>
      <div class="form-row"><label>Notes</label><input id="rNote" value="${U.esc(rem.note || '')}" placeholder="Optional" /></div>
    `,
        actions: [{ label: 'Cancel', v: false }, { label: 'Delete', kind: 'danger', v: 'delete' }, { label: 'Save', kind: 'primary', v: true }],
        onOpen: (b) => {
          const selected = new Set(rem.days || []);
          const upd = () => b.querySelectorAll('[data-d]').forEach(x => x.classList.toggle('active', selected.has(+x.dataset.d)));
          b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { const i = +x.dataset.d; if (selected.has(i)) selected.delete(i); else selected.add(i); upd(); });
          upd();
          b._save = async () => {
            const title = b.querySelector('#rTitle').value.trim();
            if (!title) return U.toast('Title required', 'error');
            rem.title = title;
            rem.logType = b.querySelector('#rType').value;
            rem.time = b.querySelector('#rTime').value;
            rem.days = [...selected].sort();
            rem.note = b.querySelector('#rNote').value.trim();
            rem.followUpMinutes = U.safeNum(b.querySelector('#rFollowUp').value) || 0;
            // If follow-ups were turned off, cancel any already-pending one
            if (!rem.followUpMinutes) rem.followUpAt = null;
            await DB.put('reminders', rem); await loadAll(); renderReminders();
            U.toast('Reminder updated', 'success'); return true;
          };
        },
        onAction: async (v, close, b) => { 
          if (v === 'delete') {
            if (await U.confirm('Delete reminder?', 'This reminder will no longer fire.')) {
              await DB.del('reminders', remId); await loadAll(); renderReminders(); close();
            }
            return;
          }
          if (!v) return close(); 
          if (await b._save()) close(); 
        }
      });
    }
    function getUpcomingAlarms(n) {
      const now = new Date();
      const soon = [];
      S.reminders.filter(r => r.on).forEach(r => {
        const [h, mi] = r.time.split(':').map(Number);
        for (let i = 0; i < 7; i++) {
          const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(h, mi, 0, 0);
          if (d < now) continue;
          if (!r.days || r.days.includes(d.getDay())) {
            const diff = d - now;
            const days = Math.floor(diff / 86400000);
            const hrs = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const txt = days ? `in ${days}d ${hrs}h` : hrs ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
            soon.push({ ...r, next: d, nextText: `${d.toLocaleDateString([], { weekday: 'short' })} ${r.time} · ${txt}` });
            break;
          }
        }
      });
      return soon.sort((a, b) => a.next - b.next).slice(0, n);
    }

    /* ================ Settings ================ */
    function renderSettings() {
      document.querySelectorAll('[data-set-theme]').forEach(b => {
        b.classList.toggle('active', b.dataset.setTheme === S.settings.theme);
        b.onclick = () => setTheme(b.dataset.setTheme);
      });
      const bindSw = (id, key, extra) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle('on', !!S.settings[key]);
        el.onclick = async () => {
          S.settings[key] = !S.settings[key];
          saveSettings(); renderSettings();
          if (extra) await extra();
        };
      };
      bindSw('notifSw', 'notifications', async () => { if (S.settings.notifications) await requestNotifPermission(); });
      bindSw('soundSw', 'sound');
      bindSw('vibSw', 'vibration', async () => { if (S.settings.vibration && navigator.vibrate) navigator.vibrate(60); });
      bindSw('quietSw', 'quietHours');

      const snz = document.getElementById('snoozeSel');
      if (snz) { snz.value = String(S.settings.snoozeMinutes); snz.onchange = () => { S.settings.snoozeMinutes = +snz.value; saveSettings(); }; }
      const qs = document.getElementById('quietStart'), qe = document.getElementById('quietEnd');
      if (qs) { qs.value = S.settings.quietStart; qs.onchange = () => { S.settings.quietStart = qs.value; saveSettings(); }; }
      if (qe) { qe.value = S.settings.quietEnd; qe.onchange = () => { S.settings.quietEnd = qe.value; saveSettings(); }; }
      const qr = document.getElementById('quietRow');
      if (qr) qr.style.opacity = S.settings.quietHours ? '1' : '0.4';

      const mt = document.getElementById('muteTypes');
      if (mt) {
        const muted = new Set(S.settings.mutedTypes || []);
        mt.innerHTML = Object.keys(LOG_TYPES).map(k => {
          const on = muted.has(k);
          return `<button type="button" class="chart-tab ${on ? '' : 'active'}" data-mute="${k}" style="flex:0 1 auto">${Icon(LOG_TYPES[k].icon)} ${LOG_TYPES[k].label}${on ? ' ' + Icon('bellOff') : ''}</button>`;
        }).join('');
        mt.querySelectorAll('[data-mute]').forEach(b => b.onclick = () => {
          const k = b.dataset.mute;
          if (muted.has(k)) muted.delete(k); else muted.add(k);
          S.settings.mutedTypes = [...muted]; saveSettings(); renderSettings();
        });
      }

      // Cloud sync buttons
      const pushBtn = document.getElementById('syncPushBtn');
      if (pushBtn) pushBtn.onclick = () => SYNC.pushToCloud();

      const pullBtn = document.getElementById('syncPullBtn');
      if (pullBtn) pullBtn.onclick = () => SYNC.restoreFromCloud();

      const delBtn = document.getElementById('syncDelBtn');
      if (delBtn) delBtn.onclick = () => SYNC.deleteCloudBackup();

      const syncStatus = document.getElementById('syncStatus');
      if (syncStatus) {
        const lastPush = Number(localStorage.getItem('tinkl_last_sync_push') || 0);
        syncStatus.textContent = lastPush === 0 ? 'never' : U.rel(lastPush);
      }
    }
    function setTheme(t) {
      S.settings.theme = t; document.body.setAttribute('data-theme', t); saveSettings();
      const icons = { dark: Icon('moon'), light: Icon('sun'), aurora: Icon('sparkle'), sunset: Icon('sunset'), midnight: Icon('stars'), nebula: Icon('comet'), blossom: Icon('gem'), abyss: Icon('wave') };
      document.getElementById('themeBtn').innerHTML = icons[t] || Icon('moon');
      const metaColors = { dark: '#0b0d16', light: '#f2f4fb', aurora: '#04120f', sunset: '#170a12', midnight: '#060714', nebula: '#0a0618', blossom: '#1a0e14', abyss: '#020c14' };
      document.querySelector('meta[name="theme-color"]').setAttribute('content', metaColors[t] || '#0b0d16');
      renderSettings(); render(currentView());
    }

    async function requestNotifPermission() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') return true;
      if (Notification.permission === 'denied') { U.toast('Notifications are blocked in browser settings', 'error'); return false; }
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') { U.toast('Notifications enabled', 'success'); return true; }
      } catch (e) { }
      return false;
    }

    // iOS Home Screen PWAs (iOS 16.4+) only reliably support notifications
    // fired through a ServiceWorkerRegistration, not the bare `new
    // Notification()` constructor. Prefer the SW path everywhere; fall back
    // to the constructor for browsers/contexts without an active SW.
    async function showAlarmNotification(r, label, quiet) {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const opts = {
        body: (r.note || 'Time for ' + label) + ' — tap for options',
        icon: '/tinkl-logo-paw3-192.png', badge: '/tinkl-logo-paw3-192.png',
        tag: r.id, renotify: true, silent: !!quiet,
      };
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.showNotification) {
            await reg.showNotification('TINKL · ' + r.title, opts);
            return;
          }
        }
        new Notification('TINKL · ' + r.title, opts);
      } catch (e) { }
    }

    function inQuietHours(d = new Date()) {
      if (!S.settings.quietHours) return false;
      const [sh, sm] = (S.settings.quietStart || '22:00').split(':').map(Number);
      const [eh, em] = (S.settings.quietEnd || '07:00').split(':').map(Number);
      const cur = d.getHours() * 60 + d.getMinutes();
      const s = sh * 60 + sm, e = eh * 60 + em;
      return s === e ? false : s < e ? (cur >= s && cur < e) : (cur >= s || cur < e);
    }

    /* ================ Alarm firing ================ */
    function fireAlarm(r, isFollowUp = false) {
      if (S.activeAlarms.has(r.id)) return;
      S.activeAlarms.add(r.id);
      const emoji = LOG_TYPES[r.logType]?.emoji || '⏰';
      const label = LOG_TYPES[r.logType]?.label || 'care';
      const quiet = inQuietHours();

      // Per-reminder auto follow-up: if this reminder has one configured,
      // schedule it the moment the alarm fires — independent of whatever
      // the user does with this popup (skip/snooze/ignore). Only "Done"
      // cancels it, since the task's been taken care of. This is separate
      // from the global manual Snooze button/minutes.
      if (!isFollowUp && r.followUpMinutes) {
        r.followUpAt = Date.now() + r.followUpMinutes * 60000;
        DB.put('reminders', r).catch(() => { });
      }

      if (!quiet) {
        if (S.settings.vibration && navigator.vibrate) navigator.vibrate([160, 80, 160, 80, 240]);
        if (S.settings.sound) beep();
        showAlarmNotification(r, label, false, isFollowUp);
      }

      openModal({
        title: `${emoji} ${isFollowUp ? 'Still need to: ' : ''}${r.title}`,
        body: `
      <p class="text-mut" style="margin:0 0 4px">${U.esc(r.note || 'Time for ' + label + '.')}</p>
      <p class="text-mut" style="font-size:0.8rem;margin:0">${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · ${formatDays(r.days)}${quiet ? ' · 🌙 quiet hours' : ''}${isFollowUp ? ' · follow-up reminder' : ''}</p>
    `,
        actions: [
          { label: `⏭ Skip`, kind: 'secondary', v: 'skip' },
          { label: `⏰ Snooze ${S.settings.snoozeMinutes}m`, kind: 'secondary', v: 'snooze' },
          { label: `✅ Done`, kind: 'primary', v: 'done' },
        ],
        onAction: async (v, close) => {
          S.activeAlarms.delete(r.id);
          if (v === 'snooze') {
            r.snoozedUntil = Date.now() + S.settings.snoozeMinutes * 60000;
            await DB.put('reminders', r);
            U.toast(`Snoozed ${S.settings.snoozeMinutes} min`, 'info');
          } else if (v === 'skip') {
            U.toast('Skipped this occurrence', 'info');
          } else if (v === 'done') {
            if (r.logType && LOG_TYPES[r.logType]) {
              await DB.put('logs', { id: U.id(), petId: r.petId || S.activePetId, type: r.logType, ts: Date.now(), note: `Auto-logged from “${r.title}”` });
              await loadAll();
            }
            // Task is done — cancel any pending auto follow-up for this reminder
            if (r.followUpAt) { r.followUpAt = null; await DB.put('reminders', r); }
            U.toast(`Logged ${label}`, 'success');
          }
          render(currentView());
          close();
        },
      });
    }

    /* ================ Alarm loop ================ */
    // Fired-reminder de-dup state persists across reloads (same day only),
    // since S.firedReminders is in-memory and would otherwise reset every
    // time the page reloads (e.g. iOS reloading a suspended background tab).
    function loadFiredLog() {
      try {
        const raw = localStorage.getItem('tinkl_fired_log');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && data.date === new Date().toDateString() && Array.isArray(data.ids)) {
          data.ids.forEach(id => S.firedReminders.add(id));
        }
      } catch (e) { }
    }
    function saveFiredLog() {
      try {
        localStorage.setItem('tinkl_fired_log', JSON.stringify({ date: new Date().toDateString(), ids: [...S.firedReminders] }));
      } catch (e) { }
    }

    function checkAlarms() {
      if (!S.settings.notifications) return;
      const now = new Date();
      const key = now.toDateString() + '|' + now.getHours() + ':' + now.getMinutes();
      let firedAny = false;
      S.reminders.filter(r => r.on).forEach(r => {
        if (S.settings.mutedTypes && S.settings.mutedTypes.includes(r.logType)) return;

        // ── Per-reminder auto follow-up ──────────────────────────────────────
        // followUpAt is a concrete epoch timestamp set by fireAlarm() the
        // moment the *original* alarm fires. If it has elapsed and hasn't
        // been cleared by the user hitting "Done", fire a follow-up alarm
        // and then clear the timestamp so it doesn't keep re-firing.
        if (r.followUpAt && r.followUpAt <= Date.now()) {
          const fk = r.id + '|followup|' + r.followUpAt;
          if (!S.firedReminders.has(fk)) {
            S.firedReminders.add(fk);
            firedAny = true;
            r.followUpAt = null;                          // clear so it won't re-fire
            DB.put('reminders', r).catch(() => { });
            fireAlarm(r, true);                           // isFollowUp = true
          }
          return; // don't also check scheduled time this same tick
        }

        // ── Snooze (manual, global) ──────────────────────────────────────────
        if (r.snoozedUntil && r.snoozedUntil > Date.now()) return;
        let due = false;
        if (r.snoozedUntil && r.snoozedUntil <= Date.now()) {
          due = true;
          r.snoozedUntil = null;
          DB.put('reminders', r).catch(() => { });
        } else {
          // ── Scheduled time ────────────────────────────────────────────────
          const [h, mi] = r.time.split(':').map(Number);
          if (h === now.getHours() && mi === now.getMinutes() && (!r.days || r.days.includes(now.getDay()))) due = true;
        }
        if (!due) return;
        const fk = r.id + '|' + key;
        if (S.firedReminders.has(fk)) return;
        S.firedReminders.add(fk);
        firedAny = true;
        fireAlarm(r, false);
      });
      if (firedAny) saveFiredLog();
      localStorage.setItem('tinkl_last_active', String(Date.now()));
    }

    // Mobile browsers throttle or fully suspend JS timers while the tab is
    // backgrounded or the device is locked — most aggressively on iOS. That
    // means a reminder due at 3:00pm while the phone was locked simply never
    // fires. There's no way to run real background alarms without a native
    // push server, but we can at least catch up gracefully: when the app
    // becomes active again, look back over the gap and surface anything
    // that was missed instead of silently losing it.
    function catchUpMissedAlarms() {
      if (!S.settings.notifications) return;
      const lastStr = localStorage.getItem('tinkl_last_active');
      const now = Date.now();
      if (!lastStr) { localStorage.setItem('tinkl_last_active', String(now)); return; }
      const last = +lastStr;
      const gapMs = now - last;
      if (gapMs < 30000) return;
      const lookbackMs = Math.min(gapMs, 12 * 3600000);
      const from = now - lookbackMs;
      let missed = [];
      S.reminders.filter(r => r.on).forEach(r => {
        if (S.settings.mutedTypes && S.settings.mutedTypes.includes(r.logType)) return;

        // ── Missed follow-up ─────────────────────────────────────────────────
        // If the tab was asleep when a follow-up timestamp elapsed, surface it
        // now on wake-up. Clear followUpAt so it can't fire a second time.
        if (r.followUpAt && r.followUpAt > from && r.followUpAt <= now) {
          const fk = r.id + '|followup|' + r.followUpAt;
          if (!S.firedReminders.has(fk)) {
            S.firedReminders.add(fk);
            missed.push({ r, isFollowUp: true });
            r.followUpAt = null;
            DB.put('reminders', r).catch(() => { });
          }
          return;
        }

        // ── Missed scheduled alarm ───────────────────────────────────────────
        const [h, mi] = (r.time || '00:00').split(':').map(Number);
        for (let i = 0; i < 2; i++) {
          const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(h, mi, 0, 0);
          const t = d.getTime();
          if (t > now - 60000 || t < from) continue;
          if (!r.days || r.days.includes(d.getDay())) {
            const fk = r.id + '|' + d.toDateString() + '|' + h + ':' + mi;
            if (!S.firedReminders.has(fk)) {
              S.firedReminders.add(fk);
              missed.push({ r, isFollowUp: false });
            }
            break;
          }
        }
      });
      if (missed.length) {
        saveFiredLog();
        const label = missed.length === 1
          ? `Missed "${missed[0].r.title}"${missed[0].isFollowUp ? ' (follow-up)' : ''} while away`
          : `Missed ${missed.length} reminders while away`;
        U.toast(label, 'info');
      }
      localStorage.setItem('tinkl_last_active', String(now));
    }

    /* ================ Birthdays ================ */
    // Fires a one-time-per-year notification when today matches a pet's
    // stored birthday (month + day). Dedup is keyed by pet+year so it can
    // never double-fire on reload, and reuses the existing notification /
    // quiet-hours plumbing rather than a separate ad-hoc path.
    function loadFiredBirthdaysLog() {
      try {
        const raw = localStorage.getItem('tinkl_fired_birthdays');
        return raw ? new Set(JSON.parse(raw)) : new Set();
      } catch (e) { return new Set(); }
    }
    function saveFiredBirthdaysLog(set) {
      try { localStorage.setItem('tinkl_fired_birthdays', JSON.stringify([...set])); } catch (e) { }
    }
    function checkBirthdays() {
      if (!S.settings.notifications) return;
      const today = new Date();
      const fired = loadFiredBirthdaysLog();
      let firedAny = false;
      S.pets.forEach(p => {
        if (!p.birthday) return;
        const bday = new Date(p.birthday);
        if (Number.isNaN(bday.getTime())) return;
        if (bday.getMonth() !== today.getMonth() || bday.getDate() !== today.getDate()) return;
        const key = p.id + '|' + today.getFullYear();
        if (fired.has(key)) return;
        fired.add(key);
        firedAny = true;
        const quiet = inQuietHours();
        if (!quiet) {
          if (S.settings.vibration && navigator.vibrate) navigator.vibrate([160, 80, 160, 80, 240]);
          if (S.settings.sound) beep();
          showBirthdayNotification(p);
        }
        U.toast(`🎉 Happy Birthday, ${p.name}!`, 'success');
      });
      if (firedAny) saveFiredBirthdaysLog(fired);
    }
    async function showBirthdayNotification(p) {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const opts = {
        body: `Hope ${p.name}${p.breed ? ` the ${p.breed}` : ''} has a great day! 🎉`,
        icon: '/tinkl-logo-paw3-192.png', badge: '/tinkl-logo-paw3-192.png',
        tag: 'birthday-' + p.id, renotify: true,
      };
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.showNotification) { await reg.showNotification(`🎂 Happy Birthday, ${p.name}!`, opts); return; }
        }
        new Notification(`🎂 Happy Birthday, ${p.name}!`, opts);
      } catch (e) { }
    }

    setInterval(checkAlarms, 15000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { catchUpMissedAlarms(); checkAlarms(); checkBirthdays(); }
    });
    window.addEventListener('focus', () => { catchUpMissedAlarms(); checkAlarms(); checkBirthdays(); });


    function beep() {
      try {
        const c = new (window.AudioContext || window.webkitAudioContext)();
        const o = c.createOscillator(); const g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.frequency.value = 880; g.gain.value = 0.08;
        o.start(); setTimeout(() => { o.frequency.value = 1180; }, 120); setTimeout(() => { o.stop(); c.close(); }, 300);
      } catch (e) { }
    }

    /* ================ Export / Import ================ */
    function exportJSON() {
      const data = { pets: S.pets, logs: S.logs, reminders: S.reminders, weights: S.weights, meds: S.meds, vaccinations: S.vaccinations, notes: S.notes, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `tinkl-backup-${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url); U.toast('Exported', 'success');
    }
    function exportCSV() {
      const rows = [['pet', 'type', 'time', 'note']];
      const petMap = Object.fromEntries(S.pets.map(p => [p.id, p.name]));
      S.logs.forEach(l => rows.push([petMap[l.petId] || '', l.type, new Date(l.ts).toISOString(), (l.note || '').replace(/"/g, '""')]));
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `tinkl-logs-${Date.now()}.csv`; a.click();
      U.toast('CSV downloaded', 'success');
    }
    async function importJSON(file) {
      try {
        const txt = await file.text(); const data = JSON.parse(txt);
        for (const [k, arr] of Object.entries({ pets: data.pets, logs: data.logs, reminders: data.reminders, weights: data.weights, meds: data.meds, vaccinations: data.vaccinations, notes: data.notes })) {
          if (!Array.isArray(arr)) continue;
          for (const item of arr) await DB.put(k, item);
        }
        await loadAll(); render(currentView()); U.toast('Imported!', 'success');
      } catch (e) { U.toast('Import failed', 'error'); }
    }

    /* ================ Scroll-aware nav (auto-hide bottom nav + condensing topbar) ================
       Modern pattern used by Instagram/YouTube/Airbnb mobile: the tab bar
       slides away when the user scrolls down (reading/content-focused) and
       slides back the instant they scroll up (wants navigation again).
       Implemented with a single passive scroll listener + requestAnimationFrame
       throttling and CSS transform/opacity, so it's GPU-composited and never
       triggers layout — no dependency on scroll-driven CSS animations, which
       still isn't reliably supported across every WebKit/iOS version this
       PWA targets. */
    (function initScrollAwareNav() {
      const bnav = document.getElementById('bnav');
      const fab = document.getElementById('fab');
      const topbar = document.querySelector('.topbar');
      if (!bnav || !topbar) return;

      const mobileQuery = window.matchMedia('(max-width: 900px)');
      const HIDE_AFTER_Y = 80;   // don't hide until the user is meaningfully into the page
      const DELTA_THRESHOLD = 8; // ignore sub-pixel/rubber-band jitter
      const CONDENSE_AFTER_Y = 20;

      // Some mobile browsers report scroll position on documentElement/body
      // instead of window depending on quirks mode / zoom state — check all three.
      function getY() {
        return Math.max(
          window.scrollY || 0,
          document.documentElement.scrollTop || 0,
          document.body.scrollTop || 0
        );
      }

      let lastY = getY();
      let hidden = false;
      let condensed = false;
      let ticking = false;

      function apply() {
        const y = getY();
        const delta = y - lastY;
        const isMobile = mobileQuery.matches;

        // Condensed topbar: turns into a glass pill once scrolled at all.
        const shouldCondense = y > CONDENSE_AFTER_Y;
        if (shouldCondense !== condensed) {
          condensed = shouldCondense;
          topbar.classList.toggle('condensed', condensed);
        }

        // Auto-hide bottom nav + FAB: mobile only (desktop sidebar stays put).
        if (isMobile) {
          let shouldHide = hidden;
          if (y <= HIDE_AFTER_Y) {
            shouldHide = false; // always visible near the top of the page
          } else if (Math.abs(delta) > DELTA_THRESHOLD) {
            shouldHide = delta > 0; // scrolling down -> hide, scrolling up -> reveal
          }
          if (shouldHide !== hidden) {
            hidden = shouldHide;
            bnav.classList.toggle('nav-hide', hidden);
            if (fab) fab.classList.toggle('nav-hide', hidden);
          }
        } else if (hidden) {
          hidden = false;
          bnav.classList.remove('nav-hide');
          if (fab) fab.classList.remove('nav-hide');
        }

        lastY = y;
        ticking = false;
      }

      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(apply);
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true });
      mobileQuery.addEventListener('change', apply);

      // Re-evaluate whenever a view switch resets scroll to the top
      // (goto() already calls window.scrollTo(0,0) — this just syncs classes
      // immediately instead of waiting for the next scroll event).
      window.addEventListener('tinkl:view-change', apply);

      // Safari's back-forward cache (and Android app-switcher return) can
      // restore a mid-scroll page without firing a fresh scroll event —
      // resync state whenever the page becomes visible again.
      window.addEventListener('pageshow', apply);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') apply();
      });

      // Sync immediately on load instead of waiting for the first scroll
      // event, in case the browser restored a non-zero scroll position.
      apply();
    })();

    /* ================ Bind ================ */
    document.getElementById('addPetBtn').onclick = () => openPetModal();
    document.getElementById('addLogBtn').onclick = () => showLogPicker();
    document.getElementById('fab').onclick = () => showLogPicker();
    document.getElementById('addRemBtn').onclick = () => openRemModal();
    document.getElementById('addMedBtn').onclick = () => openMedModal();
    document.getElementById('addVacBtn').onclick = () => openVacModal();
    document.getElementById('addWeightBtn').onclick = () => openWeightModal();
    document.getElementById('addNoteBtn').onclick = () => openNoteModal();
    document.getElementById('themeBtn').onclick = () => setTheme(S.settings.theme === 'dark' ? 'light' : 'dark');
    document.getElementById('notifBtn').onclick = () => goto('reminders');
    document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('exportBtn').onclick = exportJSON;
    document.getElementById('csvBtn').onclick = exportCSV;
    document.getElementById('importFile').onchange = (e) => e.target.files[0] && importJSON(e.target.files[0]);
    document.getElementById('resetBtn').onclick = async () => {
      if (await U.confirm('Reset everything?', 'This deletes ALL your data. Cannot be undone.')) {
        for (const s of ['pets', 'logs', 'reminders', 'weights', 'meds', 'vaccinations', 'notes']) await DB.clear(s);
        localStorage.removeItem('tinkl_settings'); localStorage.removeItem('tinkl_active');
        localStorage.removeItem('tinkl_fired_log'); localStorage.removeItem('tinkl_last_active');
        S.firedReminders.clear();
        await loadAll(); goto('dashboard'); U.toast('Reset complete', 'info');
      }
    };
    document.querySelectorAll('[data-view]').forEach(n => n.onclick = () => goto(n.dataset.view));
    document.addEventListener('click', (e) => {
      const sb = document.getElementById('sidebar');
      if (sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('#menuBtn')) sb.classList.remove('open');
    });

    /* ================ Init ================ */
    function updateOnlineStatus() {
      S.online = navigator.onLine;
      const bar = document.getElementById('offlineBar');
      if (bar) bar.style.display = S.online ? 'none' : 'block';
    }
    window.addEventListener('online', () => { updateOnlineStatus(); U.toast('Back online', 'success'); });
    window.addEventListener('offline', () => { updateOnlineStatus(); U.toast('You’re offline — data still saves locally', 'info'); });

    (async () => {
      await DB.init();
      await SYNC.init();
      await loadAll();
      loadFiredLog();
      setTheme(S.settings.theme || 'dark');
      goto('dashboard');
      updateOnlineStatus();
      catchUpMissedAlarms();
      checkAlarms();
      checkBirthdays();
      if (S.settings.notifications && 'Notification' in window && Notification.permission === 'default') {
        setTimeout(requestNotifPermission, 4000);
      }
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          if (reg && reg.update) reg.update().catch(() => { });
          navigator.serviceWorker.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'notif-action' && e.data.tag) {
              const r = S.reminders.find(x => x.id === e.data.tag);
              if (r) fireAlarm(r);
            }
          });
        } catch (e) { }
      }
    })();

  