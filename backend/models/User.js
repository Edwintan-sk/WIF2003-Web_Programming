const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['manager', 'staff'],
      required: true,
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    englishName: {
      type: String,
      trim: true,
      default: '',
    },
    pronouns: {
      type: String,
      enum: ['', 'she/her', 'he/him', 'they/them', 'prefer-not'],
      default: '',
    },
    roleAtShop: {
      type: String,
      required: true,
      trim: true,
    },
    positionTitle: {
      type: String,
      trim: true,
      default: '',
    },
    countryCode: {
      type: String,
      trim: true,
      default: '+60',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

UserSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
