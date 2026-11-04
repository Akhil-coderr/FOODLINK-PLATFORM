require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const NGOProfile = require('../models/NGOProfile');
const VolunteerProfile = require('../models/VolunteerProfile');
const Donation = require('../models/Donation');
const PickupRequest = require('../models/PickupRequest');
const Assignment = require('../models/Assignment');
const ImpactRecord = require('../models/ImpactRecord');
const Notification = require('../models/Notification');
const ContactMessage = require('../models/ContactMessage');
const Reward = require('../models/Reward');
const { DEFAULT_REWARDS } = require('../config/rewards');
const { generateRandomSecret, hashToken } = require('../utils/token');

async function seedDatabase() {
  try {
    console.log('🌱 Starting FoodLink database seed...');
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      DonorProfile.deleteMany({}),
      NGOProfile.deleteMany({}),
      VolunteerProfile.deleteMany({}),
      Donation.deleteMany({}),
      PickupRequest.deleteMany({}),
      Assignment.deleteMany({}),
      ImpactRecord.deleteMany({}),
      Notification.deleteMany({}),
      ContactMessage.deleteMany({}),
      Reward.deleteMany({}),
    ]);
    console.log('🧹 Purged existing collections.');

    // 1. Common password hash
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const donorPass = await bcrypt.hash('Donor@123', salt);
    const ngoPass = await bcrypt.hash('Ngo@123', salt);
    const volPass = await bcrypt.hash('Volunteer@123', salt);

    // 2. Create Users
    // Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@foodlink.org',
      phone: '+91 90000 00001',
      passwordHash: adminPass,
      role: 'admin',
      address: 'Central Admin Office, Tech Corridor',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641014',
      location: { type: 'Point', coordinates: [76.9558, 11.0168] },
      accountStatus: 'active',
      isEmailVerified: true,
    });

    // Donor 1 (Grand Residency Hotel)
    const donor1User = await User.create({
      name: 'Karthik Narayanan (Banquet Mgr)',
      email: 'donor@grandresidency.com',
      phone: '+91 98421 11223',
      passwordHash: donorPass,
      role: 'donor',
      address: '105 Avinashi Road, Peelamedu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641004',
      location: { type: 'Point', coordinates: [76.9958, 11.0268] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await DonorProfile.create({
      userId: donor1User._id,
      organizationName: 'Grand Residency Hotel & Banquets',
      organizationType: 'hotel',
      description: '4-star hotel hosting daily wedding conventions and corporate banquets.',
      verificationStatus: 'verified',
      totalDonations: 12,
      totalFoodDonatedKg: 480,
    });

    // Donor 2 (Aroma Fresh Bakery & Cafe)
    const donor2User = await User.create({
      name: 'Priya Sundaram',
      email: 'contact@aromabakery.com',
      phone: '+91 98421 44556',
      passwordHash: donorPass,
      role: 'donor',
      address: '24 DB Road, RS Puram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641002',
      location: { type: 'Point', coordinates: [76.9458, 11.0068] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await DonorProfile.create({
      userId: donor2User._id,
      organizationName: 'Aroma Fresh Bakery & Confectionery',
      organizationType: 'restaurant',
      description: 'Artisanal bakery preparing fresh bread, rolls, and afternoon savories.',
      verificationStatus: 'verified',
      totalDonations: 8,
      totalFoodDonatedKg: 210,
    });

    // NGO 1 (Hope Foundation Shelter - Approved)
    const ngo1User = await User.create({
      name: 'Sister Teresa David',
      email: 'contact@hopeshelter.org',
      phone: '+91 94432 77889',
      passwordHash: ngoPass,
      role: 'ngo',
      address: '12 Gandhi Street, Ramanathapuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641045',
      location: { type: 'Point', coordinates: [76.9858, 11.0012] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    const ngo1Profile = await NGOProfile.create({
      userId: ngo1User._id,
      organizationName: 'Hope Foundation Shelter & Care Home',
      registrationNumber: 'NGO-TN-2018-8841',
      documents: ['https://foodlink.org/docs/hope-trust-certificate.pdf'],
      verificationStatus: 'approved',
      acceptedFoodCategories: ['Cooked Meals', 'Raw Ingredients', 'Bakery Items', 'Fruits & Vegetables'],
      receivingCapacityKg: 300,
      currentReservedCapacityKg: 40,
      totalFoodReceivedKg: 850,
      totalMealsDistributed: 1870,
      operatingHours: { hours: '07:30 AM - 09:30 PM' },
      description: 'Residential home providing shelter, daily nutrition, and education for 140 underprivileged children.',
    });

    // NGO 2 (Karunai Illam Elderly Home - Pending Review)
    const ngo2User = await User.create({
      name: 'M. Senthil Kumar',
      email: 'info@karunaiillam.org',
      phone: '+91 94432 99001',
      passwordHash: ngoPass,
      role: 'ngo',
      address: '45 Mettupalayam Road, Kavundampalayam',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641030',
      location: { type: 'Point', coordinates: [76.9358, 11.0412] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await NGOProfile.create({
      userId: ngo2User._id,
      organizationName: 'Karunai Illam Senior Sanctuary',
      registrationNumber: 'NGO-TN-2022-3109',
      documents: ['https://foodlink.org/docs/karunai-trust-reg.pdf'],
      verificationStatus: 'pending', // Pending verification demo
      acceptedFoodCategories: ['Cooked Meals', 'Dairy Products', 'Fruits & Vegetables'],
      receivingCapacityKg: 150,
      currentReservedCapacityKg: 0,
      totalFoodReceivedKg: 120,
      totalMealsDistributed: 260,
      operatingHours: { hours: '08:00 AM - 08:00 PM' },
      description: 'Care sanctuary supporting 65 abandoned senior citizens with medical and meal care.',
    });

    // Volunteers (3)
    const vol1User = await User.create({
      name: 'Arun Prakash',
      email: 'volunteer@foodlink.org',
      phone: '+91 97890 12345',
      passwordHash: volPass,
      role: 'volunteer',
      address: '77 Cross Cut Road, Gandhipuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641012',
      location: { type: 'Point', coordinates: [76.9658, 11.018] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await VolunteerProfile.create({
      userId: vol1User._id,
      transportType: 'bike',
      maximumCapacityKg: 25,
      serviceRadiusKm: 15,
      availability: true,
      totalPoints: 80,
      completedTasks: 4,
      totalDistanceKm: 42,
      achievements: ['First Steps', 'First Rescue', 'Community Pillar'],
    });

    const vol2User = await User.create({
      name: 'Deepa V.',
      email: 'deepa.volunteer@foodlink.org',
      phone: '+91 97890 67890',
      passwordHash: volPass,
      role: 'volunteer',
      address: '15 Race Course Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641018',
      location: { type: 'Point', coordinates: [76.9758, 11.008] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await VolunteerProfile.create({
      userId: vol2User._id,
      transportType: 'car',
      maximumCapacityKg: 75,
      serviceRadiusKm: 25,
      availability: true,
      totalPoints: 120,
      completedTasks: 6,
      totalDistanceKm: 85,
      achievements: ['First Steps', 'First Rescue', 'Food Hero', 'Century Champion'],
    });

    const vol3User = await User.create({
      name: 'Ganesh Moorthy',
      email: 'ganesh.volunteer@foodlink.org',
      phone: '+91 97890 99887',
      passwordHash: volPass,
      role: 'volunteer',
      address: '33 Trichy Road, Ramanathapuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      postalCode: '641045',
      location: { type: 'Point', coordinates: [76.9858, 11.002] },
      accountStatus: 'active',
      isEmailVerified: true,
    });
    await VolunteerProfile.create({
      userId: vol3User._id,
      transportType: 'van',
      maximumCapacityKg: 200,
      serviceRadiusKm: 30,
      availability: true,
      totalPoints: 40,
      completedTasks: 2,
      totalDistanceKm: 28,
      achievements: ['First Steps', 'First Rescue'],
    });

    // 3. Create Sample Donations with varied categories, quantities, statuses
    const now = new Date();

    // Donation 1: AVAILABLE (Cooked Rice & Sambar - Hot Holding)
    const don1 = await Donation.create({
      donorId: donor1User._id,
      foodName: 'Vegetable Biryani & Dal Makhani Feast',
      description: 'Buffet surplus prepared hygienically for lunch conference. Maintained above 65°C.',
      foodCategory: 'Cooked Meals',
      foodType: 'cooked',
      quantity: 35,
      unit: 'kg',
      servings: 80,
      preparedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      expiryTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours remaining
      pickupStartTime: now,
      pickupEndTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      storageCondition: 'hot_holding',
      allergens: ['Dairy'],
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop',
      packagingCondition: 'Packed in food-grade thermal containers',
      specialInstructions: 'Please handle with oven mitts; food is freshly packed hot.',
      address: donor1User.address,
      city: donor1User.city,
      state: donor1User.state,
      postalCode: donor1User.postalCode,
      location: donor1User.location,
      status: 'AVAILABLE',
    });

    // Donation 2: AVAILABLE (Bakery Breads & Pastries)
    const don2 = await Donation.create({
      donorId: donor2User._id,
      foodName: 'Artisan Whole Wheat Loaves & Sweet Buns',
      description: 'Morning baked sourdough, whole wheat dinner rolls, and fruit buns.',
      foodCategory: 'Bakery Items',
      foodType: 'bakery',
      quantity: 18,
      unit: 'kg',
      servings: 45,
      preparedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      expiryTime: new Date(now.getTime() + 18 * 60 * 60 * 1000),
      pickupStartTime: now,
      pickupEndTime: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      storageCondition: 'ambient',
      allergens: ['Gluten', 'Wheat'],
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
      packagingCondition: 'Individual bakery paper wraps sealed in clean crates',
      address: donor2User.address,
      city: donor2User.city,
      state: donor2User.state,
      postalCode: donor2User.postalCode,
      location: donor2User.location,
      status: 'AVAILABLE',
    });

    // Donation 3: COMPLETED workflow (Live demo transaction)
    const don3 = await Donation.create({
      donorId: donor1User._id,
      foodName: 'Steamed Rice, Paneer Butter Masala & Rotis',
      description: 'Evening dinner banquet surplus packed immediately after guest dining concluded.',
      foodCategory: 'Cooked Meals',
      foodType: 'cooked',
      quantity: 40,
      unit: 'kg',
      servings: 90,
      preparedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expiryTime: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      pickupStartTime: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      pickupEndTime: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      storageCondition: 'hot_holding',
      allergens: ['Dairy'],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      packagingCondition: 'Insulated transport dispensers',
      address: donor1User.address,
      city: donor1User.city,
      state: donor1User.state,
      postalCode: donor1User.postalCode,
      location: donor1User.location,
      status: 'COMPLETED',
    });

    // Create completed request and assignment for don3
    const req3 = await PickupRequest.create({
      donationId: don3._id,
      ngoId: ngo1User._id,
      donorId: donor1User._id,
      requestedQuantity: 40,
      message: 'Urgent collection for children dinner at Hope Shelter',
      status: 'ACCEPTED',
      requestedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      acceptedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
    });

    don3.acceptedRequestId = req3._id;
    await don3.save();

    const pkSecret = 'PK-7D8E9F';
    const dlSecret = 'DL-4A2B1C';

    const assign3 = await Assignment.create({
      pickupRequestId: req3._id,
      donationId: don3._id,
      ngoId: ngo1User._id,
      donorId: donor1User._id,
      volunteerId: vol1User._id,
      status: 'COMPLETED',
      pickupTime: new Date(now.getTime() - 21 * 60 * 60 * 1000),
      deliveryTime: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      pickupVerificationTokenHash: hashToken(pkSecret),
      pickupVerificationSecretPlain: pkSecret,
      deliveryVerificationTokenHash: hashToken(dlSecret),
      deliveryVerificationSecretPlain: dlSecret,
      pickupVerified: true,
      deliveryVerified: true,
      estimatedDistanceKm: 6.2,
      actualDistanceKm: 6.5,
      pointsAwarded: true,
      completedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    });

    // Create verified impact record
    await ImpactRecord.create({
      donationId: don3._id,
      donorId: donor1User._id,
      ngoId: ngo1User._id,
      assignmentId: assign3._id,
      foodQuantityKg: 40,
      estimatedMealsSaved: 88,
      estimatedCarbonImpactKg: 100, // 40kg * 2.5
      completedAt: assign3.completedAt,
    });

    // 4. Contact Message Demo
    await ContactMessage.create({
      name: 'Sunita Mehra',
      email: 'sunita@cateringassociation.org',
      subject: 'Hospitality partnership inquiry for 15 banquet halls',
      message: 'We represent the South Indian Caterers Guild. We would like to onboard 15 major banquet halls onto FoodLink.',
      status: 'unread',
    });

    // 5. Karma Reward Catalog
    await Reward.insertMany(
      DEFAULT_REWARDS.map((reward) => ({
        ...reward,
        createdBy: adminUser._id,
        updatedBy: adminUser._id,
      }))
    );

    console.log('✅ FoodLink Database Seeding Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('👑 Admin:      admin@foodlink.org / Admin@123');
    console.log('🏨 Donor 1:    donor@grandresidency.com / Donor@123');
    console.log('🍞 Donor 2:    contact@aromabakery.com / Donor@123');
    console.log('🤝 NGO 1:      contact@hopeshelter.org / Ngo@123 (Approved)');
    console.log('⏳ NGO 2:      info@karunaiillam.org / Ngo@123 (Approved)');
    console.log('🚴 Volunteer:  volunteer@foodlink.org / Volunteer@123');
    console.log('----------------------------------------------------');

    await closeDB();
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
