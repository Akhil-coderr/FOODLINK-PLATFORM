const mongoose = require('mongoose');

const couponCodeItemSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    isAssigned: {
      type: Boolean,
      default: false,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    redemptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption',
      default: null,
    },
  },
  { _id: true }
);

const restaurantPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    // Restaurants and hotels share the same coupon inventory model.
    partnerType: {
      type: String,
      enum: ['restaurant', 'hotel'],
      default: 'restaurant',
      index: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    cuisine: {
      type: String,
      default: 'Multi-Cuisine',
      trim: true,
    },
    city: {
      type: String,
      default: 'Coimbatore',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: String,
      required: true,
      trim: true,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    terms: {
      type: String,
      default: 'Valid on all dine-in and takeaway orders. Cannot be combined with other offers.',
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    sponsorFunded: {
      type: Boolean,
      default: true,
    },
    sponsorName: {
      type: String,
      default: 'Sponsor Partner Network',
      trim: true,
    },
    coupons: [couponCodeItemSchema],
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

restaurantPartnerSchema.virtual('remainingCoupons').get(function () {
  if (!Array.isArray(this.coupons)) return 0;
  return this.coupons.filter((c) => !c.isAssigned).length;
});

restaurantPartnerSchema.virtual('totalCoupons').get(function () {
  if (!Array.isArray(this.coupons)) return 0;
  return this.coupons.length;
});

restaurantPartnerSchema.index({ active: 1, 'coupons.isAssigned': 1 });

module.exports = mongoose.model('RestaurantPartner', restaurantPartnerSchema);
