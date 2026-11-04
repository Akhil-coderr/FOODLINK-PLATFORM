export const FOOD_CATEGORIES = [
  'Cooked Meals',
  'Rice and Biryani',
  'Fresh Vegetables',
  'Fresh Fruits',
  'Bakery Products',
  'Bread and Buns',
  'Packaged Food',
  'Grocery Items',
  'Breakfast Items',
  'Lunch Meals',
  'Dinner Meals',
  'Snacks',
  'Dairy Products',
  'Canned Food',
  'Freshly Prepared Meals',
  'Raw Ingredients',
  'Beverages',
  'Other',
];

export const FOOD_TYPES = [
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'raw', label: 'Raw Ingredients' },
  { value: 'packaged', label: 'Packaged / Canned' },
  { value: 'bakery', label: 'Bakery & Bread' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables' },
  { value: 'dairy', label: 'Dairy & Eggs' },
  { value: 'other', label: 'Other' },
];

export const QUANTITY_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'packets', label: 'Packets / Boxes' },
  { value: 'servings', label: 'Portions / Servings' },
];

export const STORAGE_CONDITIONS = [
  { value: 'ambient', label: 'Ambient / Room Temperature' },
  { value: 'refrigerated', label: 'Refrigerated (0 - 4°C)' },
  { value: 'frozen', label: 'Frozen (-18°C or below)' },
  { value: 'hot_holding', label: 'Hot Holding (60°C or above)' },
];

export const DONOR_ORGANIZATION_TYPES = [
  { value: 'restaurant', label: 'Restaurant / Cafe' },
  { value: 'hotel', label: 'Hotel / Resort' },
  { value: 'hostel', label: 'College / Working Hostel' },
  { value: 'catering', label: 'Catering / Event Services' },
  { value: 'event_organizer', label: 'Event / Wedding Organizer' },
  { value: 'supermarket', label: 'Supermarket / Grocery Store' },
  { value: 'corporate', label: 'Corporate Cafeteria' },
  { value: 'individual', label: 'Individual / Household' },
  { value: 'other', label: 'Other' },
];

export const VEHICLE_TYPES = [
  { value: 'bike', label: 'Motorcycle / Scooter' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'car', label: 'Four Wheeler / Car' },
  { value: 'van', label: 'Delivery Van' },
  { value: 'truck', label: 'Mini Truck' },
  { value: 'walking', label: 'Foot / Public Transit' },
];

export const DONATION_STATUS = {
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  VOLUNTEER_ASSIGNED: 'VOLUNTEER_ASSIGNED',
  PICKUP_IN_PROGRESS: 'PICKUP_IN_PROGRESS',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FLAGGED: 'FLAGGED',
};

// Conversion factors for impact calculations (averages backed by FAO & WRAP standards)
export const IMPACT_FACTORS = {
  // 1 kg of surplus food translates on average to ~2.2 meals (approx 450g per standard meal portion)
  MEALS_PER_KG: 2.2,
  // 1 kg of saved food prevents ~2.5 kg CO2e greenhouse emissions
  CARBON_KG_PER_KG_FOOD: 2.5,
  // Approximate standard conversion from units to kg when exact mass is not specified:
  UNIT_TO_KG_ESTIMATE: {
    kg: 1.0,
    liters: 1.0,
    packets: 0.5,
    servings: 0.45,
  },
};
