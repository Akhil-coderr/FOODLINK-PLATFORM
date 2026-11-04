const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: 'Certificate of Community Service & Food Rescue',
      trim: true,
    },
    appreciationMessage: {
      type: String,
      default:
        'In grateful recognition of exemplary volunteer service, food salvage logistics, and active dedication to eliminating hunger across community shelters.',
    },
    redemptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Redemption',
      default: null,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
    estimatedMealsSaved: {
      type: Number,
      default: 0,
    },
    karmaPointsSpent: {
      type: Number,
      default: 100,
    },
    verificationHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, issueDate: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
