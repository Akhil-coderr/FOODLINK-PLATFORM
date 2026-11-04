const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    organizationType: {
      type: String,
      enum: ['restaurant', 'hotel', 'hostel', 'catering', 'event_organizer', 'supermarket', 'corporate', 'individual', 'other'],
      default: 'restaurant',
    },
    description: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified'],
      default: 'verified',
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    totalFoodDonatedKg: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
