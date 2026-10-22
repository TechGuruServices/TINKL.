// Photo source chooser + live camera + pet editor modal — legacy.js lines 932-1088.

import { DB } from './db.js';
import { S } from './state.js';
import { U, loadAll, setActive } from './utils.js';
import { Icon } from './icons.js';
import { openModal } from './modal.js';
import { render } from './navigation.js';

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
        render('pets'); render('dashboard');
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

export { openPhotoSourceChooser, openCameraCapture, openPetModal };
