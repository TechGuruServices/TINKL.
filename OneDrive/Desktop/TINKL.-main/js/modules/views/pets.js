// Pets view — extracted from legacy.js lines 859-930.

import { DB } from '../db.js';
import { S } from '../state.js';
import { U, loadAll, setActive } from '../utils.js';
import { Icon } from '../icons.js';
import { LOG_TYPES } from '../logTypes.js';
import { openModal } from '../modal.js';
import { openPetModal } from '../camera.js';
import { render } from '../navigation.js';

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
      setActive(el.dataset.sw); close(); render('dashboard');
    }))
  });
}

export { renderPets, showPetSwitcher };
