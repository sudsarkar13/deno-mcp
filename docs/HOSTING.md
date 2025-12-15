# Hosting Guide for Deno MCP Server

This guide provides comprehensive instructions for hosting and deploying the Deno MCP Server in various environments, from local development to production cloud deployments.

## Table of Contents

- [Overview](#overview)
- [Local Hosting](#local-hosting)
- [Global NPM Installation](#global-npm-installation)
- [Docker Hosting](#docker-hosting)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Self-Hosted Solutions](#self-hosted-solutions)
- [CI/CD Integration](#cicd-integration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

The Deno MCP Server can be hosted in multiple ways depending on your needs:

1. **Local Development**: For personal use and development
2. **Team Sharing**: For team or organization-wide access
3. **Public Hosting**: For community or public access
4. **Enterprise Deployment**: For large-scale, secure deployments

## Local Hosting

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Latest stable version
- **Deno**: Latest stable version (for testing functionality)

### Quick Start

1. **Install globally via NPM**:

```bash
npm install -g @sudsarkar13/deno-mcp
```

2. **Run the server**:

```bash
deno-mcp
```

3. **Configure your MCP client**:

```json
{
 "mcpServers": {
  "deno-mcp": {
   "command": "deno-mcp",
   "args": []
  }
 }
}
```

### Local Development Setup

1. **Clone the repository**:

```bash
git clone https://github.com/sudsarkar13/deno-mcp.git
cd deno-mcp/deno-mcp-tools
```

2. **Install dependencies**:

```bash
npm install
```

3. **Build the project**:

```bash
npm run build
```

4. **Run locally**:

```bash
npm run inspector
```

## Global NPM Installation

### For End Users

The simplest way for users to access your MCP server:

1. **Installation**:

```bash
npm install -g @sudsarkar13/deno-mcp
```

2. **Usage**:

```bash
# Start the server
deno-mcp

# Check version
deno-mcp --version

# Get help
deno-mcp --help
```

3. **Client Configuration**:

```json
{
 "mcpServers": {
  "deno-mcp": {
   "command": "deno-mcp",
   "args": [],
   "env": {
    "DENO_DIR": "/path/to/.deno",
    "PATH": "/usr/local/bin:/usr/bin:/bin"
   }
  }
 }
}
```

### For Organizations

Create organization-specific installation scripts:

```bash
#!/bin/bash
# install-deno-mcp.sh

echo "Installing Deno MCP Server for organization..."

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Deno if not present
if ! command -v deno &> /dev/null; then
    echo "Installing Deno..."
    curl -fsSL https://deno.land/install.sh | sh
    export PATH="$HOME/.deno/bin:$PATH"
fi

# Install Deno MCP Server
npm install -g @sudsarkar13/deno-mcp

echo "Installation complete!"
echo "Run 'deno-mcp' to start the server"
```

## Docker Hosting

### Using Pre-built Images

The Deno MCP Server is available from multiple container registries with full multi-platform support.

#### Docker Hub Registry

```bash
# Pull latest version
docker pull sudsarkar13/deno-mcp:latest
docker pull sudsarkar13/deno-mcp:1.0.6

# Platform-specific pulls (optional - Docker auto-detects)
docker pull sudsarkar13/deno-mcp:1.0.6 --platform linux/amd64
docker pull sudsarkar13/deno-mcp:1.0.6 --platform linux/arm64
```

#### GitHub Container Registry (GHCR)

```bash
# Pull latest version
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:latest
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6

# Platform-specific pulls
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6 --platform linux/amd64
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6 --platform linux/arm64
```

#### Multi-Platform Support

- **AMD64 (x86_64)**: Intel and AMD 64-bit processors
- **ARM64 (aarch64)**: Apple Silicon Macs (M1/M2/M3), ARM-based cloud instances
- **Automatic Detection**: Docker automatically selects the correct architecture
- **Cross-Platform Testing**: All images are built and tested on both architectures

#### Run the Container

```bash
# Using Docker Hub
docker run -d \
  --name deno-mcp-server \
  -p 3000:3000 \
  -v $(pwd)/workspace:/workspace \
  sudsarkar13/deno-mcp:1.0.6

# Using GitHub Container Registry
docker run -d \
  --name deno-mcp-server \
  -p 3000:3000 \
  -v $(pwd)/workspace:/workspace \
  ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6
```

### Building Your Own Image

1. **Use the provided Dockerfile**:

```bash
cd deno-mcp-tools/examples/docker-examples
docker build -t deno-mcp:local .
```

2. **Run your custom image**:

```bash
docker run -d \
  --name deno-mcp-local \
  -p 3000:3000 \
  -v $(pwd)/workspace:/workspace \
  deno-mcp:local
```

### Docker Compose Deployment

1. **Use the provided docker-compose.yml**:

```bash
cd deno-mcp-tools/examples/docker-examples
docker-compose up -d deno-mcp
```

2. **Custom docker-compose for production**:

```yaml
version: "3.8"
services:
  deno-mcp:
    image: sudsarkar13/deno-mcp:latest
    container_name: deno-mcp-production
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - deno-cache:/home/denouser/.deno
      - ./workspace:/workspace:ro
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  deno-cache:
    driver: local
```

## Cloud Platform Deployment

### Railway

1. **Create a Railway project**:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
```

2. **Configure deployment**:

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "always"

[[deploy.environmentVariables]]
name = "NODE_ENV"
value = "production"
```

3. **Deploy**:

```bash
railway deploy
```

### Render

Render provides an excellent platform for hosting the Deno MCP Server with automatic deployments, health monitoring, and free tier support.

#### Quick Deployment

1. **Fork or clone the repository** to your GitHub account

2. **Connect to Render**:
   - Visit [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `deno-mcp` repository

3. **Configure the service** (or use the included `render.yaml`):
   - **Name**: `deno-mcp-server`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node build/render-server.js`
   - **Plan**: `Free` (or upgrade as needed)

4. **Set environment variables**:

   ```
   NODE_ENV=production
   LOG_LEVEL=info
   MCP_SERVER_NAME=deno-mcp-render
   DENO_DIR=/tmp/.deno
   ```

5. **Deploy**: Click "Create Web Service"

#### Using render.yaml (Recommended)

The repository includes a pre-configured `render.yaml` file optimized for free tier deployment:

```yaml
services:
  - type: web
    name: deno-mcp-server
    env: node
    region: oregon # Free tier available region
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: node build/render-server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: LOG_LEVEL
        value: info
      - key: MCP_SERVER_NAME
        value: deno-mcp-render
      - key: DENO_DIR
        value: /tmp/.deno
      - key: PORT
        fromService: true # Render auto-assigns this
    healthCheckPath: /health
    numInstances: 1
    # Free tier resource limits
    disk: 1GB
    # Auto-deploy configuration
    autoDeploy: true
    branch: main
    # Build settings
    buildFilter:
      paths:
        - src/**
        - package.json
        - package-lock.json
        - tsconfig.json
        - render.yaml
      ignoredPaths:
        - docs/**
        - examples/**
        - test/**
        - README.md
        - .gitignore
        - .github/**
    # Custom headers for security
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
      - path: /*
        name: Referrer-Policy
        value: strict-origin-when-cross-origin
```

#### Free Tier Specifications

- **Memory**: 512 MB RAM
- **CPU**: 0.1 CPU units
- **Storage**: 1 GB SSD
- **Bandwidth**: 100 GB/month
- **Sleep**: Automatic sleep after 15 minutes of inactivity
- **Runtime**: 750 hours/month limit
- **Custom domains**: Not included (paid plans only)

#### Auto-Deploy Setup

1. **Enable auto-deploy** in `render.yaml`:

   ```yaml
   autoDeploy: true
   branch: main
   ```

2. **Build optimization** with selective file monitoring:

   ```yaml
   buildFilter:
     paths:
       - src/**
       - package.json
       - package-lock.json
       - tsconfig.json
       - render.yaml
   ```

3. **Automatic deployments** trigger on:
   - Push to main branch
   - Changes to monitored files only
   - Manual deploy button in dashboard

#### Health Monitoring

The Render deployment includes comprehensive health monitoring:

1. **Health Check Endpoint**: `/health`

   ```json
   {
     "status": "healthy",
     "timestamp": "2023-12-14T10:30:00.000Z",
     "uptime": 3600,
     "server": "deno-mcp-render",
     "version": "1.0.6",
     "node_version": "v18.17.0",
     "memory": {
       "rss": 45678592,
       "heapTotal": 25165824,
       "heapUsed": 18874368,
       "external": 1234567
     },
     "mcp_process": {
       "running": true,
       "pid": 1234
     }
   }
   ```

2. **Status Page**: `/` or `/status`
   - Visual health dashboard
   - Real-time metrics
   - System information
   - Process status

3. **Metrics Endpoint**: `/metrics`
   - Prometheus-compatible metrics
   - Memory usage tracking
   - Uptime monitoring
   - Process health status

#### Custom Domain Configuration (Optional)

To add a custom domain after initial deployment:

1. **Upgrade to paid plan** (required for custom domains)

2. **Add domain in Render dashboard**:
   - Go to your service settings
   - Navigate to "Custom Domains"
   - Click "Add Custom Domain"
   - Enter your domain (e.g., `deno-mcp.yourdomain.com`)

3. **Configure DNS records**:

   ```
   Type: CNAME
   Name: deno-mcp (or your subdomain)
   Value: your-service-name.onrender.com
   TTL: 300 (or your provider's default)
   ```

4. **Update render.yaml** for custom domain:

   ```yaml
   services:
     - type: web
       name: deno-mcp-server
       # ... other configuration
       customDomains:
         - name: deno-mcp.yourdomain.com
           certificateId: auto # Automatic SSL certificate
   ```

5. **SSL Certificate**: Render automatically provisions SSL certificates

#### Environment Variables

**Required Environment Variables**:

- `NODE_ENV`: Set to `production`
- `PORT`: Auto-assigned by Render
- `LOG_LEVEL`: Set to `info` for production logging

**Optional Environment Variables**:

- `MCP_SERVER_NAME`: Custom server identifier
- `DENO_DIR`: Deno cache directory (defaults to `/tmp/.deno`)

**Setting Environment Variables**:

Via Render Dashboard:

1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Add key-value pairs
4. Deploy to apply changes

Via render.yaml:

```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: LOG_LEVEL
    value: info
  - key: CUSTOM_VARIABLE
    value: your_value
```

#### Monitoring and Logs

1. **Access logs** via Render dashboard:
   - Go to your service
   - Click "Logs" tab
   - View real-time logs
   - Filter by log level

2. **Set up log alerts**:
   - Configure email notifications
   - Set error thresholds
   - Monitor deployment status

3. **Performance monitoring**:

   ```bash
   # Check health endpoint
   curl https://your-service.onrender.com/health
   
   # View metrics
   curl https://your-service.onrender.com/metrics
   ```

#### Scaling and Upgrades

**Free Tier Limitations**:

- Single instance only
- Automatic sleep after inactivity
- Limited resources

**Upgrade Options**:

- **Starter Plan**: $7/month, no sleep, more resources
- **Standard Plan**: $25/month, auto-scaling, custom domains
- **Pro Plan**: $85/month, advanced features

**Scaling Configuration**:

```yaml
services:
  - type: web
    # ... other config
    numInstances: 1 # Free tier: 1, Paid: 1-100
    scaling:
      minInstances: 1
      maxInstances: 5
      targetMemoryPercent: 70
      targetCPUPercent: 70
```

#### Troubleshooting

**Common Issues**:

1. **Build Failures**:

   ```bash
   # Check build logs in Render dashboard
   # Ensure all dependencies are in package.json
   # Verify Node.js version compatibility
   ```

2. **Health Check Failures**:

   ```bash
   # Verify health endpoint responds
   curl https://your-service.onrender.com/health
   
   # Check application logs for errors
   # Ensure MCP server process is running
   ```

3. **Memory Issues** (Free Tier):

   ```yaml
   # Optimize for free tier in render.yaml
   envVars:
     - key: NODE_OPTIONS
       value: --max-old-space-size=460 # Leave room for system
   ```

4. **Deployment Timeouts**:

   ```yaml
   # Increase build timeout if needed
   buildCommand: timeout 900 npm ci && npm run build
   ```

**Debug Commands**:

```bash
# Test locally before deploying
npm run build
npm run start:render

# Check health endpoint locally
curl http://localhost:3000/health

# Monitor resource usage
curl http://localhost:3000/metrics
```

#### Best Practices

1. **Resource Optimization**:
   - Use `.renderignore` to exclude unnecessary files
   - Optimize Docker layers if using containers
   - Monitor memory usage on free tier

2. **Security**:
   - Use environment variables for secrets
   - Enable security headers (included in render.yaml)
   - Regularly update dependencies

3. **Monitoring**:
   - Set up health check alerts
   - Monitor application logs
   - Track performance metrics

4. **Deployment**:
   - Test changes locally first
   - Use staging environment for major changes
   - Monitor deployments for issues

#### Production Checklist

- [ ] Repository connected to Render
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Auto-deploy enabled
- [ ] Security headers configured
- [ ] Monitoring set up
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Performance optimized for tier
- [ ] Backup strategy in place

The Render deployment provides a robust, scalable hosting solution for the Deno MCP Server with minimal configuration required.

### Heroku

1. **Create Procfile**:

```
web: npm start
```

2. **Deploy**:

```bash
# Install Heroku CLI
heroku create deno-mcp-server
git push heroku main
```

### AWS Lambda

1. **Create lambda deployment package**:

```bash
# Install serverless framework
npm install -g serverless

# Create serverless.yml
cat > serverless.yml << EOF
service: deno-mcp-server
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
functions:
  mcpServer:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
EOF
```

2. **Create lambda handler**:

```javascript
// lambda.js
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
// Import your MCP server setup

exports.handler = async (event, context) => {
 // Lambda handler implementation
};
```

### Google Cloud Run

1. **Create Dockerfile** (use the provided one)

2. **Deploy to Cloud Run**:

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/deno-mcp

# Deploy to Cloud Run
gcloud run deploy deno-mcp-server \
  --image gcr.io/PROJECT-ID/deno-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

1. **Deploy container**:

```bash
az container create \
  --resource-group myResourceGroup \
  --name deno-mcp-server \
  --image sudsarkar13/deno-mcp:latest \
  --ports 3000 \
  --dns-name-label deno-mcp-unique \
  --environment-variables NODE_ENV=production
```

## Self-Hosted Solutions

### VPS Deployment

1. **Server setup** (Ubuntu/Debian):

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Deno
curl -fsSL https://deno.land/install.sh | sh
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install PM2 for process management
npm install -g pm2 @sudsarkar13/deno-mcp

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'deno-mcp-server',
    script: 'deno-mcp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

2. **Nginx reverse proxy**:

```nginx
# /etc/nginx/sites-available/deno-mcp
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **SSL with Let's Encrypt**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Systemd Service

1. **Create service file**:

```ini
# /etc/systemd/system/deno-mcp.service
[Unit]
Description=Deno MCP Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/deno-mcp
ExecStart=/usr/bin/node /usr/local/bin/deno-mcp
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
```

2. **Enable and start**:

```bash
sudo systemctl enable deno-mcp
sudo systemctl start deno-mcp
sudo systemctl status deno-mcp
```

## CI/CD Integration

### GitHub Actions

1. **Create workflow**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Deploy to production
        run: |
          # Your deployment script here
          echo "Deploying to production..."
```

2. **Docker build and push**:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: sudsarkar13/deno-mcp:latest
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm install
    - npm run build
    - npm run lint

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
```

## Monitoring and Maintenance

### Health Checks

1. **Basic health endpoint**:

```javascript
// Add to your server
app.get("/health", (req, res) => {
 res.json({
  status: "healthy",
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version,
 });
});
```

2. **Monitoring script**:

```bash
#!/bin/bash
# monitor.sh

check_health() {
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  if [ $response -eq 200 ]; then
    echo "$(date): Server is healthy"
  else
    echo "$(date): Server is unhealthy (HTTP $response)"
    # Restart service
    sudo systemctl restart deno-mcp
  fi
}

# Run every 5 minutes
while true; do
  check_health
  sleep 300
done
```

### Logging

1. **Configure logging**:

```javascript
// Add structured logging
const winston = require("winston");

const logger = winston.createLogger({
 level: "info",
 format: winston.format.json(),
 transports: [
  new winston.transports.File({ filename: "error.log", level: "error" }),
  new winston.transports.File({ filename: "combined.log" }),
 ],
});
```

2. **Log rotation**:

```bash
# /etc/logrotate.d/deno-mcp
/var/log/deno-mcp/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload deno-mcp
    endscript
}
```

### Metrics and Alerting

1. **Prometheus metrics**:

```javascript
const prometheus = require("prom-client");

// Create metrics
const httpDuration = new prometheus.Histogram({
 name: "http_request_duration_seconds",
 help: "Duration of HTTP requests in seconds",
 labelNames: ["method", "status_code"],
});

// Expose metrics endpoint
app.get("/metrics", (req, res) => {
 res.set("Content-Type", prometheus.register.contentType);
 res.end(prometheus.register.metrics());
});
```

2. **Grafana dashboard configuration**:

```json
{
 "dashboard": {
  "title": "Deno MCP Server",
  "panels": [
   {
    "title": "Request Rate",
    "type": "graph",
    "targets": [
     {
      "expr": "rate(http_requests_total[5m])"
     }
    ]
   }
  ]
 }
}
```

## Security Considerations

### Network Security

1. **Firewall configuration**:

```bash
# UFW firewall setup
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000  # Block direct access to app port
sudo ufw enable
```

2. **Rate limiting**:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

### Authentication

1. **API key authentication**:

```javascript
const authenticateApiKey = (req, res, next) => {
 const apiKey = req.headers["x-api-key"];
 if (!apiKey || !isValidApiKey(apiKey)) {
  return res.status(401).json({ error: "Invalid API key" });
 }
 next();
};

app.use("/api/", authenticateApiKey);
```

2. **JWT authentication**:

```javascript
const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
 const token = req.headers.authorization?.split(" ")[1];
 if (!token) {
  return res.status(401).json({ error: "Access token required" });
 }

 jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
   return res.status(403).json({ error: "Invalid token" });
  }
  req.user = user;
  next();
 });
};
```

### HTTPS Configuration

1. **Let's Encrypt with Nginx**:

```bash
sudo certbot --nginx -d your-domain.com
```

2. **Custom SSL certificate**:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        # ... other proxy settings
    }
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**:

```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill the process
sudo kill -9 <PID>
```

2. **Permission denied**:

```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/deno-mcp
chmod +x /usr/local/bin/deno-mcp
```

3. **Memory issues**:

```bash
# Check memory usage
free -h
# Check process memory
ps aux | grep deno-mcp
# Restart service
sudo systemctl restart deno-mcp
```

4. **Deno not found**:

```bash
# Add Deno to PATH
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
# Verify installation
deno --version
```

### Debugging Tools

1. **Log analysis**:

```bash
# View recent logs
journalctl -u deno-mcp -f

# Search for errors
grep -i error /var/log/deno-mcp/combined.log

# Analyze access patterns
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

2. **Performance monitoring**:

```bash
# Monitor system resources
htop
iotop
netstat -tuln

# Check application performance
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/health
```

3. **Network diagnostics**:

```bash
# Test connectivity
telnet localhost 3000
curl -I http://localhost:3000

# Check DNS resolution
nslookup your-domain.com
dig your-domain.com
```

## Best Practices

### Deployment Checklist

- [ ] Environment variables properly configured
- [ ] SSL certificates installed and valid
- [ ] Firewall rules configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Auto-restart mechanism in place
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Documentation updated

### Performance Optimization

1. **Caching strategies**:

```javascript
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.use("/api/cache", (req, res, next) => {
 const key = req.originalUrl;
 const cachedResponse = cache.get(key);

 if (cachedResponse) {
  return res.json(cachedResponse);
 }

 res.sendResponse = res.json;
 res.json = (body) => {
  cache.set(key, body);
  res.sendResponse(body);
 };

 next();
});
```

2. **Connection pooling**:

```javascript
// Configure connection limits
const server = app.listen(3000, () => {
 server.maxConnections = 1000;
 server.timeout = 30000; // 30 seconds
});
```

### Maintenance Schedule

- **Daily**: Check logs for errors
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Performance optimization review
- **Annually**: Security audit, disaster recovery test

This hosting guide provides comprehensive coverage for deploying the Deno MCP Server in various environments. Choose the deployment method that best fits your needs and security requirements.
