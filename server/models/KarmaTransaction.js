const mongoose = require('mongoose');

const karmaTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EARN', 'REDEEM', 'REFUND'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    relatedDeliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
    relatedRedemptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption',
      default: null,
    },
  },
  { timestamps: true }
);

karmaTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('KarmaTransaction', karmaTransactionSchema);
