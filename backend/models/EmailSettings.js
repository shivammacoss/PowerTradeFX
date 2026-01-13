import mongoose from 'mongoose'

const emailSettingsSchema = new mongoose.Schema({
  signupOtpEnabled: {
    type: Boolean,
    default: true
  },
  loginOtpEnabled: {
    type: Boolean,
    default: false
  },
  welcomeEmailEnabled: {
    type: Boolean,
    default: true
  },
  depositNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  withdrawalNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  accountStatusNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

emailSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Ensure only one settings document exists
emailSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

export default mongoose.model('EmailSettings', emailSettingsSchema)
