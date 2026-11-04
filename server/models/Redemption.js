const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rewardId: {
      type: String,
      required: true,
      index: true,
    },
    rewardName: {
      type: String,
      required: true,
    },
    rewardCategory: {
      type: String,
      enum: ['coupon', 'badge', 'certificate', 'experience'],
      required: true,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      type: String,
      default: null,
    },
    couponCode: {
      type: String,
      default: null,
    },
    restaurantName: {
      type: String,
      default: null,
    },
    badgeName: {
      type: String,
      default: null,
    },
    certificateId: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    adminNote: {
      type: String,
      default: '',
    },
    pointsRefunded: {
      type: Boolean,
      default: false,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

redemptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
