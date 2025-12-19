[![CI/CD Pipeline](https://github.com/sudsarkar13/deno-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/sudsarkar13/deno-mcp/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm version](https://img.shields.io/npm/v/@sudsarkar13/deno-mcp.svg)](https://www.npmjs.com/package/@sudsarkar13/deno-mcp)

# Deno MCP Tools

A comprehensive MCP (Model Context Protocol) server that provides secure access to the complete Deno CLI toolchain. This server enables AI assistants and compatible clients to interact with Deno's development tools through a standardized protocol.

## 🚨 Important Notice for Contributors & Maintainers

**NPM Authentication Update (December 2025)**: npm has permanently revoked all classic tokens. If you're experiencing CI/CD publishing failures, please follow the **[NPM Migration Guide](.github/NPM_MIGRATION_GUIDE.md)** immediately.

For comprehensive release procedures, see the **[Release Guide](.github/RELEASE_GUIDE.md)**.

## Features

### 🚀 Execution Tools

- **`deno_run`** - Execute Deno scripts with custom permissions and options
- **`deno_serve`** - Start HTTP servers with Deno
- **`deno_task`** - Run tasks defined in deno.json
- **`deno_repl`** - Start interactive Deno REPL sessions
- **`deno_eval`** - Evaluate TypeScript/JavaScript code directly

### 🛠️ Development Tools

- **`deno_fmt`** - Format code according to Deno standards
- **`deno_lint`** - Lint code for potential issues and style violations
- **`deno_check`** - Type check code without execution
- **`deno_test`** - Run tests with coverage and reporting options
- **`deno_bench`** - Run performance benchmarks
- **`deno_coverage`** - Generate test coverage reports

### 📦 Dependency Management

- **`deno_add`** - Add dependencies to deno.json
- **`deno_remove`** - Remove dependencies from deno.json
- **`deno_install`** - Install scripts globally or locally
- **`deno_uninstall`** - Uninstall globally installed scripts
- **`deno_outdated`** - Check for outdated dependencies
- **`deno_init`** - Initialize new Deno projects

### 🔧 Compilation Tools

- **`deno_compile`** - Compile scripts to standalone executables
- **`deno_doc`** - Generate documentation for modules
- **`deno_info`** - Get information about modules and dependencies
- **`deno_types`** - Generate TypeScript type definitions

### ⚙️ Utility Tools

- **`deno_upgrade`** - Upgrade Deno to latest or specific version
- **`deno_version`** - Check Deno installation status and version
- **`deno_completions`** - Generate shell completions

## Installation

### NPM Package Installation

```bash
npm install -g @sudsarkar13/deno-mcp
```

### Manual Installation

1. Clone or download this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

## Configuration

### MCP Settings Configuration

Add the server to your MCP settings file:

**For Cline/Claude Dev Extension** (`~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
 "mcpServers": {
  "deno-tools": {
   "command": "node",
   "args": ["/path/to/deno-mcp-tools/build/index.js"]
  }
 }
}
```

**For Claude Desktop App** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
 "mcpServers": {
  "deno-tools": {
   "command": "node",
   "args": ["/path/to/deno-mcp-tools/build/index.js"]
  }
 }
}
```

**Using NPM Global Installation**:

```json
{
 "mcpServers": {
  "deno-tools": {
   "command": "deno-mcp-tools"
  }
 }
}
```

## Usage Examples

### Running a Deno Script

```json
{
 "tool": "deno_run",
 "arguments": {
  "script": "main.ts",
  "permissions": ["--allow-net", "--allow-read"],
  "args": ["--port", "8000"]
 }
}
```

### Formatting Code

```json
{
 "tool": "deno_fmt",
 "arguments": {
  "files": ["src/"],
  "check": false
 }
}
```

### Running Tests with Coverage

```json
{
 "tool": "deno_test",
 "arguments": {
  "coverage": true,
  "parallel": true,
  "permissions": ["--allow-read", "--allow-write"]
 }
}
```

### Adding Dependencies

```json
{
 "tool": "deno_add",
 "arguments": {
  "packages": ["@std/http", "@std/path"]
 }
}
```

### Compiling to Executable

```json
{
 "tool": "deno_compile",
 "arguments": {
  "script": "cli.ts",
  "output": "my-tool",
  "permissions": ["--allow-read", "--allow-write"]
 }
}
```

## Tool Reference

### Permission Management

All execution tools support Deno's permission model. You can specify permissions in several ways:

- **Full flags**: `["--allow-read=/path", "--allow-net=localhost:8000"]`
- **Shorthand**: `["read", "net", "write"]`
- **Allow all**: `["all"]`

### Working Directory

Most tools accept a `workingDirectory` parameter to specify where the command should be executed:

```json
{
 "workingDirectory": "/path/to/project"
}
```

### Environment Variables

Set environment variables for command execution:

```json
{
 "envVars": {
  "DENO_ENV": "development",
  "API_KEY": "your-api-key"
 }
}
```

## Security Features

- **Permission Sandboxing**: Leverages Deno's built-in permission system
- **Input Validation**: All parameters are validated against schemas
- **Error Isolation**: Errors are contained and properly reported
- **Resource Management**: Proper cleanup of processes and resources

## Development

### Prerequisites

- Node.js 18+
- Deno 1.40+
- TypeScript 5.3+

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd deno-mcp-tools

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run watch
```

### Testing

```bash
# Type check
npm run lint

# Test the built server
npm run inspector
```

## Troubleshooting

### Deno Not Found

If you get a "Deno not found" error:

1. Install Deno: <https://deno.land/manual/getting_started/installation>
2. Ensure Deno is in your PATH
3. Use the `deno_version` tool to verify installation

### Permission Errors

Common permission issues and solutions:

- **File access**: Add `--allow-read` and/or `--allow-write`
- **Network access**: Add `--allow-net`
- **Environment variables**: Add `--allow-env`
- **Subprocess execution**: Add `--allow-run`

### Build Path Issues

If you encounter "not connected" errors:

1. Verify the build path in your MCP configuration
2. Check if files are in `build/` or `dist/` directory
3. Ensure the path is absolute in your configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the docs/ directory for detailed guides
- **Community**: Join discussions in GitHub Discussions

## Live Service

The Deno MCP Server is deployed and available as a live web service:

### Service URLs

- **Custom Domain**: <https://deno.mcp.sudeeptasarkar.in/>
- **Primary Service**: <https://deno-mcp.onrender.com/>
- **Health Check**: <https://deno.mcp.sudeeptasarkar.in/health>
- **Status Page**: <https://deno.mcp.sudeeptasarkar.in/status>
- **MCP HTTP Endpoint**: <https://deno.mcp.sudeeptasarkar.in/mcp> (POST)

### Service Features

- **HTTP API Endpoints**: RESTful endpoints for service monitoring and status
- **MCP over HTTP**: Full MCP protocol support via HTTP with Server-Sent Events streaming
- **Health Monitoring**: Comprehensive health checks and system diagnostics
- **Status Dashboard**: Real-time service metrics and MCP server information
- **Production Ready**: Fully deployed and operational on Render.com platform
- **CORS Enabled**: Cross-origin requests supported for web integration

### HTTP MCP Usage

The live service supports the complete MCP protocol over HTTP. See the [MCP HTTP Endpoint Documentation](docs/MCP_HTTP_ENDPOINT.md) for detailed usage examples and integration guides.

**Quick Example:**
```bash
# List available tools via HTTP
curl -X POST https://deno.mcp.sudeeptasarkar.in/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'

# Execute a tool via HTTP
curl -X POST https://deno.mcp.sudeeptasarkar.in/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "deno_version",
      "arguments": {}
    },
    "id": 2
  }'
```

## Docker Images

The Deno MCP Server is available as Docker images from multiple registries:

### Docker Hub

```bash
# Latest version
docker pull sudsarkar13/deno-mcp:latest
docker pull sudsarkar13/deno-mcp:1.0.9

# Multi-platform support (AMD64 + ARM64)
docker pull sudsarkar13/deno-mcp:1.0.9 --platform linux/amd64
docker pull sudsarkar13/deno-mcp:1.0.9 --platform linux/arm64
```

### GitHub Container Registry (GHCR)

```bash
# Latest version
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:latest
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.9

# Multi-platform support
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.9 --platform linux/amd64
docker pull ghcr.io/sudsarkar13/deno-mcp/deno-mcp:1.0.9 --platform linux/arm64
```

### Platform Support

- **AMD64**: Intel/AMD 64-bit processors
- **ARM64**: Apple Silicon (M1/M2/M3), ARM-based cloud instances
- **Cross-platform**: Automatic platform detection and optimization

## Changelog

### v1.0.9 - 2025-12-20

#### Added

- **Custom Domain Support**: Deployed MCP server now accessible at https://deno.mcp.sudeeptasarkar.in/
- **Enhanced Deployment Infrastructure**: Improved Render.com integration with custom domain routing and SSL/TLS security

#### Fixed

- **Build System Improvements**: Resolved TypeScript compilation issues with multiple entry points and enhanced render-server.ts compatibility
- **Production Deployment**: Fixed service initialization and module loading issues in production environment

#### Changed

- **Service Architecture**: Enhanced dual-mode support for both stdio-based MCP communication and HTTP web access
- **Documentation Updates**: Updated all documentation to reference the new custom domain

### v1.0.7 - 2025-12-16

### v1.0.6 - 2025-12-13

#### Changed

- **Comprehensive Documentation Update**: Updated all project documentation to reflect current state and recent improvements
- **Docker Registry Support**: Enhanced documentation with dual registry support (Docker Hub + GitHub Container Registry)
- **Multi-platform Documentation**: Added comprehensive ARM64 and Apple Silicon compatibility information across all docs
- **Enhanced Examples**: Improved Docker deployment examples and usage patterns throughout documentation
- **Cross-platform Guidance**: Enhanced documentation for ARM64, Apple Silicon, and multi-platform deployment scenarios

### v1.0.5 - 2025-12-13

#### Fixed

- **GitHub Container Registry Publishing**: Fixed GHCR publishing permissions and image path configuration
- **Dual Registry Publishing**: Ensured both Docker Hub and GHCR publishing work correctly
- **Multi-platform Support**: Validated ARM64 and AMD64 images publish to both registries

### v1.0.4 - 2025-12-13

#### Fixed

- **ARM64 Compatibility**: Switched Docker base image from Alpine to Ubuntu for better ARM64 support
- **Apple Silicon Support**: Full compatibility with Apple Silicon Macs (M1/M2/M3 chips)
- **Cross-platform Docker**: Enhanced multi-platform Docker builds and deployment

### v1.0.3 - 2025-12-13

#### Fixed

- **Docker Enhanced Tests**: Added TypeScript build integration to Docker test suite
- **Deno Runtime**: Updated from v1.47.2 to v2.6.0 for better compatibility
- **CI/CD Pipeline**: Improved workflow dependencies and release automation

### v1.0.2 - 2025-12-13

#### Fixed

- **Cross-platform Support**: Initial ARM64 Docker build improvements
- **CI/CD Reliability**: Enhanced pipeline job dependencies and execution order

### v1.0.1 - 2025-12-12

#### Changed

- **CI/CD Pipeline**: Restructured release workflow for better reliability
- **GitHub Releases**: Improved release creation and dependency management

### v1.0.0 - 2025-12-09

#### Added

- Initial release
- Complete Deno CLI toolchain coverage
- Comprehensive error handling
- Security-focused permission management
- Cross-platform compatibility

---

**Built with ❤️ for the Deno community**

# Trigger deployment - Tuesday 16 December 2025 01:34:22 PM IST
