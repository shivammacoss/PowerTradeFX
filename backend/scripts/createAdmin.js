import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

// Admin Schema (inline to avoid import issues)
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN'], default: 'ADMIN' },
  urlSlug: { type: String, required: true, unique: true, lowercase: true },
  brandName: { type: String, default: '' },
  logo: { type: String, default: '' },
  parentAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canCreateUsers: { type: Boolean, default: true },
    canDeleteUsers: { type: Boolean, default: true },
    canViewUsers: { type: Boolean, default: true },
    canManageTrades: { type: Boolean, default: true },
    canCloseTrades: { type: Boolean, default: true },
    canModifyTrades: { type: Boolean, default: true },
    canManageAccounts: { type: Boolean, default: true },
    canCreateAccounts: { type: Boolean, default: true },
    canDeleteAccounts: { type: Boolean, default: true },
    canModifyLeverage: { type: Boolean, default: true },
    canManageDeposits: { type: Boolean, default: true },
    canApproveDeposits: { type: Boolean, default: true },
    canManageWithdrawals: { type: Boolean, default: true },
    canApproveWithdrawals: { type: Boolean, default: true },
    canManageKYC: { type: Boolean, default: true },
    canApproveKYC: { type: Boolean, default: true },
    canManageIB: { type: Boolean, default: true },
    canApproveIB: { type: Boolean, default: true },
    canManageCopyTrading: { type: Boolean, default: true },
    canApproveMasters: { type: Boolean, default: true },
    canManageSymbols: { type: Boolean, default: true },
    canManageGroups: { type: Boolean, default: true },
    canManageSettings: { type: Boolean, default: true },
    canManageTheme: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canExportReports: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: true },
    canFundAdmins: { type: Boolean, default: true }
  },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'ACTIVE' },
  stats: {
    totalUsers: { type: Number, default: 0 },
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 }
  },
  lastLogin: { type: Date, default: null }
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    if (existingAdmin) {
      console.log('⚠️  Super Admin already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   URL Slug: ${existingAdmin.urlSlug}`)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 12)

    // Create Super Admin
    const superAdmin = new Admin({
      email: 'admin@powertradefx.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '',
      role: 'SUPER_ADMIN',
      urlSlug: 'powertradefx',
      brandName: 'PowerTradeFX',
      status: 'ACTIVE',
      permissions: {
        canManageUsers: true,
        canCreateUsers: true,
        canDeleteUsers: true,
        canViewUsers: true,
        canManageTrades: true,
        canCloseTrades: true,
        canModifyTrades: true,
        canManageAccounts: true,
        canCreateAccounts: true,
        canDeleteAccounts: true,
        canModifyLeverage: true,
        canManageDeposits: true,
        canApproveDeposits: true,
        canManageWithdrawals: true,
        canApproveWithdrawals: true,
        canManageKYC: true,
        canApproveKYC: true,
        canManageIB: true,
        canApproveIB: true,
        canManageCopyTrading: true,
        canApproveMasters: true,
        canManageSymbols: true,
        canManageGroups: true,
        canManageSettings: true,
        canManageTheme: true,
        canViewReports: true,
        canExportReports: true,
        canManageAdmins: true,
        canFundAdmins: true
      }
    })

    await superAdmin.save()

    console.log('')
    console.log('✅ Super Admin created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Email:    admin@powertradefx.com')
    console.log('   Password: Admin@123')
    console.log('   Role:     SUPER_ADMIN')
    console.log('   URL Slug: powertradefx')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the password after first login!')
    console.log('')
    console.log('Admin Panel URL: https://powertradefx.com/admin/login')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createSuperAdmin()
