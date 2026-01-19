import express from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import AdminSettings from '../models/AdminSettings.js'

const router = express.Router()
import JWT_SECRET from '../config/jwt.js'

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = await Admin.findById(decoded.adminId)
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' })
    }
    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// GET /api/admin-settings - Get current admin's settings
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      // Create default settings for this admin
      settings = new AdminSettings({ adminId: req.admin._id })
      await settings.save()
    }
    
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

// GET /api/admin-settings/:adminId - Get specific admin's settings (Super Admin only)
router.get('/:adminId', verifyAdminToken, async (req, res) => {
  try {
    if (req.admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only Super Admin can view other admin settings' })
    }
    
    let settings = await AdminSettings.findOne({ adminId: req.params.adminId })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.params.adminId })
      await settings.save()
    }
    
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

// PUT /api/admin-settings/bank - Update bank settings
router.put('/bank', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.bankSettings = { ...settings.bankSettings, ...req.body }
    settings.isConfigured.bankSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'Bank settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating bank settings', error: error.message })
  }
})

// PUT /api/admin-settings/charges - Update forex charges
router.put('/charges', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.forexCharges = req.body.charges || []
    settings.isConfigured.forexCharges = true
    await settings.save()
    
    res.json({ success: true, message: 'Forex charges updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating charges', error: error.message })
  }
})

// PUT /api/admin-settings/theme - Update theme settings
router.put('/theme', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.themeSettings = { ...settings.themeSettings, ...req.body }
    settings.isConfigured.themeSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'Theme settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating theme settings', error: error.message })
  }
})

// PUT /api/admin-settings/email-templates - Update email templates
router.put('/email-templates', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.emailTemplates = { ...settings.emailTemplates, ...req.body }
    settings.isConfigured.emailTemplates = true
    await settings.save()
    
    res.json({ success: true, message: 'Email templates updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating email templates', error: error.message })
  }
})

// PUT /api/admin-settings/bonus - Update bonus settings
router.put('/bonus', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.bonusSettings = req.body.bonuses || []
    settings.isConfigured.bonusSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'Bonus settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating bonus settings', error: error.message })
  }
})

// PUT /api/admin-settings/account-types - Update account types
router.put('/account-types', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.accountTypes = req.body.accountTypes || []
    settings.isConfigured.accountTypes = true
    await settings.save()
    
    res.json({ success: true, message: 'Account types updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating account types', error: error.message })
  }
})

// PUT /api/admin-settings/ib - Update IB settings
router.put('/ib', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.ibSettings = { ...settings.ibSettings, ...req.body }
    settings.isConfigured.ibSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'IB settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating IB settings', error: error.message })
  }
})

// PUT /api/admin-settings/copy-trade - Update copy trade settings
router.put('/copy-trade', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.copyTradeSettings = { ...settings.copyTradeSettings, ...req.body }
    settings.isConfigured.copyTradeSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'Copy trade settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating copy trade settings', error: error.message })
  }
})

// PUT /api/admin-settings/prop-firm - Update prop firm settings
router.put('/prop-firm', verifyAdminToken, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({ adminId: req.admin._id })
    
    if (!settings) {
      settings = new AdminSettings({ adminId: req.admin._id })
    }
    
    settings.propFirmSettings = { ...settings.propFirmSettings, ...req.body }
    settings.isConfigured.propFirmSettings = true
    await settings.save()
    
    res.json({ success: true, message: 'Prop firm settings updated', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating prop firm settings', error: error.message })
  }
})

// ==================== PUBLIC ROUTES FOR USERS ====================

// GET /api/admin-settings/for-user/:userId - Get settings for a user (based on their assigned admin)
// This is used by the user-facing app to get the correct settings
router.get('/for-user/:userId', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findById(req.params.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    let settings = null
    
    // If user has an assigned admin, try to get their settings
    if (user.assignedAdmin) {
      settings = await AdminSettings.findOne({ adminId: user.assignedAdmin })
    }
    
    // If no settings found or admin hasn't configured, get super admin settings
    if (!settings) {
      const superAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
      if (superAdmin) {
        settings = await AdminSettings.findOne({ adminId: superAdmin._id })
      }
    }
    
    // Return settings with fallback info
    res.json({ 
      success: true, 
      settings: settings || {},
      assignedAdminId: user.assignedAdmin || null
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

// GET /api/admin-settings/bank/for-user/:userId - Get bank settings for a user
router.get('/bank/for-user/:userId', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findById(req.params.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    let settings = null
    let usingSuperAdminSettings = false
    
    // If user has an assigned admin, try to get their bank settings
    if (user.assignedAdmin) {
      settings = await AdminSettings.findOne({ adminId: user.assignedAdmin })
      if (settings && settings.isConfigured?.bankSettings) {
        return res.json({ 
          success: true, 
          bankSettings: settings.bankSettings,
          usingSuperAdminSettings: false
        })
      }
    }
    
    // Fallback to super admin settings
    const superAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    if (superAdmin) {
      settings = await AdminSettings.findOne({ adminId: superAdmin._id })
      usingSuperAdminSettings = true
    }
    
    res.json({ 
      success: true, 
      bankSettings: settings?.bankSettings || {},
      usingSuperAdminSettings
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bank settings', error: error.message })
  }
})

// GET /api/admin-settings/theme/for-user/:userId - Get theme settings for a user
router.get('/theme/for-user/:userId', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const user = await User.findById(req.params.userId)
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    let settings = null
    
    if (user.assignedAdmin) {
      settings = await AdminSettings.findOne({ adminId: user.assignedAdmin })
      if (settings && settings.isConfigured?.themeSettings) {
        return res.json({ 
          success: true, 
          themeSettings: settings.themeSettings,
          usingSuperAdminSettings: false
        })
      }
    }
    
    const superAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    if (superAdmin) {
      settings = await AdminSettings.findOne({ adminId: superAdmin._id })
    }
    
    res.json({ 
      success: true, 
      themeSettings: settings?.themeSettings || {},
      usingSuperAdminSettings: true
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching theme settings', error: error.message })
  }
})

// GET /api/admin-settings/by-slug/:slug - Get settings by admin URL slug (for branded pages)
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const admin = await Admin.findOne({ urlSlug: req.params.slug.toLowerCase() })
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }
    
    let settings = await AdminSettings.findOne({ adminId: admin._id })
    
    // Check each setting type and fallback to super admin if not configured
    const superAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    let superAdminSettings = null
    if (superAdmin && superAdmin._id.toString() !== admin._id.toString()) {
      superAdminSettings = await AdminSettings.findOne({ adminId: superAdmin._id })
    }
    
    // Merge settings - use admin's if configured, otherwise super admin's
    const mergedSettings = {
      bankSettings: settings?.isConfigured?.bankSettings ? settings.bankSettings : superAdminSettings?.bankSettings,
      themeSettings: settings?.isConfigured?.themeSettings ? settings.themeSettings : superAdminSettings?.themeSettings,
      forexCharges: settings?.isConfigured?.forexCharges ? settings.forexCharges : superAdminSettings?.forexCharges,
      bonusSettings: settings?.isConfigured?.bonusSettings ? settings.bonusSettings : superAdminSettings?.bonusSettings,
      accountTypes: settings?.isConfigured?.accountTypes ? settings.accountTypes : superAdminSettings?.accountTypes,
      ibSettings: settings?.isConfigured?.ibSettings ? settings.ibSettings : superAdminSettings?.ibSettings,
      copyTradeSettings: settings?.isConfigured?.copyTradeSettings ? settings.copyTradeSettings : superAdminSettings?.copyTradeSettings,
      propFirmSettings: settings?.isConfigured?.propFirmSettings ? settings.propFirmSettings : superAdminSettings?.propFirmSettings,
    }
    
    res.json({ 
      success: true, 
      settings: mergedSettings,
      admin: {
        _id: admin._id,
        brandName: admin.brandName,
        urlSlug: admin.urlSlug
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

export default router
