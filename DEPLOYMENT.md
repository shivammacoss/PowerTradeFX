# PowerTradeFX Deployment Guide - Hostinger VPS with Cloudflare SSL

## Prerequisites
- Hostinger VPS with Ubuntu 22.04+
- Domain: powertradefx.com connected to Cloudflare
- Cloudflare SSL set to **Full (Strict)** mode

---

## Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

---

## Step 2: Update System & Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install -y nginx

# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install -y git
```

---

## Step 3: Clone Your Project

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/powertradefx.git
cd powertradefx
```

Or upload via SFTP to `/var/www/powertradefx`

---

## Step 4: Setup Backend

```bash
cd /var/www/powertradefx/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Backend .env content:**
```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/powertradefx
JWT_SECRET=generate-a-strong-random-string-here
FRONTEND_URL=https://powertradefx.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@powertradefx.com

# MetaAPI (if using)
META_API_TOKEN=your-token
META_API_ACCOUNT_ID=your-account-id
```

**Start backend with PM2:**
```bash
pm2 start server.js --name "powertradefx-api"
pm2 save
pm2 startup
```

**Create admin user:**
```bash
node scripts/createAdmin.js
```

---

## Step 5: Setup Frontend

```bash
cd /var/www/powertradefx/frontend

# Create .env file
nano .env
```

**Frontend .env content:**
```env
VITE_API_URL=https://api.powertradefx.com
```

**Build frontend:**
```bash
npm install
npm run build
```

The build output will be in the `dist` folder.

---

## Step 6: Configure Nginx

### Create Cloudflare Origin Certificate (for Full Strict SSL)

1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server
2. Click "Create Certificate"
3. Keep defaults (RSA 2048, 15 years)
4. Copy the certificate and private key

```bash
# Create certificate files
mkdir -p /etc/ssl/cloudflare

nano /etc/ssl/cloudflare/powertradefx.pem
# Paste the CERTIFICATE

nano /etc/ssl/cloudflare/powertradefx.key
# Paste the PRIVATE KEY

chmod 600 /etc/ssl/cloudflare/powertradefx.key
```

### Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/powertradefx
```

**Nginx config content:**
```nginx
# Frontend - powertradefx.com
server {
    listen 80;
    server_name powertradefx.com www.powertradefx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name powertradefx.com www.powertradefx.com;

    ssl_certificate /etc/ssl/cloudflare/powertradefx.pem;
    ssl_certificate_key /etc/ssl/cloudflare/powertradefx.key;

    root /var/www/powertradefx/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API - api.powertradefx.com
server {
    listen 80;
    server_name api.powertradefx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.powertradefx.com;

    ssl_certificate /etc/ssl/cloudflare/powertradefx.pem;
    ssl_certificate_key /etc/ssl/cloudflare/powertradefx.key;

    # Increase body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support for Socket.IO
        proxy_read_timeout 86400;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/powertradefx/backend/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

**Enable the site:**
```bash
ln -s /etc/nginx/sites-available/powertradefx /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## Step 7: Cloudflare DNS Configuration

In Cloudflare Dashboard → DNS, add these records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | YOUR_VPS_IP | Proxied (orange cloud) |
| A | www | YOUR_VPS_IP | Proxied (orange cloud) |
| A | api | YOUR_VPS_IP | Proxied (orange cloud) |

---

## Step 8: Cloudflare SSL Settings

1. Go to **SSL/TLS** → **Overview**
   - Set to **Full (strict)**

2. Go to **SSL/TLS** → **Edge Certificates**
   - Enable **Always Use HTTPS**
   - Enable **Automatic HTTPS Rewrites**
   - Set **Minimum TLS Version** to TLS 1.2

3. Go to **SSL/TLS** → **Origin Server**
   - Enable **Authenticated Origin Pulls** (optional, extra security)

---

## Step 9: Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## Step 10: Verify Deployment

```bash
# Check backend status
pm2 status
pm2 logs powertradefx-api

# Check nginx status
systemctl status nginx

# Check MongoDB status
systemctl status mongod
```

**Test URLs:**
- Frontend: https://powertradefx.com
- API: https://api.powertradefx.com

---

## Useful Commands

```bash
# Restart backend
pm2 restart powertradefx-api

# View backend logs
pm2 logs powertradefx-api

# Rebuild frontend after changes
cd /var/www/powertradefx/frontend
npm run build

# Restart nginx
systemctl restart nginx

# Update from git
cd /var/www/powertradefx
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart powertradefx-api
```

---

## Troubleshooting

### 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs powertradefx-api`

### SSL Certificate Error
- Verify Cloudflare Origin Certificate is correctly installed
- Check Cloudflare SSL mode is "Full (strict)"

### MongoDB Connection Error
- Check MongoDB status: `systemctl status mongod`
- Verify MONGODB_URI in .env

### WebSocket Not Working
- Ensure nginx has WebSocket headers configured
- Check Cloudflare WebSocket setting is enabled (Network → WebSockets)
