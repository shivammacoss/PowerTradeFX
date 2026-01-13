import nodemailer from 'nodemailer'
import EmailTemplate from '../models/EmailTemplate.js'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Replace template variables
const replaceVariables = (template, variables) => {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

// Get default templates
const getDefaultTemplates = () => ({
  signup_otp: {
    subject: 'Verify Your Email - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffffff; margin-top: 0;">Email Verification</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your verification code is:</p>
          <div style="background: #0f3460; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #00d4aa; letter-spacing: 8px;">{{otp}}</span>
          </div>
          <p style="color: #b0b0b0;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #b0b0b0;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'otp', 'year']
  },
  deposit_request: {
    subject: 'Deposit Request Received - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffffff; margin-top: 0;">Deposit Request Submitted</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your deposit request has been received and is being processed.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount:</strong> <span style="color: #00d4aa;">{{amount}}</span></p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Date:</strong> {{date}}</p>
          </div>
          <p style="color: #b0b0b0;">We will notify you once your deposit is approved.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'paymentMethod', 'transactionId', 'date', 'year']
  },
  deposit_approved: {
    subject: 'Deposit Approved - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00d4aa; margin-top: 0;">✓ Deposit Approved</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Great news! Your deposit has been approved and credited to your wallet.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount Credited:</strong> <span style="color: #00d4aa; font-size: 24px;">{{amount}}</span></p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>New Balance:</strong> {{newBalance}}</p>
          </div>
          <p style="color: #b0b0b0;">Start trading now!</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'newBalance', 'year']
  },
  deposit_rejected: {
    subject: 'Deposit Request Rejected - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ff6b6b; margin-top: 0;">✗ Deposit Rejected</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Unfortunately, your deposit request has been rejected.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount:</strong> {{amount}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="color: #b0b0b0;">Please contact support if you have any questions.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'reason', 'year']
  },
  withdrawal_request: {
    subject: 'Withdrawal Request Received - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffffff; margin-top: 0;">Withdrawal Request Submitted</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your withdrawal request has been received and is being processed.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount:</strong> <span style="color: #00d4aa;">{{amount}}</span></p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Date:</strong> {{date}}</p>
          </div>
          <p style="color: #b0b0b0;">Processing time: 24-48 hours</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'paymentMethod', 'date', 'year']
  },
  withdrawal_approved: {
    subject: 'Withdrawal Approved - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00d4aa; margin-top: 0;">✓ Withdrawal Approved</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your withdrawal has been approved and processed.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount:</strong> <span style="color: #00d4aa; font-size: 24px;">{{amount}}</span></p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          </div>
          <p style="color: #b0b0b0;">The funds will be credited to your account within 24 hours.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'paymentMethod', 'year']
  },
  withdrawal_rejected: {
    subject: 'Withdrawal Request Rejected - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ff6b6b; margin-top: 0;">✗ Withdrawal Rejected</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Unfortunately, your withdrawal request has been rejected.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Amount:</strong> {{amount}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="color: #b0b0b0;">The amount has been refunded to your wallet. Please contact support for more information.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'amount', 'reason', 'year']
  },
  account_banned: {
    subject: 'Account Permanently Banned - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ff6b6b; margin-top: 0;">⚠ Account Banned</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your account has been <strong>permanently banned</strong>.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Reason:</strong> {{reason}}</p>
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Date:</strong> {{date}}</p>
          </div>
          <p style="color: #b0b0b0;">If you believe this is a mistake, please contact our support team.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'reason', 'date', 'year']
  },
  account_blocked: {
    subject: 'Account Temporarily Blocked - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffa502; margin-top: 0;">⚠ Account Blocked</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your account has been <strong>temporarily blocked</strong>.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Reason:</strong> {{reason}}</p>
          </div>
          <p style="color: #b0b0b0;">Please contact support to resolve this issue.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'reason', 'year']
  },
  welcome: {
    subject: 'Welcome to PowerTradeFX!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00d4aa; margin-top: 0;">Welcome to PowerTradeFX!</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Thank you for joining PowerTradeFX. Your account has been successfully created.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>Email:</strong> {{email}}</p>
          </div>
          <p style="color: #b0b0b0;">Get started by making your first deposit and exploring our trading features.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{loginUrl}}" style="display: inline-block; background: #00d4aa; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Trading</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'email', 'loginUrl', 'year']
  },
  password_reset: {
    subject: 'Password Reset - PowerTradeFX',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
        <div style="text-align: center; padding: 20px;">
          <h1 style="color: #00d4aa; margin: 0;">PowerTradeFX</h1>
        </div>
        <div style="background: #16213e; padding: 30px; border-radius: 10px;">
          <h2 style="color: #ffffff; margin-top: 0;">Password Reset</h2>
          <p style="color: #b0b0b0;">Hello {{name}},</p>
          <p style="color: #b0b0b0;">Your password has been reset by the administrator.</p>
          <div style="background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #b0b0b0;"><strong>New Password:</strong> <span style="color: #00d4aa; font-family: monospace;">{{newPassword}}</span></p>
          </div>
          <p style="color: #ff6b6b;"><strong>Important:</strong> Please change your password after logging in.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>&copy; {{year}} PowerTradeFX. All rights reserved.</p>
        </div>
      </div>
    `,
    variables: ['name', 'newPassword', 'year']
  }
})

// Send email using template
export const sendEmail = async (templateName, to, variables = {}) => {
  try {
    // Try to get custom template from database
    let template = await EmailTemplate.findOne({ name: templateName, isActive: true })
    
    // Fall back to default template
    if (!template) {
      const defaults = getDefaultTemplates()
      if (!defaults[templateName]) {
        throw new Error(`Template "${templateName}" not found`)
      }
      template = defaults[templateName]
    }

    // Add common variables
    const allVariables = {
      ...variables,
      year: new Date().getFullYear()
    }

    // Replace variables in subject and content
    const subject = replaceVariables(template.subject, allVariables)
    const htmlContent = replaceVariables(template.htmlContent, allVariables)

    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`[Email] Sent ${templateName} to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[Email] Error sending ${templateName} to ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Initialize default templates in database
export const initializeEmailTemplates = async () => {
  try {
    const defaults = getDefaultTemplates()
    
    for (const [name, template] of Object.entries(defaults)) {
      const existing = await EmailTemplate.findOne({ name })
      if (!existing) {
        await EmailTemplate.create({
          name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          variables: template.variables,
          description: `Default ${name.replace(/_/g, ' ')} template`
        })
        console.log(`[Email] Created default template: ${name}`)
      }
    }
  } catch (error) {
    console.error('[Email] Error initializing templates:', error.message)
  }
}

export default { sendEmail, generateOTP, initializeEmailTemplates }
