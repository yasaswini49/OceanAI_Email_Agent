# OceanAI Email Agent - Deployment Guide

## Production Deployment with Docker Compose

This guide covers deploying the OceanAI Email Agent in production using Docker Compose. The application consists of three containerized services:

- **Backend**: Flask + Gunicorn (Python 3.12)
- **Frontend**: React + serve (Node 18)
- **Nginx**: Reverse proxy and load balancer

---

## Pre-Deployment Checklist

### Environment Configuration

- [ ] `.env` file created in project root
- [ ] `APPLICATION_ID` (Azure) configured
- [ ] `COHERE_API_KEY` configured
- [ ] Azure app permissions granted (Mail.Read, Mail.ReadWrite)
- [ ] Firewall rules configured for ports 80, 443
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Domain name configured (optional)
- [ ] Backup strategy in place for `backend/data/` volume

### Infrastructure Requirements

- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose V2 installed
- [ ] At least 2GB RAM available
- [ ] At least 10GB disk space
- [ ] Network connectivity for external APIs (Azure, Cohere)

---

## Environment Configuration

### Production Environment Variables

Create `.env` in project root (`C:\OceanAI\.env` or `/opt/oceanai/.env`):

```env
# Microsoft Graph API Configuration
APPLICATION_ID=your_production_azure_app_id

# Cohere AI Configuration
COHERE_API_KEY=your_production_cohere_key

# Flask Configuration
FLASK_ENV=production

# Optional: Custom ports (if needed)
# BACKEND_PORT=5000
# FRONTEND_PORT=3000
# NGINX_PORT=80
```

### Security Best Practices

1. **Never commit `.env` to version control**
2. **Use strong, unique API keys**
3. **Rotate keys periodically**
4. **Limit Azure app permissions to minimum required**
5. **Enable Azure Conditional Access if available**

---

## Production Deployment Steps

### 1. Prepare Server Environment

**Linux (Ubuntu/Debian recommended):**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose V2
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**Windows Server:**

- Install Docker Desktop for Windows Server
- Enable WSL 2 backend
- Verify Docker Compose included

### 2. Deploy Application

```bash
# Clone or copy project to server
cd /opt
sudo git clone <your-repo-url> oceanai
cd oceanai

# Create production environment file
sudo nano .env
```

Paste your production credentials:

```env
APPLICATION_ID=your_azure_app_id
COHERE_API_KEY=your_cohere_key
FLASK_ENV=production
```

### 3. Build and Start Services

```bash
# Build all containers
sudo docker compose build

# Start services in detached mode
sudo docker compose up -d

# Verify all services running
sudo docker ps
```

Expected output:

```
CONTAINER ID   IMAGE              STATUS         PORTS
abc123...      oceanai-backend    Up 2 minutes   0.0.0.0:5000->5000/tcp
def456...      oceanai-frontend   Up 2 minutes   0.0.0.0:3000->3000/tcp
ghi789...      nginx:alpine       Up 2 minutes   0.0.0.0:80->80/tcp
```

### 4. Verify Deployment

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:3000

# Check Nginx proxy
curl http://localhost
```

### 5. Configure Firewall (Linux)

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if configured)
sudo ufw allow 443/tcp

# Allow SSH (if managing remotely)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

---

## SSL/HTTPS Configuration

### Option 1: Let's Encrypt with Certbot (Recommended)

1. **Install Certbot**

```bash
sudo apt-get install certbot
```

2. **Obtain Certificate**

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. **Update Nginx Configuration**

Edit `nginx/default.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Update docker-compose.yml to mount certificates**

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
  depends_on:
    - backend
    - frontend
  restart: unless-stopped
```

5. **Restart Nginx**

```bash
sudo docker compose restart nginx
```

### Option 2: Cloudflare SSL (Easiest)

1. Add your domain to Cloudflare
2. Update DNS to point to your server IP
3. Enable Cloudflare SSL (Full or Full Strict)
4. Cloudflare handles SSL termination automatically

---

## Security Considerations

### 1. API Security

- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Implement rate limiting
- [ ] Use API keys for authentication
- [ ] Validate all input data
- [ ] Implement CORS properly
- [ ] Use secure headers

### 2. Data Protection

- [ ] Encrypt sensitive data at rest
- [ ] Use TLS for data in transit
- [ ] Implement backup and recovery
- [ ] Secure access logs
- [ ] PII compliance (GDPR, CCPA)

### 3. Authentication

- [ ] Use OAuth2 for Microsoft integration
- [ ] Implement token refresh
- [ ] Secure token storage
- [ ] Implement logout functionality
- [ ] Session timeout

### 4. Infrastructure

- [ ] Use firewall rules
- [ ] Implement DDoS protection
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use security scanning tools

---

## Monitoring and Logging

### Setup Monitoring

1. **Application Performance Monitoring (APM)**

   - Install Sentry: `pip install sentry-sdk`
   - Configure in app.py:
     ```python
     import sentry_sdk
     sentry_sdk.init("https://your-sentry-dsn@sentry.io/123456")
     ```

2. **Log Aggregation**

   - Use CloudWatch (AWS) or similar
   - Store logs for at least 30 days
   - Monitor for errors and warnings

3. **Alerting**
   - Setup alerts for high error rates
   - Monitor API response times
   - Track authentication failures

---

## SSL Certificate Setup

### Using Let's Encrypt with Nginx

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (AWS ELB, Nginx)
- Deploy multiple backend instances
- Use shared database
- Implement session management

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching (Redis)
- Use CDN for static assets

---

## Backup and Recovery

### Database Backup

```bash
# Daily backup
0 2 * * * pg_dump ocean_ai_db > /backups/db_$(date +\%Y\%m\%d).sql

# Weekly to cloud storage
0 3 0 * * aws s3 cp /backups/db_latest.sql s3://your-bucket/backups/
```

### Application Backup

- Backup application code and configuration
- Backup user data and tokens
- Test recovery procedure monthly

---

## Post-Deployment

### Verification Checklist

- [ ] Health check endpoint working
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Emails can be fetched and processed
- [ ] Error logging active
- [ ] Monitoring alerts active
- [ ] SSL certificate valid
- [ ] CORS configured correctly

### Performance Testing

```bash
# Using Apache Bench
ab -n 1000 -c 100 https://yourdomain.com/api/health

# Using wrk
wrk -t4 -c100 -d30s https://yourdomain.com/api/health
```

---

## Rollback Procedure

If deployment fails:

1. Check logs for errors
2. Revert to last stable version
3. Verify previous deployment works
4. Investigate root cause
5. Deploy with fixes

---

## Support and Maintenance

### Regular Maintenance

- Update dependencies monthly
- Review security logs weekly
- Monitor performance metrics
- Clean up old logs/data
- Test backup recovery monthly

### Support Contacts

- Technical: team@example.com
- Security Issues: security@example.com
- Emergencies: +1-xxx-xxx-xxxx

---

For setup instructions, see `SETUP.md`
For API documentation, see `API.md`
