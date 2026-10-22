// Vaccine schedule reference data + suggestion math — legacy.js lines 204-323.

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

export { VACCINE_SCHEDULES, vaccinesForSpecies, findVaccineDef, suggestVaccineNextDue };
