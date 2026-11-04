const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetRole: {
      type: String,
      enum: ['all', 'donor', 'ngo', 'volunteer'],
      default: 'all',
    },
    priority: {
      type: String,
      enum: ['info', 'success', 'warning', 'urgent'],
      default: 'info',
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

broadcastSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
