import mongoose from 'mongoose'

const adminSettingsSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true
  },
  
  // Bank Settings
  bankSettings: {
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' },
    upiQrCode: { type: String, default: '' },
    cryptoAddresses: [{
      currency: String,
      network: String,
      address: String,
      qrCode: String
    }],
    paymentInstructions: { type: String, default: '' },
    minDeposit: { type: Number, default: 0 },
    maxDeposit: { type: Number, default: 0 },
    minWithdrawal: { type: Number, default: 0 },
    maxWithdrawal: { type: Number, default: 0 }
  },

  // Forex Charges
  forexCharges: [{
    symbol: String,
    spread: Number,
    commission: Number,
    swapLong: Number,
    swapShort: Number,
    leverage: Number
  }],

  // Theme Settings
  themeSettings: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#10B981' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    loginBackground: { type: String, default: '' },
    customCss: { type: String, default: '' }
  },

  // Email Templates
  emailTemplates: {
    welcomeEmail: { subject: String, body: String, enabled: { type: Boolean, default: true } },
    depositConfirmation: { subject: String, body: String, enabled: { type: Boolean, default: true } },
    withdrawalConfirmation: { subject: String, body: String, enabled: { type: Boolean, default: true } },
    passwordReset: { subject: String, body: String, enabled: { type: Boolean, default: true } },
    kycApproved: { subject: String, body: String, enabled: { type: Boolean, default: true } },
    kycRejected: { subject: String, body: String, enabled: { type: Boolean, default: true } }
  },

  // Bonus Settings
  bonusSettings: [{
    name: String,
    type: { type: String, enum: ['FIRST_DEPOSIT', 'RELOAD', 'REFERRAL', 'PROMO'] },
    bonusType: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
    bonusValue: Number,
    minDeposit: Number,
    maxBonus: Number,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  }],

  // Account Types
  accountTypes: [{
    name: String,
    minDeposit: Number,
    maxLeverage: Number,
    spread: String,
    commission: Number,
    description: String,
    features: [String],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
  }],

  // IB Settings
  ibSettings: {
    enabled: { type: Boolean, default: true },
    commissionRate: { type: Number, default: 0 },
    minWithdrawal: { type: Number, default: 0 },
    levels: [{
      level: Number,
      commissionPercent: Number
    }]
  },

  // Copy Trade Settings
  copyTradeSettings: {
    enabled: { type: Boolean, default: true },
    minCopyAmount: { type: Number, default: 0 },
    maxCopyAmount: { type: Number, default: 0 },
    profitShare: { type: Number, default: 0 }
  },

  // Prop Firm Settings
  propFirmSettings: {
    enabled: { type: Boolean, default: false },
    challenges: [{
      name: String,
      accountSize: Number,
      price: Number,
      profitTarget: Number,
      maxDrawdown: Number,
      dailyDrawdown: Number,
      minTradingDays: Number,
      profitSplit: Number,
      status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
    }]
  },

  // Flag to indicate if settings are configured
  isConfigured: {
    bankSettings: { type: Boolean, default: false },
    forexCharges: { type: Boolean, default: false },
    themeSettings: { type: Boolean, default: false },
    emailTemplates: { type: Boolean, default: false },
    bonusSettings: { type: Boolean, default: false },
    accountTypes: { type: Boolean, default: false },
    ibSettings: { type: Boolean, default: false },
    copyTradeSettings: { type: Boolean, default: false },
    propFirmSettings: { type: Boolean, default: false }
  }

}, { timestamps: true })

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema)

export default AdminSettings
