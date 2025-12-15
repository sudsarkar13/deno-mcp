# Basic Usage Examples

This document provides practical examples of using the Deno MCP server with various AI assistants and development workflows.

## Prerequisites

1. Install the MCP server:

```bash
npm install -g @sudsarkar13/deno-mcp
```

2. Ensure Deno is installed on your system:

```bash
curl -fsSL https://deno.land/install.sh | sh
```

## Configuration Examples

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "deno-mcp": {
      "command": "deno-mcp",
      "args": [],
      "env": {
        "DENO_DIR": "/home/user/.deno",
        "PATH": "/home/user/.deno/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

### VS Code with Continue Extension

Add to your `config.json`:

```json
{
  "mcpServers": [
    {
      "name": "deno-mcp",
      "command": "deno-mcp",
      "args": []
    }
  ]
}
```

## Common Use Cases

### 1. Project Initialization and Setup

```markdown
User: "Create a new Deno web server project"

AI Assistant will use:

- deno_init: Initialize new project
- deno_add: Add dependencies like @std/http
- deno_fmt: Format the generated code
- deno_check: Type check the project
```

### 2. Development Workflow

```markdown
User: "Format my code, run tests, and check for linting issues"

AI Assistant will use:

- deno_fmt: Format all TypeScript files
- deno_test: Run the test suite
- deno_lint: Check for code quality issues
- deno_check: Verify TypeScript types
```

### 3. Performance Analysis

```markdown
User: "Benchmark my HTTP handler function"

AI Assistant will use:

- deno_bench: Run performance benchmarks
- deno_coverage: Generate test coverage reports
- deno_info: Analyze module dependencies
```

### 4. Deployment Preparation

```markdown
User: "Compile my application for production deployment"

AI Assistant will use:

- deno_compile: Create standalone executable
- deno_doc: Generate API documentation
- deno_test: Run final test suite
- deno_check: Verify all types
```

## Example Conversations

### Example 1: Creating a REST API

**User:** "Help me create a simple REST API with Deno that handles user registration"

**AI Response using MCP tools:**

1. **Initialize Project:**

```bash
deno_init --name user-api
```

2. **Add Dependencies:**

```bash
deno_add @std/http @std/crypto @std/encoding
```

3. **Create Main Server File:**
   The AI would create a server.ts file with proper imports and structure.

4. **Format and Check:**

```bash
deno_fmt
deno_check server.ts
```

5. **Run Development Server:**

```bash
deno_serve --port 8000 server.ts
```

### Example 2: Testing and Quality Assurance

**User:** "Run comprehensive tests and generate a coverage report"

**AI Response using MCP tools:**

1. **Run Tests:**

```bash
deno_test --coverage=coverage
```

2. **Generate Coverage Report:**

```bash
deno_coverage coverage --html
```

3. **Check Code Quality:**

```bash
deno_lint
deno_fmt --check
```

4. **Type Check:**

```bash
deno_check **/*.ts
```

### Example 3: Performance Optimization

**User:** "Help me optimize my Deno application performance"

**AI Response using MCP tools:**

1. **Analyze Dependencies:**

```bash
deno_info main.ts
```

2. **Run Benchmarks:**

```bash
deno_bench
```

3. **Check for Outdated Dependencies:**

```bash
deno_outdated
```

4. **Compile for Production:**

```bash
deno_compile --output dist/app main.ts
```

## Docker Deployment Examples

### Using Pre-built Docker Images

The Deno MCP Server is available as Docker images from multiple registries with ARM64 support:

#### Docker Hub

```bash
# Pull and run latest version
docker pull sudsarkar13/deno-mcp:1.0.6
docker run -d --name deno-mcp-server sudsarkar13/deno-mcp:1.0.6

# Platform-specific deployment (Apple Silicon)
docker pull sudsarkar13/deno-mcp:1.0.6 --platform linux/arm64
docker run -d --name deno-mcp-server --platform linux/arm64 sudsarkar13/deno-mcp:1.0.6
```

#### GitHub Container Registry (GHCR)

```bash
# Pull and run from GHCR
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6
docker run -d --name deno-mcp-server ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.6
```

#### Docker Compose Deployment

```yaml
# docker-compose.yml
version: "3.8"
services:
  deno-mcp:
    image: sudsarkar13/deno-mcp:1.0.6
    container_name: deno-mcp-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - deno-cache:/home/denouser/.deno
      - ./workspace:/workspace:ro
    environment:
      - NODE_ENV=production

volumes:
  deno-cache:
```

### Platform Compatibility

The Docker images support multiple architectures:

- **AMD64**: Intel/AMD 64-bit processors
- **ARM64**: Apple Silicon Macs (M1/M2/M3), ARM-based cloud instances
- **Automatic Detection**: Docker automatically selects the correct architecture

## Advanced Workflows

### Continuous Integration Example

The AI can help set up CI workflows using multiple MCP tools:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - name: Format check
        run: deno fmt --check
      - name: Lint
        run: deno lint
      - name: Type check
        run: deno check **/*.ts
      - name: Run tests
        run: deno test --coverage=coverage
      - name: Generate coverage
        run: deno coverage coverage
```

### Docker Development

The AI can help create Dockerized Deno applications:

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .
RUN deno cache main.ts
RUN deno compile --allow-net --allow-read --output app main.ts

EXPOSE 8000
CMD ["./app"]
```

## Troubleshooting

### Common Issues and Solutions

1. **Permission Errors:**
   - The AI will suggest appropriate permission flags
   - Example: `deno_run --allow-net --allow-read script.ts`

2. **Import Resolution:**
   - Use `deno_info` to analyze module resolution
   - Check for circular dependencies

3. **Performance Issues:**
   - Use `deno_bench` to identify bottlenecks
   - Analyze bundle size with `deno_info`

4. **Type Errors:**
   - Use `deno_check` for detailed type information
   - Generate type definitions with `deno_types`

## Best Practices

1. **Always format code before committing:**

   ```bash
   deno_fmt
   ```

2. **Run comprehensive checks:**

   ```bash
   deno_check && deno_lint && deno_test
   ```

3. **Keep dependencies up to date:**

   ```bash
   deno_outdated
   ```

4. **Use proper permissions:**
   - Only grant necessary permissions
   - Be specific with file/network access

5. **Document your APIs:**

   ```bash
   deno_doc --html --name="My API" main.ts
   ```

This MCP server makes Deno development more accessible and efficient by providing AI assistants with comprehensive tooling capabilities.
