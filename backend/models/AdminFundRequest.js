import mongoose from 'mongoose'

const adminFundRequestSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  processedAt: {
    type: Date
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true })

const AdminFundRequest = mongoose.model('AdminFundRequest', adminFundRequestSchema)

export default AdminFundRequest
