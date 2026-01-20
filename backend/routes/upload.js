import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import Admin from '../models/Admin.js'
import JWT_SECRET from '../config/jwt.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads')
const screenshotsDir = path.join(uploadsDir, 'screenshots')
const bannersDir = path.join(uploadsDir, 'banners')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}
if (!fs.existsSync(bannersDir)) {
  fs.mkdirSync(bannersDir, { recursive: true })
}

// Configure multer for file uploads
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, screenshotsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `screenshot-${uniqueSuffix}${ext}`)
  }
})

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannersDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `banner-${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false)
  }
}

const screenshotUpload = multer({
  storage: screenshotStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

const verifySuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authorization token required' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = await Admin.findById(decoded.adminId)
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can upload banners' })
    }
    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

// POST /api/upload/screenshot - Upload payment screenshot
router.post('/screenshot', screenshotUpload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const fileUrl = `/uploads/screenshots/${req.file.filename}`

    res.json({
      success: true,
      message: 'Screenshot uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Error uploading screenshot:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/upload/banner - Upload banner image
router.post('/banner', verifySuperAdmin, bannerUpload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const fileUrl = `/uploads/banners/${req.file.filename}`

    res.json({
      success: true,
      message: 'Banner uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Error uploading banner:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' })
    }
    return res.status(400).json({ success: false, message: error.message })
  }
  next(error)
})

export default router
