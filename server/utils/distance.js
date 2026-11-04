/**
 * Haversine formula to compute great-circle distance between two points on Earth in kilometers.
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(2));
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Normalizes different units into estimated kilograms for fair aggregation.
 * Standard factors:
 * - 1 kg = 1.0 kg
 * - 1 liter = ~1.0 kg (liquids/curries)
 * - 1 packet / box = ~0.50 kg estimate
 * - 1 serving / portion = ~0.45 kg (standard meal mass)
 */
function normalizeToKg(quantity, unit) {
  const q = Number(quantity) || 0;
  switch (unit ? unit.toLowerCase() : 'kg') {
    case 'kg':
      return q;
    case 'liters':
    case 'l':
      return q * 1.0;
    case 'packets':
    case 'boxes':
      return Number((q * 0.5).toFixed(2));
    case 'servings':
    case 'meals':
    case 'portions':
      return Number((q * 0.45).toFixed(2));
    default:
      return q;
  }
}

/**
 * Calculates estimated meals saved from food mass in kilograms
 * Standard ~450g per average meal = ~2.2 meals per kg
 */
function calculateMealsSaved(kg) {
  return Math.round((Number(kg) || 0) * 2.2);
}

/**
 * Calculates estimated carbon offset (kg CO2e) avoided by redirecting food from landfill
 * FAO standard: 1 kg food waste in landfill emits ~2.5 kg CO2 equivalent greenhouse gases
 */
function calculateCarbonOffsetKg(kg) {
  return Number(((Number(kg) || 0) * 2.5).toFixed(2));
}

module.exports = {
  calculateDistanceKm,
  normalizeToKg,
  calculateMealsSaved,
  calculateCarbonOffsetKg,
};
