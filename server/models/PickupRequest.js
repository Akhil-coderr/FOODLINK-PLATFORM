const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema(
  {
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
    requestedQuantity: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
