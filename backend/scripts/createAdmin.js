import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import Admin from '../models/Admin.js'
import AdminWallet from '../models/AdminWallet.js'

dotenv.config()

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    if (existingAdmin) {
      console.log('Super Admin already exists:', existingAdmin.email)
      process.exit(0)
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    
    const superAdmin = new Admin({
      email: 'admin@powertradefx.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '',
      role: 'SUPER_ADMIN',
      urlSlug: 'main',
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
    console.log('Super Admin created successfully!')

    // Create admin wallet
    const adminWallet = new AdminWallet({
      adminId: superAdmin._id,
      balance: 0
    })
    await adminWallet.save()
    console.log('Admin wallet created!')

    console.log('\n========================================')
    console.log('Admin Credentials:')
    console.log('Email: admin@powertradefx.com')
    console.log('Password: Admin@123')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

createSuperAdmin()
