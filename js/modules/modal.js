// Modal — extracted from legacy.js lines 606-631.

import { U } from './utils.js';
import { Icon } from './icons.js';

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

export { openModal };
