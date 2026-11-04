const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    foodCategory: {
      type: String,
      required: [true, 'Food category is required'],
      index: true,
    },
    foodType: {
      type: String,
      default: 'cooked',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'liters', 'packets', 'servings'],
    },
    servings: {
      type: Number,
      default: 0,
    },
    preparedAt: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
      index: true,
    },
    pickupStartTime: {
      type: Date,
      default: Date.now,
    },
    pickupEndTime: {
      type: Date,
    },
    storageCondition: {
      type: String,
      enum: ['ambient', 'refrigerated', 'frozen', 'hot_holding'],
      default: 'ambient',
    },
    allergens: [
      {
        type: String,
      },
    ],
    imageUrl: {
      type: String,
      default: '',
    },
    packagingCondition: {
      type: String,
      default: 'Hygienically packaged',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    postalCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'REQUESTED',
        'ACCEPTED',
        'VOLUNTEER_ASSIGNED',
        'PICKUP_IN_PROGRESS',
        'PICKED_UP',
        'DELIVERED',
        'COMPLETED',
        'REJECTED',
        'CANCELLED',
        'EXPIRED',
        'FLAGGED',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    acceptedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
      default: null,
    },
    flagReason: {
      type: String,
      default: '',
    },
    seedKey: {
      type: String,
      default: null,
      index: true,
    },
    expiryAlertsSent: {
      sixHours: { type: Boolean, default: false },
      threeHours: { type: Boolean, default: false },
      oneHour: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, expiryTime: 1 });

module.exports = mongoose.model('Donation', donationSchema);
