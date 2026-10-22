// Log type registry — extracted from legacy.js lines 190-202.

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

export { LOG_TYPES };
