# PowerTradeFX VPS Deployment Guide

## Project Overview
- **Frontend:** React + Vite (port 5173 in dev, static files in production)
- **Backend:** Node.js + Express (port 5001)
- **Database:** MongoDB
- **Domain:** powertradefx.com
- **SSL:** Cloudflare Full (Strict) Mode

---

## Part 1: VPS Initial Setup (Ubuntu 22.04/24.04)

### 1.1 Connect to VPS
```bash
ssh root@your_vps_ip
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Create Non-Root User (Recommended)
```bash
adduser powertradefx
usermod -aG sudo powertradefx
su - powertradefx
```

---

## Part 2: Install Required Software

### 2.1 Install Node.js (v20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### 2.2 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 2.3 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.5 Install Git
```bash
sudo apt install -y git
```

---

## Part 3: Deploy Project Files

### 3.1 Create Project Directory
```bash
sudo mkdir -p /var/www/powertradefx
sudo chown -R $USER:$USER /var/www/powertradefx
cd /var/www/powertradefx
```

### 3.2 Upload Project Files
**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/your-repo/powertradefx.git .
```

**Option B: Using SCP from your local machine**
```bash
# Run this from your LOCAL machine (Windows PowerShell)
scp -r D:\ptojects\master\newForex\* root@your_vps_ip:/var/www/powertradefx/
```

**Option C: Using SFTP client like FileZilla**
- Connect to VPS
- Upload contents of `newForex` folder to `/var/www/powertradefx/`

---

## Part 4: Configure Backend

### 4.1 Install Backend Dependencies
```bash
cd /var/www/powertradefx/backend
npm install
```

### 4.2 Configure Environment Variables
```bash
nano .env
```

Update the `.env` file:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/powertradefx
JWT_SECRET=GENERATE_A_STRONG_64_CHARACTER_SECRET_KEY_HERE

# Brevo SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9feef9001@smtp-brevo.com
SMTP_PASS=your_smtp_password
SMTP_FROM_NAME=PowerTradeFX
SMTP_FROM_EMAIL=powertradde@gmail.com
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.3 Start Backend with PM2
```bash
cd /var/www/powertradefx/backend
pm2 start server.js --name "powertradefx-api"
pm2 save
pm2 startup  # Follow the command it outputs
```

---

## Part 4.5: Create Super Admin Account

### Run the admin creation script:
```bash
cd /var/www/powertradefx/backend
node scripts/createAdmin.js
```

This creates a Super Admin with:
| Field | Value |
|-------|-------|
| **Email** | admin@powertradefx.com |
| **Password** | Admin@123 |
| **Role** | SUPER_ADMIN |
| **URL Slug** | powertradefx |

⚠️ **IMPORTANT:** Change the password immediately after first login!

### Admin Panel URL:
```
https://powertradefx.com/admin/login
```

### To create admin with custom credentials:
Edit `backend/scripts/createAdmin.js` and change:
- Line 79: `email: 'your-email@example.com'`
- Line 80: `bcrypt.hash('YourPassword123', 12)`
- Line 85: `urlSlug: 'your-slug'`

---

## Part 5: Configure Frontend

### 5.1 Create Frontend Environment File
```bash
cd /var/www/powertradefx/frontend
nano .env.production
```

Add this content:
```env
VITE_API_URL=https://powertradefx.com
```

### 5.2 Install Dependencies and Build
```bash
npm install
npm run build
```

This creates a `dist` folder with production files.

---

## Part 6: Cloudflare SSL Full (Strict) Setup

### 6.1 Generate Cloudflare Origin Certificate

1. Log in to **Cloudflare Dashboard**
2. Select your domain **powertradefx.com**
3. Go to **SSL/TLS** → **Origin Server**
4. Click **Create Certificate**
5. Select:
   - Private key type: **RSA (2048)**
   - Hostnames: `powertradefx.com, *.powertradefx.com`
   - Certificate validity: **15 years**
6. Click **Create**
7. **Copy the Origin Certificate** and **Private Key**

### 6.2 Save Certificates on VPS
```bash
# Create certificate directory
sudo mkdir -p /etc/ssl/cloudflare

# Create certificate file
sudo nano /etc/ssl/cloudflare/powertradefx.com.pem
# Paste the Origin Certificate content, save and exit

# Create private key file
sudo nano /etc/ssl/cloudflare/powertradefx.com.key
# Paste the Private Key content, save and exit

# Set proper permissions
sudo chmod 600 /etc/ssl/cloudflare/powertradefx.com.key
sudo chmod 644 /etc/ssl/cloudflare/powertradefx.com.pem
```

### 6.3 Set Cloudflare SSL Mode to Full (Strict)

1. In Cloudflare Dashboard → **SSL/TLS** → **Overview**
2. Select **Full (strict)**

---

## Part 7: Configure Nginx

### 7.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/powertradefx
```

Paste this configuration:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name powertradefx.com www.powertradefx.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name powertradefx.com www.powertradefx.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/powertradefx.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/powertradefx.com.key;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend - Serve static files
    root /var/www/powertradefx/frontend/dist;
    index index.html;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO WebSocket Support
    location /socket.io {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

### 7.2 Enable Site and Test Configuration
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/powertradefx /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Part 8: Cloudflare DNS Configuration

In Cloudflare Dashboard → **DNS**:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | YOUR_VPS_IP | Proxied (Orange) |
| A | www | YOUR_VPS_IP | Proxied (Orange) |

---

## Part 9: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Part 10: Useful Commands

### PM2 Commands
```bash
pm2 status              # Check app status
pm2 logs powertradefx-api   # View logs
pm2 restart powertradefx-api  # Restart app
pm2 stop powertradefx-api     # Stop app
pm2 monit               # Monitor resources
```

### Update Deployment
```bash
cd /var/www/powertradefx

# Pull latest changes (if using Git)
git pull

# Update backend
cd backend
npm install
pm2 restart powertradefx-api

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

### View Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs
```

---

## Part 11: Security Checklist

- [x] Change default SSH port (optional but recommended)
- [x] Use strong JWT_SECRET
- [x] Enable UFW firewall
- [x] Cloudflare SSL Full (Strict) enabled
- [x] Keep system updated: `sudo apt update && sudo apt upgrade`
- [x] Set up automatic security updates

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Troubleshooting

### Backend not starting
```bash
pm2 logs powertradefx-api --lines 50
```

### MongoDB connection issues
```bash
sudo systemctl status mongod
sudo journalctl -u mongod
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate issues
- Ensure Cloudflare is in **Full (Strict)** mode
- Verify certificate files exist and have correct permissions

---

## Summary

1. **VPS IP** → Cloudflare DNS (Proxied)
2. **Cloudflare** → Full (Strict) SSL with Origin Certificate
3. **Nginx** → Serves frontend + proxies API requests
4. **PM2** → Keeps backend running
5. **MongoDB** → Local database

Your site will be live at: **https://powertradefx.com**
