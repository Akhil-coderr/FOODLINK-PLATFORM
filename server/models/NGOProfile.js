const mongoose = require('mongoose');

const ngoProfileSchema = new mongoose.Schema(
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
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    documents: [
      {
        type: String,
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    acceptedFoodCategories: [
      {
        type: String,
      },
    ],
    receivingCapacityKg: {
      type: Number,
      required: true,
      default: 100,
    },
    currentReservedCapacityKg: {
      type: Number,
      default: 0,
    },
    operatingHours: {
      type: mongoose.Schema.Types.Mixed,
      default: { hours: '08:00 AM - 09:00 PM' },
    },
    totalFoodReceivedKg: {
      type: Number,
      default: 0,
    },
    totalMealsDistributed: {
      type: Number,
      default: 0,
    },
    adminVerificationNotes: {
      type: String,
      default: '',
    },
    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGOProfile', ngoProfileSchema);
