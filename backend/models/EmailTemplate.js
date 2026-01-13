import mongoose from 'mongoose'

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'signup_otp',
      'login_otp',
      'deposit_request',
      'deposit_approved',
      'deposit_rejected',
      'withdrawal_request',
      'withdrawal_approved',
      'withdrawal_rejected',
      'account_banned',
      'account_blocked',
      'account_unblocked',
      'welcome',
      'password_reset',
      'kyc_approved',
      'kyc_rejected'
    ]
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  variables: [{
    type: String
  }],
  description: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('EmailTemplate', emailTemplateSchema)
