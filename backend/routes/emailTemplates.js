import express from 'express'
import EmailTemplate from '../models/EmailTemplate.js'
import EmailSettings from '../models/EmailSettings.js'
import { sendEmail } from '../services/emailService.js'

const router = express.Router()

// GET /api/email-templates - Get all email templates
router.get('/', async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ name: 1 })
    res.json({ templates })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates', error: error.message })
  }
})

// ==================== SETTINGS ROUTES (must come before :id routes) ====================

// GET /api/email-templates/settings - Get email settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await EmailSettings.getSettings()
    res.json({ settings })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message })
  }
})

// PUT /api/email-templates/settings - Update email settings
router.put('/settings', async (req, res) => {
  try {
    const updates = req.body
    let settings = await EmailSettings.getSettings()
    
    // Update only provided fields
    if (typeof updates.signupOtpEnabled === 'boolean') settings.signupOtpEnabled = updates.signupOtpEnabled
    if (typeof updates.loginOtpEnabled === 'boolean') settings.loginOtpEnabled = updates.loginOtpEnabled
    if (typeof updates.welcomeEmailEnabled === 'boolean') settings.welcomeEmailEnabled = updates.welcomeEmailEnabled
    if (typeof updates.depositNotificationsEnabled === 'boolean') settings.depositNotificationsEnabled = updates.depositNotificationsEnabled
    if (typeof updates.withdrawalNotificationsEnabled === 'boolean') settings.withdrawalNotificationsEnabled = updates.withdrawalNotificationsEnabled
    if (typeof updates.accountStatusNotificationsEnabled === 'boolean') settings.accountStatusNotificationsEnabled = updates.accountStatusNotificationsEnabled
    
    await settings.save()
    res.json({ message: 'Settings updated successfully', settings })
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message })
  }
})

// POST /api/email-templates/reset/:name - Reset template to default
router.post('/reset/:name', async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ name: req.params.name })
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Delete and let it regenerate from defaults on next use
    await EmailTemplate.deleteOne({ name: req.params.name })
    
    res.json({ message: 'Template reset to default. It will regenerate on next server restart.' })
  } catch (error) {
    res.status(500).json({ message: 'Error resetting template', error: error.message })
  }
})

// ==================== TEMPLATE ID ROUTES ====================

// GET /api/email-templates/:id - Get single template
router.get('/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    res.json({ template })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template', error: error.message })
  }
})

// PUT /api/email-templates/:id - Update template
router.put('/:id', async (req, res) => {
  try {
    const { subject, htmlContent, isActive } = req.body
    
    const template = await EmailTemplate.findById(req.params.id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (subject) template.subject = subject
    if (htmlContent) template.htmlContent = htmlContent
    if (typeof isActive === 'boolean') template.isActive = isActive

    await template.save()
    res.json({ message: 'Template updated successfully', template })
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error: error.message })
  }
})

// PUT /api/email-templates/:id/toggle - Toggle template active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }
    
    template.isActive = !template.isActive
    await template.save()
    
    res.json({ 
      message: `Template ${template.isActive ? 'enabled' : 'disabled'}`, 
      template 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error toggling template', error: error.message })
  }
})

// POST /api/email-templates/:id/test - Send test email
router.post('/:id/test', async (req, res) => {
  try {
    const { testEmail } = req.body
    
    if (!testEmail) {
      return res.status(400).json({ message: 'Test email is required' })
    }

    const template = await EmailTemplate.findById(req.params.id)
    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    // Create test variables
    const testVariables = {
      name: 'Test User',
      email: testEmail,
      otp: '123456',
      amount: '$100.00',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN123456',
      date: new Date().toLocaleString(),
      reason: 'This is a test reason',
      newBalance: '$500.00',
      newPassword: 'TestPass123',
      loginUrl: 'https://powertradefx.com/login'
    }

    const result = await sendEmail(template.name, testEmail, testVariables)
    
    if (result.success) {
      res.json({ message: 'Test email sent successfully', messageId: result.messageId })
    } else {
      res.status(500).json({ message: 'Failed to send test email', error: result.error })
    }
  } catch (error) {
    res.status(500).json({ message: 'Error sending test email', error: error.message })
  }
})

export default router
