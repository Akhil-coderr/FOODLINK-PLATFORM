const mongoose = require('mongoose');

const impactRecordSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      unique: true, // Prevents duplicate impact records for the same completed assignment
      index: true,
    },
    foodQuantityKg: {
      type: Number,
      required: true,
    },
    estimatedMealsSaved: {
      type: Number,
      required: true,
    },
    estimatedCarbonImpactKg: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImpactRecord', impactRecordSchema);
