import express from 'express'
import jwt from 'jsonwebtoken'
import Banner from '../models/Banner.js'
import Admin from '../models/Admin.js'
import JWT_SECRET from '../config/jwt.js'

const router = express.Router()

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

const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Only Super Admin can perform this action' })
  }
  next()
}

// Public endpoint for active banners
router.get('/public/active', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
    res.json({ success: true, banners })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load banners', error: error.message })
  }
})

// List all banners (super admin)
router.get('/', verifyAdminToken, requireSuperAdmin, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, banners })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message })
  }
})

// Create banner
router.post('/', verifyAdminToken, requireSuperAdmin, async (req, res) => {
  try {
    const { title, subtitle, description, imageUrl, ctaText, ctaLink, order, isActive } = req.body
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image are required' })
    }
    const banner = await Banner.create({
      title,
      subtitle,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      order: order ?? 0,
      isActive: isActive ?? true,
      createdBy: req.admin._id
    })
    res.status(201).json({ success: true, banner })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message })
  }
})

// Update banner
router.put('/:id', verifyAdminToken, requireSuperAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' })
    }
    res.json({ success: true, banner })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message })
  }
})

// Delete banner
router.delete('/:id', verifyAdminToken, requireSuperAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id)
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' })
    }
    res.json({ success: true, message: 'Banner deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message })
  }
})

export default router
