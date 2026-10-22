/* ============================================================================
 * breedData.js — healthy adult weight reference by breed.
 *
 * Zero imports. Ranges are widely-published breed-standard figures
 * (AKC / FCI / CFA breed standards and major veterinary references), kg
 * primary. These are reference bands for "where does this pet sit vs its
 * breed", not a diagnosis — individual healthy weight depends on frame,
 * sex, age, and the vet's assessment.
 *
 * Each row: { name, species: 'dog'|'cat', kg: [min, max] }.
 * Name spellings follow the breed picker in the legacy pet form
 * (js/legacy.js ~line 1316) so stored values match directly.
 * ========================================================================== */

const BREEDS = [
  // ---------------- Dogs (~46) ----------------
  { name: 'Labrador Retriever', species: 'dog', kg: [25, 36] },
  { name: 'Golden Retriever', species: 'dog', kg: [25, 34] },
  { name: 'German Shepherd', species: 'dog', kg: [22, 40] },
  { name: 'French Bulldog', species: 'dog', kg: [8, 14] },
  { name: 'Poodle', species: 'dog', kg: [18, 32] },          // Standard
  { name: 'Miniature Poodle', species: 'dog', kg: [4.5, 7] },
  { name: 'Toy Poodle', species: 'dog', kg: [1.8, 3.5] },
  { name: 'Bulldog', species: 'dog', kg: [18, 25] },
  { name: 'Rottweiler', species: 'dog', kg: [35, 60] },
  { name: 'Beagle', species: 'dog', kg: [9, 11] },
  { name: 'Dachshund', species: 'dog', kg: [7, 15] },
  { name: 'German Shorthaired Pointer', species: 'dog', kg: [20, 32] },
  { name: 'Pembroke Welsh Corgi', species: 'dog', kg: [10, 14] },
  { name: 'Australian Shepherd', species: 'dog', kg: [18, 29] },
  { name: 'Yorkshire Terrier', species: 'dog', kg: [2, 3.2] },
  { name: 'Boxer', species: 'dog', kg: [25, 36] },
  { name: 'Great Dane', species: 'dog', kg: [50, 79] },
  { name: 'Siberian Husky', species: 'dog', kg: [16, 27] },
  { name: 'Cavalier King Charles Spaniel', species: 'dog', kg: [5.5, 8] },
  { name: 'Doberman Pinscher', species: 'dog', kg: [32, 45] },
  { name: 'Miniature Schnauzer', species: 'dog', kg: [6, 9] },
  { name: 'Shih Tzu', species: 'dog', kg: [4, 7] },
  { name: 'Border Collie', species: 'dog', kg: [14, 20] },
  { name: 'Boston Terrier', species: 'dog', kg: [4.5, 11] },
  { name: 'Pomeranian', species: 'dog', kg: [1.5, 3] },
  { name: 'Havanese', species: 'dog', kg: [3.5, 6] },
  { name: 'Chihuahua', species: 'dog', kg: [1.5, 3] },
  { name: 'Shetland Sheepdog', species: 'dog', kg: [7, 11] },
  { name: 'Bernese Mountain Dog', species: 'dog', kg: [36, 52] },
  { name: 'Brittany', species: 'dog', kg: [14, 18] },
  { name: 'English Springer Spaniel', species: 'dog', kg: [18, 25] },
  { name: 'Pug', species: 'dog', kg: [6.5, 8] },
  { name: 'Cocker Spaniel', species: 'dog', kg: [12, 14] },
  { name: 'Australian Cattle Dog', species: 'dog', kg: [16, 22] },
  { name: 'Vizsla', species: 'dog', kg: [20, 29] },
  { name: 'Weimaraner', species: 'dog', kg: [25, 40] },
  { name: 'Newfoundland', species: 'dog', kg: [45, 68] },
  { name: 'Saint Bernard', species: 'dog', kg: [54, 82] },
  { name: 'Great Pyrenees', species: 'dog', kg: [39, 54] },
  { name: 'Mastiff', species: 'dog', kg: [68, 104] },
  { name: 'Akita', species: 'dog', kg: [32, 59] },
  { name: 'Shiba Inu', species: 'dog', kg: [8, 11] },
  { name: 'Belgian Malinois', species: 'dog', kg: [22, 34] },
  { name: 'Rhodesian Ridgeback', species: 'dog', kg: [32, 39] },
  { name: 'Dalmatian', species: 'dog', kg: [20, 32] },

  // ---------------- Cats (~13) ----------------
  { name: 'Domestic Shorthair', species: 'cat', kg: [3.5, 5.5] },
  { name: 'Domestic Longhair', species: 'cat', kg: [3.5, 6] },
  { name: 'Maine Coon', species: 'cat', kg: [5, 9] },
  { name: 'Siamese', species: 'cat', kg: [2.5, 5] },
  { name: 'Persian', species: 'cat', kg: [3, 5.5] },
  { name: 'Ragdoll', species: 'cat', kg: [5, 9] },
  { name: 'British Shorthair', species: 'cat', kg: [4, 8] },
  { name: 'Bengal', species: 'cat', kg: [3.5, 7] },
  { name: 'Sphynx', species: 'cat', kg: [3, 5.5] },
  { name: 'Abyssinian', species: 'cat', kg: [3, 5] },
  { name: 'Scottish Fold', species: 'cat', kg: [3, 6] },
  { name: 'Russian Blue', species: 'cat', kg: [3, 5.5] },
  { name: 'Norwegian Forest Cat', species: 'cat', kg: [4, 9] },
];

const KG_TO_LB = 2.20462;

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function findBreed(species, breed) {
  const b = norm(breed);
  if (!b || b === 'unknown' || b.includes('mix') || b.includes('mutt')) return null;
  const sp = norm(species);
  const rows = BREEDS.filter(r => r.species === sp);
  if (!rows.length) return null;
  // 1) exact match
  let row = rows.find(r => norm(r.name) === b);
  // 2) one side contains the other ("domestic shorthair cat" -> "domestic shorthair")
  if (!row) row = rows.find(r => b.includes(norm(r.name)) || norm(r.name).includes(b));
  return row || null;
}

/* ------------------------------------------------------------------ */
/** Where a weight sits inside the breed's healthy adult band.
 *  Returns { percentile (0-100 rounded), minKg, maxKg, minLb, maxLb }
 *  or null when the breed/species can't be matched ("mix"/"unknown"/
 *  unmatched -> graceful null). */
export function breedPercentile(species, breed, weightKg) {
  const row = findBreed(species, breed);
  const w = typeof weightKg === 'string' ? parseFloat(weightKg) : weightKg;
  if (!row || !Number.isFinite(w)) return null;
  const [min, max] = row.kg;
  const clamped = Math.min(1, Math.max(0, (w - min) / (max - min)));
  return {
    percentile: Math.round(clamped * 100),
    minKg: min,
    maxKg: max,
    minLb: Math.round(min * KG_TO_LB * 10) / 10,
    maxLb: Math.round(max * KG_TO_LB * 10) / 10,
  };
}

/** All known breed rows (for pickers/diagnostics). */
export function allBreeds() {
  return BREEDS.map(r => ({ ...r, kg: [...r.kg] }));
}
