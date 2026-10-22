// App state — extracted from legacy.js lines 117-141.

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

export { S };
