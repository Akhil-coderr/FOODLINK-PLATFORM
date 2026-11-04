const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    pickupRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
      required: true,
      index: true,
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['UNASSIGNED', 'ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      default: 'UNASSIGNED',
      index: true,
    },
    pickupTime: Date,
    deliveryTime: Date,
    pickupVerificationTokenHash: {
      type: String,
      default: null,
    },
    pickupVerificationSecretPlain: {
      type: String,
      default: null,
    },
    deliveryVerificationTokenHash: {
      type: String,
      default: null,
    },
    deliveryVerificationSecretPlain: {
      type: String,
      default: null,
    },
    pickupVerified: {
      type: Boolean,
      default: false,
    },
    deliveryVerified: {
      type: Boolean,
      default: false,
    },
    estimatedDistanceKm: {
      type: Number,
      default: 0,
    },
    actualDistanceKm: {
      type: Number,
      default: 0,
    },
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
