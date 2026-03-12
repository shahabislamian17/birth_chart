const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  birthData: {
    date: String,
    time: String,
    location: String
  },
  originalDiagram: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  constellations: [{
    name: String,
    redeemedAt: Date,
    qrId: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Desired Diagram Schema
const desiredDiagramSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  locked: {
    type: Boolean,
    default: false
  },
  placements: [{
    cellIndex: Number,
    house: Number,
    zodiac: Number,
    constellation: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// QR Redemption Schema
const qrRedemptionSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true,
    unique: true
  },
  constellation: {
    type: String,
    required: true
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  redeemedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update expiresAt for DesiredDiagram
desiredDiagramSchema.pre('save', function(next) {
  if (this.isNew) {
    this.expiresAt = new Date(this.createdAt.getTime() + 28 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Models
const User = mongoose.model('User', userSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const DesiredDiagram = mongoose.model('DesiredDiagram', desiredDiagramSchema);
const QRRedemption = mongoose.model('QRRedemption', qrRedemptionSchema);

module.exports = {
  User,
  Inventory,
  DesiredDiagram,
  QRRedemption
};