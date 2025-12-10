# Docker Examples for Deno MCP Server

This directory contains Docker configurations for running the Deno MCP server in containerized environments.

## Files Overview

- `Dockerfile` - Production-ready container
- `Dockerfile.dev` - Development container with additional tools
- `docker-compose.yml` - Multi-service configuration
- `README.md` - This documentation

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to the examples directory:**

```bash
git clone https://github.com/sudsarkar13/deno-mcp.git
cd deno-mcp/examples/docker-examples
```

2. **Create a workspace directory:**

```bash
mkdir workspace
cd workspace
# Add your Deno project files here
```

3. **Start the MCP server:**

```bash
docker-compose up -d deno-mcp
```

4. **View logs:**

```bash
docker-compose logs -f deno-mcp
```

### Using Docker directly

1. **Build the image:**

```bash
docker build -t deno-mcp:latest .
```

2. **Run the container:**

```bash
docker run -d \
  --name deno-mcp-server \
  -v $(pwd)/workspace:/workspace \
  -p 3000:3000 \
  deno-mcp:latest
```

## Development Setup

### Development Container

The development container includes additional tools for a complete development experience:

- Git
- Vim/Nano editors
- MCP Inspector
- TypeScript
- Nodemon

1. **Start development environment:**

```bash
docker-compose up -d deno-dev
```

2. **Access the development container:**

```bash
docker-compose exec deno-dev bash
```

3. **Inside the container, you can:**

```bash
# Initialize a new Deno project
deno init my-project
cd my-project

# Start the MCP server for inspection
deno-inspect /usr/local/bin/deno-mcp

# Run Deno commands
deno --version
deno fmt
deno lint
deno test
```

### VS Code Remote Development

The development container is configured for VS Code remote development:

1. **Install VS Code extensions:**
   - Remote-Containers
   - Deno extension

2. **Open in container:**
   - Open VS Code
   - Press `Ctrl+Shift+P`
   - Select "Remote-Containers: Reopen in Container"

3. **Configure VS Code settings in container:**

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": false,
  "deno.path": "/usr/local/bin/deno"
}
```

## Configuration Examples

### Environment Variables

Set these environment variables for customization:

```bash
# Docker run example
docker run -d \
  --name deno-mcp-server \
  -e DENO_DIR=/home/denouser/.deno \
  -e LOG_LEVEL=info \
  -v $(pwd)/workspace:/workspace \
  -p 3000:3000 \
  deno-mcp:latest
```

### Volume Mounts

Mount your project and persist Deno cache:

```bash
docker run -d \
  --name deno-mcp-server \
  -v $(pwd)/workspace:/workspace \
  -v deno-cache:/home/denouser/.deno \
  -p 3000:3000 \
  deno-mcp:latest
```

## MCP Client Configuration

### Claude Desktop

Configure Claude Desktop to use the containerized MCP server:

```json
{
  "mcpServers": {
    "deno-mcp": {
      "command": "docker",
      "args": [
        "exec",
        "deno-mcp-server",
        "deno-mcp"
      ],
      "env": {
        "DENO_DIR": "/home/denouser/.deno"
      }
    }
  }
}
```

### Alternative: Host Network Mode

For easier client configuration, use host network mode:

```bash
docker run -d \
  --name deno-mcp-server \
  --network host \
  -v $(pwd)/workspace:/workspace \
  deno-mcp:latest
```

Then configure clients normally:

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

## Troubleshooting

### Common Issues

1. **Permission denied errors:**

```bash
# Fix file permissions
sudo chown -R 1001:1001 workspace/
```

2. **Port already in use:**

```bash
# Change the port mapping
docker run -p 3001:3000 deno-mcp:latest
```

3. **Deno cache issues:**

```bash
# Clear the cache volume
docker volume rm docker-examples_deno-cache
```

### Debugging

1. **Access container shell:**

```bash
docker-compose exec deno-mcp sh
```

2. **View container logs:**

```bash
docker-compose logs deno-mcp
```

3. **Inspect container:**

```bash
docker inspect deno-mcp-server
```

### Performance Tuning

1. **Resource limits in docker-compose.yml:**

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

2. **Optimize Deno cache:**

```bash
# Pre-cache common modules
docker-compose exec deno-mcp deno cache https://deno.land/std/http/server.ts
```

## Security Considerations

1. **Non-root user:** Containers run as `denouser` (UID 1001)
2. **Limited permissions:** Only necessary permissions granted
3. **Isolated network:** Use custom Docker networks for isolation
4. **Read-only filesystem:** Consider making containers read-only where possible

### Production Security

```bash
# Run with read-only root filesystem
docker run -d \
  --name deno-mcp-server \
  --read-only \
  --tmpfs /tmp \
  -v $(pwd)/workspace:/workspace \
  deno-mcp:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Deno MCP Docker
on: [push, pull_request]

jobs:
  docker-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t deno-mcp:test ./examples/docker-examples
      
      - name: Test container
        run: |
          docker run -d --name test-container deno-mcp:test
          sleep 5
          docker exec test-container deno --version
          docker stop test-container
```

### GitLab CI Example

```yaml
test-docker:
  image: docker:latest
  services:
    - docker:dind
  script:
    - cd examples/docker-examples
    - docker build -t deno-mcp:test .
    - docker run --rm deno-mcp:test deno --version
```

## Advanced Usage

### Multi-stage Builds

For optimized production images:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
RUN curl -fsSL https://deno.land/install.sh | sh
RUN npm install -g @sudsarkar13/deno-mcp

# Production stage
FROM alpine:latest
RUN apk add --no-cache nodejs npm
COPY --from=builder /root/.deno/bin/deno /usr/local/bin/
COPY --from=builder /usr/local/lib/node_modules/@sudsarkar13 /usr/local/lib/node_modules/@sudsarkar13
CMD ["deno-mcp"]
```

### Health Checks

Add health checks to your containers:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD deno --version || exit 1
```

This Docker setup provides a robust, secure, and scalable way to deploy and develop with the Deno MCP server.
