const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    transportType: {
      type: String,
      enum: ['bike', 'bicycle', 'car', 'van', 'truck', 'walking'],
      default: 'bike',
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    maximumCapacityKg: {
      type: Number,
      default: 25,
    },
    serviceRadiusKm: {
      type: Number,
      default: 15,
    },
    totalPoints: {
      type: Number,
      default: 0,
      index: true,
    },
    // Cumulative Karma ever earned. Never decreases when points are redeemed,
    // so badge tiers are based on achievement rather than current balance.
    lifetimePoints: {
      type: Number,
      default: 0,
      index: true,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    totalDistanceKm: {
      type: Number,
      default: 0,
    },
    achievements: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
