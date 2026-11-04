const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    detailedDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['coupon', 'badge', 'certificate', 'experience'],
      default: 'coupon',
      index: true,
    },
    // Hotel Coupon fields
    hotelName: {
      type: String,
      default: '',
      trim: true,
    },
    couponCode: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'special_offer'],
      default: 'percentage',
    },
    discountValue: {
      type: String,
      default: '',
      trim: true,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    totalAvailable: {
      type: Number,
      default: 100,
    },
    remainingCoupons: {
      type: Number,
      default: 100,
    },
    redemptionLimitPerUser: {
      type: Number,
      default: 1,
    },
    // Badge fields
    badgeId: {
      type: String,
      default: null,
    },
    badgeName: {
      type: String,
      default: null,
    },
    badgeType: {
      type: String,
      default: 'milestone',
      trim: true,
    },
    badgeLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'other'],
      default: 'bronze',
    },
    milestonePoints: {
      type: Number,
      default: 100,
    },
    restaurantPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantPartner',
      default: null,
    },
    icon: {
      type: String,
      default: '🎁',
      trim: true,
      maxlength: 16,
    },
    accent: {
      type: String,
      enum: ['forest', 'amber', 'purple', 'blue', 'rose', 'slate'],
      default: 'forest',
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    variants: {
      type: [String],
      default: [],
    },
    fulfillment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 400,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

rewardSchema.index({ active: 1, order: 1, pointsCost: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
