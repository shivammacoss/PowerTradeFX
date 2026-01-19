import express from 'express'
import AccountType from '../models/AccountType.js'
import User from '../models/User.js'
import AdminSettings from '../models/AdminSettings.js'

const router = express.Router()

// GET /api/account-types - Get all active account types (for users)
// If user is under an admin, return admin-specific account types
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query
    
    // If userId provided, check if user is under an admin
    if (userId) {
      const user = await User.findById(userId)
      if (user && user.assignedAdmin) {
        // Get admin-specific account types
        const adminSettings = await AdminSettings.findOne({ adminId: user.assignedAdmin })
        if (adminSettings && adminSettings.isConfigured?.accountTypes && adminSettings.accountTypes?.length > 0) {
          // Return admin-specific account types
          const accountTypes = adminSettings.accountTypes
            .filter(at => at.status === 'ACTIVE')
            .map(at => ({
              _id: at._id,
              name: at.name,
              description: at.description,
              minDeposit: at.minDeposit,
              leverage: at.maxLeverage ? `1:${at.maxLeverage}` : '1:100',
              minSpread: parseFloat(at.spread) || 0,
              commission: at.commission || 0,
              features: at.features || [],
              isActive: at.status === 'ACTIVE'
            }))
          return res.json({ success: true, accountTypes, isAdminSpecific: true })
        }
        // If admin has not configured account types, return empty
        return res.json({ success: true, accountTypes: [], isAdminSpecific: true, notConfigured: true })
      }
    }
    
    // Default: return global account types (for super admin users or users without assigned admin)
    const accountTypes = await AccountType.find({ isActive: true }).sort({ createdAt: -1 })
    res.json({ success: true, accountTypes })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching account types', error: error.message })
  }
})

// GET /api/account-types/all - Get all account types (for admin)
router.get('/all', async (req, res) => {
  try {
    const accountTypes = await AccountType.find().sort({ createdAt: -1 })
    res.json({ accountTypes })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account types', error: error.message })
  }
})

// POST /api/account-types - Create account type (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isDemo, demoBalance } = req.body
    const accountType = new AccountType({
      name,
      description,
      minDeposit,
      leverage,
      exposureLimit,
      minSpread: minSpread || 0,
      commission: commission || 0,
      isDemo: isDemo || false,
      demoBalance: isDemo ? (demoBalance || 10000) : 0
    })
    await accountType.save()
    res.status(201).json({ message: 'Account type created', accountType })
  } catch (error) {
    res.status(500).json({ message: 'Error creating account type', error: error.message })
  }
})

// PUT /api/account-types/:id - Update account type (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isActive, isDemo, demoBalance } = req.body
    const accountType = await AccountType.findByIdAndUpdate(
      req.params.id,
      { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isActive, isDemo, demoBalance },
      { new: true }
    )
    if (!accountType) {
      return res.status(404).json({ message: 'Account type not found' })
    }
    res.json({ message: 'Account type updated', accountType })
  } catch (error) {
    res.status(500).json({ message: 'Error updating account type', error: error.message })
  }
})

// DELETE /api/account-types/:id - Delete account type (admin)
router.delete('/:id', async (req, res) => {
  try {
    const accountType = await AccountType.findByIdAndDelete(req.params.id)
    if (!accountType) {
      return res.status(404).json({ message: 'Account type not found' })
    }
    res.json({ message: 'Account type deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account type', error: error.message })
  }
})

export default router
