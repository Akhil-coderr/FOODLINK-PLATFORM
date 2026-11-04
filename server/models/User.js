const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: function () {
        return !this.authProviders || this.authProviders.length === 0;
      },
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.authProviders || this.authProviders.length === 0;
      },
      select: false,
    },
    authProviders: [
      {
        provider: {
          type: String,
          enum: ['google'],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      enum: ['donor', 'ngo', 'volunteer', 'admin'],
      required: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'Coimbatore',
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [76.9558, 11.0168],
      },
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordTokenHash: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });
userSchema.index({ 'authProviders.provider': 1, 'authProviders.providerId': 1 });

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
