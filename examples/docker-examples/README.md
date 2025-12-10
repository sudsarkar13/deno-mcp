# Docker Examples for Deno MCP Server

This directory contains Docker configurations and examples for running and testing the Deno MCP Server in containerized environments.

## 📁 File Structure

```
docker-examples/
├── Dockerfile                    # Production Docker image
├── Dockerfile.dev                # Development Docker image
├── Dockerfile.test               # Basic testing Docker image
├── Dockerfile.enhanced-test      # Comprehensive testing Docker image
├── docker-test-runner.sh         # Enhanced test runner script
├── docker-compose.yml            # Docker Compose configuration
└── README.md                     # This documentation
```

## 🐳 Docker Configurations

### 1. Production Image (`Dockerfile`)

- **Purpose**: Optimized for production deployment
- **Features**: Minimal size, security-hardened, non-root user
- **Usage**: `docker build -f Dockerfile -t deno-mcp:prod .`

### 2. Development Image (`Dockerfile.dev`)

- **Purpose**: Development and debugging
- **Features**: Includes dev tools, volume mounts, hot reload
- **Usage**: `docker build -f Dockerfile.dev -t deno-mcp:dev .`

### 3. Basic Test Image (`Dockerfile.test`)

- **Purpose**: Basic CI/CD testing
- **Features**: Lightweight testing environment
- **Usage**: `docker build -f Dockerfile.test -t deno-mcp:test .`

### 4. Enhanced Test Image (`Dockerfile.enhanced-test`)

- **Purpose**: Comprehensive testing and validation
- **Features**: Full test suite, monitoring tools, detailed reporting
- **Usage**: `docker build -f Dockerfile.enhanced-test -t deno-mcp:enhanced-test .`

## 🧪 Enhanced Testing Capabilities

The enhanced test configuration provides comprehensive validation of the MCP server in a containerized environment.

### Test Categories

#### 1. System Dependencies

- ✅ Node.js installation and version
- ✅ Deno installation and version
- ✅ NPM availability and version

#### 2. File System Structure

- ✅ Build output availability
- ✅ Test directory presence
- ✅ Package configuration validation

#### 3. Security and Permissions

- ✅ Non-root user execution
- ✅ File permissions verification
- ✅ Security best practices compliance

#### 4. MCP Server Functionality

- ✅ Server startup and version check
- ✅ Graceful shutdown handling
- ✅ Process lifecycle management

#### 5. Test Suite Execution

- ✅ Node.js test suite execution
- ✅ Cross-platform compatibility
- ✅ Error handling and reporting

#### 6. Environment Configuration

- ✅ Environment variables validation
- ✅ Deno environment setup
- ✅ Node.js environment configuration

#### 7. Resource Monitoring

- ✅ Memory usage tracking
- ✅ CPU utilization monitoring
- ✅ Disk usage analysis

#### 8. Network Connectivity

- ✅ External network access validation
- ✅ DNS resolution testing

#### 9. Container Health

- ✅ Health check validation
- ✅ Container lifecycle verification

### Test Results

The enhanced test runner generates detailed JSON reports with:

- Individual test results with timestamps
- Pass/fail status for each test
- Detailed error messages for failures
- Overall success rate calculation
- Environment metadata

Example test results structure:

```json
{
  "tests": [
    {
      "name": "Node.js Installation",
      "status": "PASS",
      "message": "Node.js version: v20.x.x",
      "timestamp": "2024-12-11T01:30:00Z"
    }
  ],
  "summary": {
    "tests_passed": 12,
    "tests_failed": 0,
    "total_tests": 12,
    "success_rate": 100,
    "timestamp": "2024-12-11T01:35:00Z",
    "environment": "docker-container"
  }
}
```

## 🚀 Usage Examples

### Basic Testing

```bash
# Build and run basic test
docker build -f Dockerfile.test -t deno-mcp:test .
docker run --rm deno-mcp:test
```

### Enhanced Testing

```bash
# Build enhanced test image
docker build -f Dockerfile.enhanced-test -t deno-mcp:enhanced-test .

# Run comprehensive test suite
docker run --rm -v $(pwd)/test-results:/test-results deno-mcp:enhanced-test

# View test results
cat test-results/docker-test-results.json | jq '.summary'
```

### Development Environment

```bash
# Build development image
docker build -f Dockerfile.dev -t deno-mcp:dev .

# Run with volume mounts for development
docker run -it --rm -v $(pwd):/workspace deno-mcp:dev bash
```

### Production Deployment

```bash
# Build production image
docker build -f Dockerfile -t deno-mcp:prod .

# Run production container
docker run -d --name mcp-server deno-mcp:prod
```

## 🔧 CI/CD Integration

The Docker configurations are integrated into the GitHub Actions CI/CD pipeline:

### Matrix Testing

- **Basic Test**: Quick validation of core functionality
- **Enhanced Test**: Comprehensive test suite with detailed reporting

### Automated Workflows

1. **Build Phase**: Creates Docker images for testing
2. **Test Phase**: Runs both basic and enhanced test suites
3. **Validation Phase**: Analyzes test results and reports failures
4. **Artifact Phase**: Uploads test results for review

### Test Result Processing

- Automatic extraction of test results from containers
- JSON-formatted reports for easy parsing
- Integration with GitHub Actions summary reports
- Failure detection and pipeline blocking

## 🛠 Customization

### Environment Variables

```bash
# Customize test behavior
docker run --rm \
  -e NODE_ENV=test \
  -e DENO_DIR=/custom/deno \
  -e TEST_TIMEOUT=30000 \
  deno-mcp:enhanced-test
```

### Volume Mounts

```bash
# Mount custom test configurations
docker run --rm \
  -v $(pwd)/custom-tests:/app/test \
  -v $(pwd)/test-results:/test-results \
  deno-mcp:enhanced-test
```

### Network Configuration

```bash
# Run with custom network settings
docker run --rm \
  --network=custom-network \
  --dns=8.8.8.8 \
  deno-mcp:enhanced-test
```

## 📊 Monitoring and Debugging

### Health Checks

All Docker images include health check configurations:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node /app/build/index.js --version || exit 1
```

### Logging

- Structured logging with timestamps
- Color-coded output for easy reading
- JSON-formatted results for automation
- Detailed error messages and stack traces

### Resource Monitoring

The enhanced test suite includes resource monitoring:

- Memory usage tracking
- CPU utilization analysis
- Disk space monitoring
- Network connectivity validation

## 🔒 Security Considerations

### Non-root Execution

All containers run as non-root users:

```dockerfile
RUN addgroup -g 1001 -S denouser && adduser -S denouser -u 1001
USER denouser
```

### Minimal Attack Surface

- Alpine Linux base for smaller image size
- Only necessary packages installed
- Security scanning integrated into CI/CD

### Permission Management

- Proper file permissions set during build
- Workspace directories owned by application user
- Sensitive files protected with appropriate permissions

## 🚨 Troubleshooting

### Common Issues

#### Test Failures

```bash
# Check test logs
docker run --rm deno-mcp:enhanced-test 2>&1 | tee test-logs.txt

# Debug specific test failures
docker run --rm -it deno-mcp:enhanced-test bash
```

#### Permission Issues

```bash
# Fix file permissions
chmod +x examples/docker-examples/docker-test-runner.sh

# Verify container user
docker run --rm deno-mcp:enhanced-test whoami
```

#### Network Issues

```bash
# Test network connectivity
docker run --rm deno-mcp:enhanced-test ping -c 1 google.com

# Check DNS resolution
docker run --rm deno-mcp:enhanced-test nslookup google.com
```

### Debug Mode

```bash
# Run with debug output
docker run --rm -e DEBUG=1 deno-mcp:enhanced-test

# Interactive debugging
docker run --rm -it deno-mcp:enhanced-test bash
```

## 📈 Performance Optimization

### Build Optimization

- Multi-stage builds for smaller images
- Layer caching for faster builds
- Dependency caching strategies

### Runtime Optimization

- Resource limits and requests
- Health check intervals
- Startup probes for faster deployment

### Test Optimization

- Parallel test execution
- Smart test selection
- Result caching

## 🔄 Maintenance

### Regular Updates

- Base image updates for security patches
- Dependency updates for latest features
- Test suite enhancements for better coverage

### Monitoring

- Container performance metrics
- Test result trends
- Failure pattern analysis

---

For more information about the Deno MCP Server project, see the main [README.md](../../README.md) file.
