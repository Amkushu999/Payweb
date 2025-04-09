# AMKUSH Payment System VPS Deployment Guide

This guide provides comprehensive step-by-step instructions for deploying the AMKUSH payment processing system on your own VPS (Virtual Private Server).

## 1. Prepare Your VPS

1. **Set up a VPS with a provider** like DigitalOcean, Linode, AWS, or any other VPS provider
   - Choose Ubuntu 22.04 LTS (recommended for stability)
   - Minimum recommended specs: 2GB RAM, 1 CPU, 25GB SSD

2. **Connect to your VPS via SSH**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Update the system**:
   ```bash
   apt update && apt upgrade -y
   ```

4. **Create a non-root user** (optional but recommended for security):
   ```bash
   adduser amkush
   usermod -aG sudo amkush
   su - amkush
   ```

## 2. Install Required Software

1. **Install Node.js & npm**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Git**:
   ```bash
   sudo apt install git -y
   ```

3. **Install PM2** (process manager for Node.js):
   ```bash
   sudo npm install pm2 -g
   ```

## 3. Set Up Your Application

1. **Clone your repository** (or transfer files to the server):
   ```bash
   git clone https://your-repository-url.git
   cd your-repo-name
   ```

   Or if you're transferring files from your local machine:
   ```bash
   # On your local machine
   scp -r ./your-project-folder amkush@your-server-ip:~/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## 4. Configure Environment Variables

1. **Create an environment file**:
   ```bash
   nano .env
   ```

2. **Add your environment variables**:
   ```
   # Add all required environment variables
   STRIPE_SECRET_KEY=sk_your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_your_stripe_public_key
   PAYPAL_SECRET=your_paypal_secret
   NODE_ENV=production
   PORT=5000
   ```
   Save and exit (Ctrl+X, then Y, then Enter)

## 5. Set Up Reverse Proxy with Nginx

1. **Install Nginx**:
   ```bash
   sudo apt install nginx -y
   ```

2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/amkush
   ```

3. **Add the following configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Replace `your-domain.com` with your actual domain name

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/amkush /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 6. Set Up SSL (HTTPS)

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```
   Follow the prompts to complete the process

## 7. Start Your Application with PM2

1. **Start the application**:
   ```bash
   pm2 start npm --name "amkush-payment" -- run start
   ```

2. **Set up PM2 to start on system boot**:
   ```bash
   pm2 startup
   ```
   Run the command it suggests

3. **Save the PM2 configuration**:
   ```bash
   pm2 save
   ```

## 8. Set Up Firewall Rules

1. **Configure UFW firewall**:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

## 9. Monitoring and Maintenance

1. **View application logs**:
   ```bash
   pm2 logs amkush-payment
   ```

2. **Monitor application status**:
   ```bash
   pm2 status
   ```

3. **Set up log rotation**:
   ```bash
   sudo pm2 install pm2-logrotate
   ```

## 10. Deploy Updates

When you need to update your application:

1. **Pull new changes**:
   ```bash
   cd ~/your-repo-name
   git pull
   ```

2. **Install any new dependencies**:
   ```bash
   npm install
   ```

3. **Rebuild the project**:
   ```bash
   npm run build
   ```

4. **Restart the application**:
   ```bash
   pm2 restart amkush-payment
   ```

## 11. Additional Security Measures

1. **Set up fail2ban** to protect against brute force attacks:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

2. **Configure automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades -y
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## 12. Payment Gateway Configuration

1. **Verify Stripe Webhook Configuration**:
   - Log into your Stripe Dashboard
   - Go to Developers > Webhooks
   - Add a new endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`

2. **Configure PayPal Webhook**:
   - Log into your PayPal Developer Dashboard
   - Navigate to My Apps & Credentials
   - Select your app and add a webhook endpoint: `https://your-domain.com/api/webhooks/paypal`
   - Subscribe to events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

3. **Test Your Payment Processing**:
   - Make a test payment with Stripe's test cards
   - Verify the transaction appears in your dashboard
   - Check the server logs to ensure proper handling

## 13. Database Backups (If Applicable)

1. **Set up automated database backups**:
   ```bash
   # Create a backup script
   sudo nano /usr/local/bin/backup-db.sh
   ```

2. **Add backup script content**:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/home/amkush/backups"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   mkdir -p $BACKUP_DIR
   
   # Assuming PostgreSQL - modify if using a different database
   pg_dump -U your_db_user your_db_name > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
   
   # Keep only the last 7 backups
   ls -tp $BACKUP_DIR/*.sql | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}
   ```

3. **Make the script executable**:
   ```bash
   sudo chmod +x /usr/local/bin/backup-db.sh
   ```

4. **Schedule the backup with cron**:
   ```bash
   sudo crontab -e
   ```
   Add this line to run daily at 2 AM:
   ```
   0 2 * * * /usr/local/bin/backup-db.sh
   ```

By following these steps, your AMKUSH payment system will be securely deployed on your VPS with HTTPS encryption, proper process management, and essential security measures. This setup ensures reliable payment processing for your customers through Stripe, PayPal, and bank transfer payment options.