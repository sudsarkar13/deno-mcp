# Render Deployment Guide for Deno MCP Server

This guide provides step-by-step instructions for deploying the Deno MCP Server on Render with comprehensive configuration and troubleshooting.

## Quick Start Deployment

### Prerequisites

- GitHub account with the deno-mcp repository
- Render account (free tier available)
- Basic understanding of environment variables

### Step-by-Step Deployment

1. **Prepare Repository**

   ```bash
   # Ensure you have the latest code
   git pull origin main
   
   # Verify required files exist
   ls render.yaml
   ls src/render-server.ts
   ls .renderignore
   ```

2. **Connect to Render**
   - Visit [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account if not already connected
   - Choose the `deno-mcp` repository

3. **Service Configuration**

   **Using render.yaml (Recommended)**:
   - Render will automatically detect the `render.yaml` file
   - Review the configuration and click "Create Web Service"

   **Manual Configuration**:
   - **Name**: `deno-mcp-server`
   - **Environment**: `Node`
   - **Region**: `Oregon` (free tier)
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node build/render-server.js`

4. **Environment Variables**

   The following variables are automatically set via `render.yaml`:

   ```
   NODE_ENV=production
   LOG_LEVEL=info
   MCP_SERVER_NAME=deno-mcp-render
   DENO_DIR=/tmp/.deno
   PORT=<auto-assigned>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete (typically 2-5 minutes)
   - Monitor the deployment logs for any issues

### Deployment Verification

1. **Check Health Endpoint**

   ```bash
   # Replace with your actual Render URL
   curl https://deno-mcp-server-xxx.onrender.com/health
   ```

   Expected response:

   ```json
   {
     "status": "healthy",
     "timestamp": "2023-12-14T22:30:00.000Z",
     "uptime": 120,
     "server": "deno-mcp-render",
     "version": "1.0.6",
     "mcp_process": {
       "running": true,
       "pid": 15
     }
   }
   ```

2. **Visit Status Page**
   - Open your Render URL in a browser
   - Should see a comprehensive status dashboard
   - All indicators should show "healthy" status

3. **Check Metrics**

   ```bash
   curl https://deno-mcp-server-xxx.onrender.com/metrics
   ```

## Configuration Details

### render.yaml Explanation

```yaml
services:
  - type: web                    # Web service type
    name: deno-mcp-server       # Service name in Render
    env: node                   # Runtime environment
    region: oregon              # Free tier region
    plan: free                  # Pricing plan
    buildCommand: npm ci && npm run build
    startCommand: node build/render-server.js
    
    # Environment variables
    envVars:
      - key: NODE_ENV
        value: production       # Production environment
      - key: LOG_LEVEL
        value: info            # Logging level
      - key: MCP_SERVER_NAME
        value: deno-mcp-render # Server identifier
      - key: DENO_DIR
        value: /tmp/.deno      # Deno cache directory
      - key: PORT
        fromService: true      # Auto-assigned by Render
    
    # Health monitoring
    healthCheckPath: /health    # Health check endpoint
    numInstances: 1            # Single instance (free tier)
    disk: 1GB                  # Storage allocation
    
    # Auto-deployment
    autoDeploy: true           # Deploy on git push
    branch: main               # Target branch
    
    # Build optimization
    buildFilter:
      paths:                   # Monitor these files for changes
        - src/**
        - package.json
        - package-lock.json
        - tsconfig.json
        - render.yaml
      ignoredPaths:            # Ignore these files/directories
        - docs/**
        - examples/**
        - test/**
        - README.md
        - .gitignore
        - .github/**
    
    # Security headers
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

### Free Tier Limitations

- **Memory**: 512 MB RAM
- **CPU**: 0.1 CPU units (shared)
- **Storage**: 1 GB SSD
- **Bandwidth**: 100 GB/month
- **Sleep**: Auto-sleep after 15 minutes of inactivity
- **Runtime**: 750 hours/month
- **Instances**: 1 instance only
- **Custom domains**: Not available (upgrade required)

### Resource Optimization for Free Tier

1. **Memory Management**

   ```yaml
   envVars:
     - key: NODE_OPTIONS
       value: --max-old-space-size=460  # Leave room for system
   ```

2. **Build Optimization**
   - Uses `.renderignore` to exclude unnecessary files
   - Selective build triggers via `buildFilter`
   - Efficient caching strategies

3. **Process Management**
   - Automatic restart on failure
   - Health check monitoring
   - Graceful shutdown handling

## Monitoring and Maintenance

### Health Monitoring

1. **Automatic Health Checks**
   - Render checks `/health` endpoint every 30 seconds
   - Service marked unhealthy after 3 consecutive failures
   - Automatic restart on health check failure

2. **Manual Health Verification**

   ```bash
   # Health check
   curl -s https://your-service.onrender.com/health | jq
   
   # Status page
   open https://your-service.onrender.com/
   
   # Metrics
   curl -s https://your-service.onrender.com/metrics
   ```

### Log Access

1. **Via Render Dashboard**
   - Go to your service dashboard
   - Click "Logs" tab
   - Filter by log level or search terms

2. **Log Streaming**
   - Real-time log streaming in dashboard
   - Download logs for offline analysis
   - Set up log alerts for errors

### Performance Monitoring

1. **Built-in Metrics**
   - Response time monitoring
   - Memory usage tracking
   - Error rate monitoring
   - Uptime statistics

2. **Custom Metrics**

   ```bash
   # Memory usage
   curl -s https://your-service.onrender.com/metrics | grep memory
   
   # Uptime
   curl -s https://your-service.onrender.com/health | jq .uptime
   
   # Process status
   curl -s https://your-service.onrender.com/health | jq .mcp_process
   ```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptoms**: Deployment fails during build phase

**Solutions**:

```bash
# Check build logs in Render dashboard
# Common fixes:

# Node version mismatch
echo "engines": { "node": ">=18.0.0" } # in package.json

# Missing dependencies
npm audit fix
npm update

# TypeScript compilation errors
npm run lint
npm run build  # Test locally first
```

#### 2. Health Check Failures

**Symptoms**: Service marked as unhealthy, frequent restarts

**Solutions**:

```bash
# Check if health endpoint responds
curl https://your-service.onrender.com/health

# Common issues:
# - Port configuration (should be auto-assigned)
# - MCP server process not starting
# - Memory limits exceeded

# Debug locally
npm run build
npm run start:render
curl http://localhost:3000/health
```

#### 3. Memory Issues (Free Tier)

**Symptoms**: Service crashes, out of memory errors

**Solutions**:

```yaml
# Add to render.yaml
envVars:
  - key: NODE_OPTIONS
    value: --max-old-space-size=460
  - key: NODE_ENV
    value: production  # Enables production optimizations
```

#### 4. Service Sleep Issues

**Symptoms**: Service becomes unresponsive after inactivity

**Free Tier Behavior**:

- Services sleep after 15 minutes of inactivity
- First request after sleep takes 10-30 seconds to wake up
- This is normal behavior for free tier

**Mitigation**:

```bash
# Keep-alive ping (external service)
# Ping every 10 minutes during active hours
curl https://your-service.onrender.com/health

# Upgrade to paid plan for no-sleep behavior
```

#### 5. Auto-Deploy Issues

**Symptoms**: Changes not triggering deployments

**Solutions**:

```yaml
# Verify buildFilter paths in render.yaml
buildFilter:
  paths:
    - src/**           # Monitor source changes
    - package.json     # Monitor dependency changes
    - render.yaml      # Monitor config changes

# Manual deploy
# Use "Manual Deploy" button in Render dashboard
```

### Debug Commands

```bash
# Local testing
npm run build
npm run start:render

# Test health endpoint
curl -v http://localhost:3000/health

# Test with production environment
NODE_ENV=production npm run start:render

# Check process status
curl http://localhost:3000/health | jq .mcp_process

# Monitor memory usage
curl http://localhost:3000/metrics | grep memory

# Test MCP server directly
npm run start  # Original MCP server
npm run inspector  # MCP inspector
```

### Performance Optimization

1. **Response Time Optimization**

   ```javascript
   // Already implemented in render-server.ts
   // - Efficient HTTP routing
   // - Minimal middleware
   // - Process caching
   ```

2. **Memory Optimization**

   ```yaml
   # Environment optimizations
   envVars:
     - key: NODE_ENV
       value: production
     - key: NODE_OPTIONS
       value: --max-old-space-size=460
   ```

3. **Build Optimization**

   ```yaml
   # Selective builds
   buildFilter:
     ignoredPaths:
       - docs/**
       - examples/**
       - test/**
   ```

## Advanced Configuration

### Custom Domain Setup (Paid Plans)

1. **Upgrade to Paid Plan**
   - Required for custom domain support
   - Starter plan: $7/month minimum

2. **Add Custom Domain**

   ```yaml
   # Update render.yaml
   customDomains:
     - name: deno-mcp.yourdomain.com
       certificateId: auto
   ```

3. **DNS Configuration**

   ```
   Type: CNAME
   Name: deno-mcp
   Value: your-service-name.onrender.com
   TTL: 300
   ```

### Environment-Specific Configurations

1. **Staging Environment**

   ```yaml
   # render-staging.yaml
   services:
     - type: web
       name: deno-mcp-staging
       env: node
       plan: free
       branch: develop  # Different branch
       envVars:
         - key: NODE_ENV
           value: staging
         - key: LOG_LEVEL
           value: debug
   ```

2. **Production Environment**

   ```yaml
   # render-production.yaml
   services:
     - type: web
       name: deno-mcp-production
       env: node
       plan: starter  # Paid plan for better resources
       branch: main
       envVars:
         - key: NODE_ENV
           value: production
         - key: LOG_LEVEL
           value: warn
   ```

### Security Enhancements

1. **Environment Variables**

   ```yaml
   # Sensitive data via Render dashboard only
   # Never commit secrets to render.yaml
   envVars:
     - key: API_KEY
       sync: false  # Set via dashboard
   ```

2. **Network Security**

   ```yaml
   # Security headers (already configured)
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

## Deployment Checklist

### Pre-Deployment

- [ ] Code tested locally
- [ ] All tests passing
- [ ] Dependencies updated
- [ ] Environment variables configured
- [ ] render.yaml validated

### Deployment

- [ ] Repository connected to Render
- [ ] Service configured correctly
- [ ] Environment variables set
- [ ] Auto-deploy enabled
- [ ] Build completed successfully

### Post-Deployment

- [ ] Health checks passing
- [ ] Status page accessible
- [ ] Metrics endpoint working
- [ ] Logs monitoring set up
- [ ] Performance benchmarks met

### Production Ready

- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented
- [ ] Documentation updated

## Support and Resources

### Render Documentation

- [Render Web Services](https://render.com/docs/web-services)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Health Checks](https://render.com/docs/health-checks)
- [Custom Domains](https://render.com/docs/custom-domains)

### Project Resources

- [GitHub Repository](https://github.com/sudsarkar13/deno-mcp)
- [NPM Package](https://www.npmjs.com/package/@sudsarkar13/deno-mcp)
- [Docker Hub](https://hub.docker.com/r/sudsarkar13/deno-mcp)

### Community Support

- [GitHub Issues](https://github.com/sudsarkar13/deno-mcp/issues)
- [GitHub Discussions](https://github.com/sudsarkar13/deno-mcp/discussions)

This guide provides comprehensive coverage for deploying and maintaining the Deno MCP Server on Render. For additional support, please refer to the project documentation or create an issue in the GitHub repository.
