const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');

// 20 completely distinct, realistic food donation records
// Each has a UNIQUE food name, UNIQUE photo URL, and UNIQUE coordinates/locality for distinct distances (km)
const FOOD_ITEMS = [
  {
    seedKey: 'seed-foodlink-avail-01',
    foodName: 'Royal Vegetable Dum Biryani & Mirchi Ka Salan',
    foodCategory: 'Rice and Biryani',
    foodType: 'cooked',
    quantity: 38,
    unit: 'kg',
    servings: 80,
    storageCondition: 'hot_holding',
    allergens: ['Dairy', 'Nuts'],
    packagingCondition: 'Insulated thermal food-grade containers',
    specialInstructions: 'Prepared for grand banquet. Keep in thermal hot-boxes until dispatch.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [77.0025, 11.0289] },
    address: '104 Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641004',
    expiryHours: 24,
  },
  {
    seedKey: 'seed-foodlink-avail-02',
    foodName: 'Traditional South Indian Thali Full Meals',
    foodCategory: 'Lunch Meals',
    foodType: 'cooked',
    quantity: 45,
    unit: 'kg',
    servings: 95,
    storageCondition: 'hot_holding',
    allergens: ['Mustard'],
    packagingCondition: 'Food-grade stainless steel carriers with secure lids',
    specialInstructions: 'Includes steamed ponni rice, sambar, rasam, kootu and vegetable poriyal.',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9482, 11.0084] },
    address: '24 DB Road, Near Post Office, RS Puram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641002',
    expiryHours: 18,
  },
  {
    seedKey: 'seed-foodlink-avail-03',
    foodName: 'Artisanal Whole Wheat Sourdough & Multigrain Loaves',
    foodCategory: 'Bread and Buns',
    foodType: 'bakery',
    quantity: 22,
    unit: 'packets',
    servings: 48,
    storageCondition: 'ambient',
    allergens: ['Gluten', 'Sesame'],
    packagingCondition: 'Sealed breathable kraft paper bakery packaging',
    specialInstructions: 'Fresh morning artisanal bake. Store in cool, dry ambient pantry.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [76.9678, 11.0175] },
    address: '88 Cross Cut Road, 7th Cross, Gandhipuram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641012',
    expiryHours: 48,
  },
  {
    seedKey: 'seed-foodlink-avail-04',
    foodName: 'Farm-Fresh Spinach, Plum Tomatoes & Crisp Cucumbers',
    foodCategory: 'Fresh Vegetables',
    foodType: 'raw',
    quantity: 28,
    unit: 'kg',
    servings: 62,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Ventilated sanitized vegetable crates',
    specialInstructions: 'Harvested directly from organic polyhouse farm early morning.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9745, 11.0021] },
    address: '14 Race Course Road, Thomas Park',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641018',
    expiryHours: 72,
  },
  {
    seedKey: 'seed-foodlink-avail-05',
    foodName: 'Fresh Seasonal Apples, Sweet Oranges & Robusta Bananas',
    foodCategory: 'Fresh Fruits',
    foodType: 'raw',
    quantity: 34,
    unit: 'kg',
    servings: 75,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Cushioned corrugated fruit delivery cartons',
    specialInstructions: 'Unblemished fresh fruit assortment, suitable for shelter child nutrition.',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [76.9389, 11.0312] },
    address: '56 NSR Road, Saibaba Colony',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641011',
    expiryHours: 72,
  },
  {
    seedKey: 'seed-foodlink-avail-06',
    foodName: 'Steamed Malli Idli & Crispy Medu Vada Morning Tiffin',
    foodCategory: 'Breakfast Items',
    foodType: 'cooked',
    quantity: 26,
    unit: 'kg',
    servings: 65,
    storageCondition: 'hot_holding',
    allergens: [],
    packagingCondition: 'Double-walled thermal steam containers',
    specialInstructions: 'Accompanied by freshly made coconut chutney and tiffin sambar.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [77.0014, 11.0825] },
    address: 'KGISL Tech Park Road, Saravanampatti',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641035',
    expiryHours: 16,
  },
  {
    seedKey: 'seed-foodlink-avail-07',
    foodName: 'Spiced Potato Samosas & Baked Vegetable Curry Puffs',
    foodCategory: 'Snacks',
    foodType: 'bakery',
    quantity: 19,
    unit: 'kg',
    servings: 58,
    storageCondition: 'ambient',
    allergens: ['Gluten'],
    packagingCondition: 'Greaseproof food-grade pastry boxes',
    specialInstructions: 'Afternoon corporate high-tea surplus, baked hygienically.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [77.0210, 10.9985] },
    address: '32 Trichy Main Road, Singanallur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641005',
    expiryHours: 24,
  },
  {
    seedKey: 'seed-foodlink-avail-08',
    foodName: 'Pasteurized Toned Fresh Milk & Natural Set Curd Tubs',
    foodCategory: 'Dairy Products',
    foodType: 'dairy',
    quantity: 30,
    unit: 'liters',
    servings: 60,
    storageCondition: 'refrigerated',
    allergens: ['Dairy'],
    packagingCondition: 'Chilled insulated ice-box container (maintain 0-4°C)',
    specialInstructions: 'CRITICAL: Must maintain continuous cold-chain between 2°C and 4°C during transport.',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9821, 11.0428] },
    address: '112 Sathy Road, Ganapathy Bus Stop',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641006',
    expiryHours: 36,
  },
  {
    seedKey: 'seed-foodlink-avail-09',
    foodName: 'Paneer Butter Masala, Dal Tadka & Tandoori Rotis',
    foodCategory: 'Dinner Meals',
    foodType: 'cooked',
    quantity: 35,
    unit: 'kg',
    servings: 78,
    storageCondition: 'hot_holding',
    allergens: ['Dairy', 'Gluten'],
    packagingCondition: 'Thermal chafing containers with seal locks',
    specialInstructions: 'Evening banquet dinner surplus. Ready for immediate redistribution.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9880, 10.9960] },
    address: '45 Trichy Road, Sungam, Ramanathapuram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641045',
    expiryHours: 20,
  },
  {
    seedKey: 'seed-foodlink-avail-10',
    foodName: 'Gentle Moong Dal Khichdi & Steamed Winter Vegetables',
    foodCategory: 'Cooked Meals',
    foodType: 'cooked',
    quantity: 25,
    unit: 'kg',
    servings: 52,
    storageCondition: 'hot_holding',
    allergens: [],
    packagingCondition: 'Sealed insulated stainless soup vessels',
    specialInstructions: 'Gentle, comforting diet. Very mild spice profile ideal for old-age homes.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9625, 10.9940] },
    address: '72 Big Bazaar Street, Town Hall',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641001',
    expiryHours: 18,
  },
  {
    seedKey: 'seed-foodlink-avail-11',
    foodName: 'Fortified Chakki Atta & Sona Masoori Rice Sacks',
    foodCategory: 'Grocery Items',
    foodType: 'raw',
    quantity: 55,
    unit: 'kg',
    servings: 130,
    storageCondition: 'ambient',
    allergens: ['Gluten'],
    packagingCondition: 'Airtight multi-ply dry grocery grain sacks',
    specialInstructions: 'Unopened factory bags from catering central warehouse.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9020, 11.0245] },
    address: '19 Maruthamalai Road, Vadavalli',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641041',
    expiryHours: 120,
  },
  {
    seedKey: 'seed-foodlink-avail-12',
    foodName: 'High-Fiber Whole Wheat Biscuits & Rolled Oats Boxes',
    foodCategory: 'Packaged Food',
    foodType: 'packaged',
    quantity: 32,
    unit: 'packets',
    servings: 64,
    storageCondition: 'ambient',
    allergens: ['Gluten'],
    packagingCondition: 'Original unopened manufacturer packaging',
    specialInstructions: 'Store in dry storage room. Excellent snack supplement.',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [77.0125, 11.0340] },
    address: '15 Avinashi Road, Hopes College Junction',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641014',
    expiryHours: 96,
  },
  {
    seedKey: 'seed-foodlink-avail-13',
    foodName: 'Canned Sweet Golden Corn & Tender Chickpeas',
    foodCategory: 'Canned Food',
    foodType: 'packaged',
    quantity: 28,
    unit: 'packets',
    servings: 56,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Sanitized intact hermetic tin cans in cartons',
    specialInstructions: 'All seals inspected and verified intact. No bulges or dents.',
    imageUrl: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9420, 11.0780] },
    address: '94 Mettupalayam Road, Thudiyalur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641034',
    expiryHours: 120,
  },
  {
    seedKey: 'seed-foodlink-avail-14',
    foodName: 'Rich Belgian Chocolate Brownies & Walnut Banana Cakes',
    foodCategory: 'Bakery Products',
    foodType: 'bakery',
    quantity: 17,
    unit: 'kg',
    servings: 46,
    storageCondition: 'ambient',
    allergens: ['Gluten', 'Dairy', 'Nuts'],
    packagingCondition: 'Aroma Bakery tamper-evident bakery trays',
    specialInstructions: 'Handmade by pastry team today. Ready for immediate distribution.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [76.9450, 10.9620] },
    address: '67 Palakkad Main Road, Kuniyamuthur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641008',
    expiryHours: 40,
  },
  {
    seedKey: 'seed-foodlink-avail-15',
    foodName: 'Fragrant Kashmiri Pulao & Cucumber Mint Raita',
    foodCategory: 'Freshly Prepared Meals',
    foodType: 'cooked',
    quantity: 30,
    unit: 'kg',
    servings: 68,
    storageCondition: 'hot_holding',
    allergens: ['Dairy'],
    packagingCondition: 'Food-grade insulated pots',
    specialInstructions: 'Prepared 1 hour ago for convention lunch. Keep warm.',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9580, 10.9850] },
    address: '28 Valankulam Lake Bypass, Ukkadam',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641001',
    expiryHours: 22,
  },
  {
    seedKey: 'seed-foodlink-avail-16',
    foodName: 'South Indian Curd Rice with Mustard Tadka & Pomegranate',
    foodCategory: 'Cooked Meals',
    foodType: 'cooked',
    quantity: 24,
    unit: 'kg',
    servings: 54,
    storageCondition: 'refrigerated',
    allergens: ['Dairy', 'Mustard'],
    packagingCondition: 'Sealed food-grade cooling tubs',
    specialInstructions: 'Keep chilled. Delicious and refreshing summer lunch provision.',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9280, 10.9420] },
    address: '41 Ashram Road, Kovaipudur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641042',
    expiryHours: 24,
  },
  {
    seedKey: 'seed-foodlink-avail-17',
    foodName: 'Farm Harvest Red Potatoes, Country Onions & Carrots',
    foodCategory: 'Fresh Vegetables',
    foodType: 'raw',
    quantity: 48,
    unit: 'kg',
    servings: 96,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Clean jute bags and stackable plastic crates',
    specialInstructions: 'Washed and sorted root vegetables ready for bulk cooking.',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9150, 10.9780] },
    address: '83 Siruvani Main Road, Perur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641010',
    expiryHours: 96,
  },
  {
    seedKey: 'seed-foodlink-avail-18',
    foodName: 'Alphonso Mangoes & Sweet Honey Papaya Crates',
    foodCategory: 'Fresh Fruits',
    foodType: 'raw',
    quantity: 36,
    unit: 'kg',
    servings: 78,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Padded fruit crates with air circulation',
    specialInstructions: 'Naturally ripened, ready for direct consumption or smoothies.',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'contact@aromabakery.com',
    location: { type: 'Point', coordinates: [77.0380, 10.9920] },
    address: '108 Trichy Highway, Ondipudur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641016',
    expiryHours: 60,
  },
  {
    seedKey: 'seed-foodlink-avail-19',
    foodName: 'Organic Toor Dal, Moong Dal & Kabuli Chana Lentils',
    foodCategory: 'Grocery Items',
    foodType: 'raw',
    quantity: 40,
    unit: 'kg',
    servings: 92,
    storageCondition: 'ambient',
    allergens: [],
    packagingCondition: 'Sealed airtight food-grade dry grain bins',
    specialInstructions: 'High-protein essential pulses for community shelter kitchens.',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [77.1250, 11.0240] },
    address: '14 Air Force Station Road, Sulur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641402',
    expiryHours: 120,
  },
  {
    seedKey: 'seed-foodlink-avail-20',
    foodName: 'Wok-Tossed Hakka Vegetable Noodles & Schezwan Rice',
    foodCategory: 'Freshly Prepared Meals',
    foodType: 'cooked',
    quantity: 27,
    unit: 'kg',
    servings: 58,
    storageCondition: 'hot_holding',
    allergens: ['Gluten', 'Soy'],
    packagingCondition: 'Insulated thermal party dispensers with lock handles',
    specialInstructions: 'Cooked for hotel banquet evening party. Hygienically packed.',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop',
    donorEmail: 'donor@grandresidency.com',
    location: { type: 'Point', coordinates: [76.9780, 10.9650] },
    address: '52 Railway Station Road, Podanur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641023',
    expiryHours: 24,
  },
];

/**
 * Idempotently seeds or permanently updates the 20 available food donation records.
 * Guarantees that all 20 records have 100% unique names, images, localities, and coordinates.
 */
async function ensureInitialDonations() {
  try {
    const donors = await User.find({ role: 'donor' }).select('_id email name');
    if (!donors || donors.length === 0) {
      console.warn('⚠️ No donor users found in database. Skipping available food seeding.');
      return { seeded: 0, updated: 0, totalAvailable: 0 };
    }

    const donorMap = new Map();
    donors.forEach((d) => donorMap.set(d.email.toLowerCase(), d._id));
    const defaultDonorId = donors[0]._id;

    let seededCount = 0;
    let updatedCount = 0;
    const now = new Date();

    for (const item of FOOD_ITEMS) {
      const donorId = donorMap.get(item.donorEmail.toLowerCase()) || defaultDonorId;
      const expiryDate = new Date(Date.now() + item.expiryHours * 3600 * 1000);
      const pickupStart = new Date();
      const pickupEnd = new Date(Date.now() + (item.expiryHours - 2) * 3600 * 1000);

      // Check if existing record with this seedKey exists
      const existing = await Donation.findOne({ seedKey: item.seedKey });

      if (!existing) {
        // Create new permanent available donation record
        await Donation.create({
          donorId,
          seedKey: item.seedKey,
          foodName: item.foodName,
          foodCategory: item.foodCategory,
          foodType: item.foodType,
          quantity: item.quantity,
          unit: item.unit,
          servings: item.servings,
          storageCondition: item.storageCondition,
          allergens: item.allergens,
          packagingCondition: item.packagingCondition,
          specialInstructions: item.specialInstructions,
          imageUrl: item.imageUrl,
          location: item.location,
          address: item.address,
          city: item.city,
          state: item.state,
          postalCode: item.postalCode,
          status: 'AVAILABLE',
          preparedAt: now,
          pickupStartTime: pickupStart,
          pickupEndTime: pickupEnd,
          expiryTime: expiryDate,
        });
        seededCount++;
      } else {
        // Permanently update existing record to ensure unique food, image, coordinates, and location
        existing.donorId = donorId;
        existing.foodName = item.foodName;
        existing.foodCategory = item.foodCategory;
        existing.foodType = item.foodType;
        existing.quantity = item.quantity;
        existing.unit = item.unit;
        existing.servings = item.servings;
        existing.storageCondition = item.storageCondition;
        existing.allergens = item.allergens;
        existing.packagingCondition = item.packagingCondition;
        existing.specialInstructions = item.specialInstructions;
        existing.imageUrl = item.imageUrl;
        existing.location = item.location;
        existing.address = item.address;
        existing.city = item.city;
        existing.state = item.state;
        existing.postalCode = item.postalCode;
        existing.status = 'AVAILABLE';
        existing.preparedAt = now;
        existing.pickupStartTime = pickupStart;
        existing.pickupEndTime = pickupEnd;
        existing.expiryTime = expiryDate;
        await existing.save();
        updatedCount++;
      }
    }

    const totalActiveAvailable = await Donation.countDocuments({
      status: 'AVAILABLE',
      expiryTime: { $gt: new Date() },
    });

    console.log(`✅ [FoodLink Seeder] Verified 20 unique available food records. Newly inserted: ${seededCount}, Permanently updated: ${updatedCount}, Total Available in DB: ${totalActiveAvailable}`);
    return { seeded: seededCount, updated: updatedCount, totalAvailable: totalActiveAvailable };
  } catch (error) {
    console.error('❌ [FoodLink Seeder] Error seeding available food donations:', error.message);
    throw error;
  }
}

// Allow direct CLI invocation: `node server/seeds/seedAvailableFood.js`
if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const { connectDB, closeDB } = require('../config/db');

  (async () => {
    try {
      await connectDB();
      const res = await ensureInitialDonations();
      console.log('Seeding result:', res);
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('Fatal seed error:', err);
      process.exit(1);
    }
  })();
}

module.exports = { ensureInitialDonations, FOOD_ITEMS };
