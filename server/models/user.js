const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Username field - matches frontend signup form
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(v) {
        // Only allow alphanumeric characters and underscores
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },

  // Email field - matches frontend login/signup forms
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Email validation regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },

  // Password field - matches frontend validation (min 6 chars)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    // Don't select password by default in queries
    select: false
  },

  // Profile information (optional fields for future expansion)
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String, // URL to avatar image
      default: null
    }
  },

  // User preferences for the finance app
  preferences: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    defaultTransactionType: {
      type: String,
      default: 'expense',
      enum: ['income', 'expense']
    },
    // Theme preference for frontend
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'system']
    }
  },

  // Account status and verification
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Password reset functionality
  passwordResetToken: {
    type: String,
    default: null,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false
  },

  // Last login tracking
  lastLogin: {
    type: Date,
    default: null
  },

  // Timestamps - automatically managed by Mongoose
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Enable automatic timestamps
  timestamps: true,
  
  // Transform JSON output to exclude sensitive fields
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Compare plain text password with hashed password
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash and set password reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set token expiry (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  // Return unhashed token to send via email
  return resetToken;
};

// Instance method to get user's public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    profile: this.profile,
    preferences: this.preferences,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find user by email (for login)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Static method to find user by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username });
};

// Static method to check if email exists (for registration validation)
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

// Static method to check if username exists (for registration validation)
userSchema.statics.usernameExists = async function(username) {
  const user = await this.findOne({ username: username });
  return !!user;
};

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Ensure virtual fields are included in JSON output
userSchema.set('toJSON', { virtuals: true });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;