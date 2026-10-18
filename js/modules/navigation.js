// Navigation — goto() + currentView() from legacy.js (lines 579-590, 775);
// render() dispatches through a view registry wired up by js/app.js.

/* ================ Navigation ================ */
// View-render dispatch uses a registry (populated by js/app.js) instead of
// a static switch, so view modules can call render(view)/goto(view) without
// creating import cycles back from a central dispatcher.
const viewRenderers = new Map();

/** Register a view name -> render function. Called once per view by js/app.js. */
function registerView(name, fn) { viewRenderers.set(name, fn); }

/** Render a view by name. Unknown names are a no-op (as in legacy). */
function render(view) {
  const fn = viewRenderers.get(view);
  if (fn) fn();
}

function goto(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const t = document.getElementById('view-' + view);
  if (t) t.classList.add('active');
  document.querySelectorAll('[data-view]').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  const titles = { dashboard: 'Dashboard', pets: 'My Pets', care: 'Care Log', health: 'Health', history: 'History', stats: 'Statistics', reminders: 'Reminders', settings: 'Settings', household: 'Household' };
  document.getElementById('pageTitle').textContent = titles[view] || 'TINKL';
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event('tinkl:view-change'));
  render(view);
}

function currentView() { return document.querySelector('.view.active')?.id.replace('view-', '') || 'dashboard'; }

export { registerView, render, goto, currentView };
