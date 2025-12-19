# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9] - 2025-12-20

### Added

- **Version Update**: Updated all version references from 1.0.6 and 1.0.7 to 1.0.9 across the entire project
- **Comprehensive Version Synchronization**: Ensured consistency across package.json, source files, documentation, and Docker configurations

### Changed

- **Documentation Updates**: Updated all Docker image tags and version references throughout documentation
- **Build System**: Updated fallback version strings in source code to match new version

## [1.0.7] - 2025-12-16

### Added

#### Custom Domain Support

- **Production Domain**: Deployed MCP server now accessible at https://deno.mcp.sudeeptasarkar.in/
- **Custom DNS Configuration**: Configured custom domain routing for enhanced accessibility and branding
- **SSL/TLS Security**: Automatic HTTPS certificate provisioning and renewal for secure connections
- **Domain Verification**: Implemented proper domain verification and health checks

#### Deployment Infrastructure

- **Render.com Integration**: Enhanced deployment configuration for stable production hosting
- **Service Reliability**: Improved service uptime and reliability through optimized deployment settings
- **Health Monitoring**: Added comprehensive health check endpoints for service monitoring
- **Custom URL Routing**: Configured proper URL routing and request handling for web accessibility

### Fixed

#### Build System Improvements

- **TypeScript Compilation**: Resolved TypeScript compilation issues with multiple entry points
- **Render Server Integration**: Fixed render-server.ts compilation and deployment compatibility
- **Build Configuration**: Enhanced tsconfig.json to properly handle dual-mode architecture (stdio + HTTP)
- **Entry Point Resolution**: Improved module resolution for both MCP server and web service modes

#### Production Deployment

- **Service Startup**: Fixed service initialization issues in production environment
- **Module Loading**: Resolved module path resolution for compiled JavaScript output
- **HTTP Wrapper**: Enhanced HTTP service wrapper for web-compatible MCP server access
- **Error Handling**: Improved error handling and logging for production deployment scenarios

### Changed

#### Service Architecture

- **Dual-Mode Support**: Enhanced architecture to support both stdio-based MCP communication and HTTP web access
- **Production Readiness**: Improved production deployment configuration and service management
- **Custom Domain Integration**: Updated service configuration to properly handle custom domain requests
- **Performance Optimization**: Enhanced service performance and response times for web access

#### Documentation Updates

- **Custom Domain Documentation**: Updated all relevant documentation to reference the new custom domain
- **Deployment Guides**: Enhanced deployment documentation with custom domain configuration details
- **Service URLs**: Updated service references throughout documentation to use https://deno.mcp.sudeeptasarkar.in/

### Technical Details

- **HTTP Service Layer**: Maintained compatibility between stdio MCP protocol and HTTP web access
- **Domain Configuration**: Proper DNS configuration and SSL certificate management
- **Service Deployment**: Enhanced Render.com deployment configuration for custom domain support
- **Build System**: Preserved technical fixes for TypeScript compilation while adding new functionality

## [1.0.6] - 2025-12-13

### Changed

#### Documentation Enhancements

- **Comprehensive Documentation Update**: Updated all project documentation to reflect current state and recent improvements
- **Docker Registry Support**: Enhanced documentation with dual registry support (Docker Hub + GitHub Container Registry)
- **Multi-platform Documentation**: Added comprehensive ARM64 and Apple Silicon compatibility information across all docs
- **Enhanced Examples**: Improved Docker deployment examples and usage patterns throughout documentation

#### Updated Documentation Files

- **README.md**: Added Docker Images section with both registries, updated changelog, enhanced multi-platform support details
- **docs/HOSTING.md**: Updated with GHCR registry support, ARM64 deployment instructions, enhanced container deployment examples
- **examples/docker-examples/README.md**: Enhanced with dual registry support, comprehensive platform compatibility details
- **examples/basic-usage.md**: Added Docker deployment examples section with multi-registry usage and cross-platform guidance
- **PROJECT_GUIDELINES.md**: Updated release checklist, added Enhanced CI/CD Pipeline section, improved development workflow documentation

#### Improved User Experience

- **Cross-platform Guidance**: Enhanced documentation for ARM64, Apple Silicon, and multi-platform deployment scenarios
- **Registry Flexibility**: Provided users with choice between Docker Hub and GitHub Container Registry
- **Deployment Examples**: Added comprehensive Docker Compose and container deployment examples
- **Development Workflow**: Updated development guidelines to reflect current CI/CD capabilities and best practices

### Technical Details

- **Documentation Synchronization**: All documentation now reflects version 1.0.5+ capabilities
- **Registry Integration**: Complete documentation coverage for both Docker Hub and GHCR publishing
- **Platform Support**: Comprehensive ARM64 and Apple Silicon documentation across all relevant files
- **CI/CD Documentation**: Enhanced documentation of current pipeline capabilities and multi-platform support

## [1.0.5] - 2025-12-13

### Fixed

#### GitHub Container Registry Publishing

- **GHCR Permissions**: Fixed GitHub Container Registry (GHCR) publishing permissions by adding proper job permissions (`contents: read`, `packages: write`, `id-token: write`) to the Docker publishing workflow
- **Image Path Configuration**: Corrected GHCR image path from `${{ github.repository_owner }}` to `${{ github.repository }}` for proper repository-based naming
- **Dual Registry Publishing**: Ensured both Docker Hub and GitHub Container Registry publishing work correctly in parallel
- **Multi-platform Support**: Validated that both AMD64 and ARM64 images are published to both registries successfully

#### CI/CD Pipeline Improvements

- **Registry Authentication**: Improved authentication handling for GitHub Container Registry publishing
- **Error Handling**: Enhanced error reporting for Docker registry publishing failures
- **Workflow Reliability**: Strengthened Docker publishing workflow to handle multiple registry targets

### Technical Details

- **Job Permissions**: Added explicit permissions for package publishing and token access
- **Registry Configuration**: Updated metadata extraction to support dual registry publishing
- **Platform Support**: Confirmed multi-platform builds work across both Docker Hub and GHCR

## [1.0.4] - 2025-12-13

### Fixed

#### ARM64 Architecture Compatibility

- **Docker Base Image**: Switched from `node:20-alpine` to `node:20-slim` (Ubuntu-based) to resolve ARM64 compatibility issues
- **Package Management**: Updated from Alpine's `apk` to Debian's `apt-get` for better ARM64 package availability
- **User Management**: Changed user creation from Alpine syntax (`adduser`) to Debian syntax (`groupadd` + `useradd`) for cross-platform compatibility
- **QEMU Emulation**: Resolved ARM64 emulation issues that were causing build failures with Alpine/busybox triggers

#### Multi-platform Docker Support

- **Architecture Detection**: Improved cross-platform architecture detection for Deno binary downloads
- **Build Process**: Enhanced Docker build process to handle both AMD64 and ARM64 architectures reliably
- **Container Optimization**: Added proper cleanup commands for Debian-based images (`apt-get clean`, `rm -rf /var/lib/apt/lists/*`)

#### Platform-specific Improvements

- **Apple Silicon Support**: Full compatibility with Apple Silicon Macs (M1/M2/M3 chips)
- **ARM Cloud Instances**: Support for ARM-based cloud computing instances
- **Cross-compilation**: Improved cross-platform binary handling and installation

### Technical Details

- **Base Image Change**: Migration from Alpine Linux to Ubuntu/Debian for better ARM64 ecosystem support
- **Package Dependencies**: Updated package installation commands for Debian package manager
- **Security**: Maintained non-root user execution with proper permission handling
- **Performance**: Optimized layer caching and build performance across architectures

## [1.0.3] - 2025-12-13

### Fixed

#### Docker Enhanced Test Suite

- **Build Integration**: Added TypeScript compilation step to Docker enhanced test configuration
- **Test Reliability**: Improved Docker test runner with proper build artifact handling
- **External Connectivity**: Enhanced handling of external network connectivity tests in containerized environments
- **Permission Management**: Fixed executable permissions for built TypeScript output in Docker containers

#### Deno Runtime Compatibility

- **Version Update**: Updated Deno runtime from v1.47.2 to v2.6.0 to resolve download URL and compatibility issues
- **Cross-platform Installation**: Improved Deno binary installation process for multi-architecture support
- **Runtime Detection**: Enhanced Deno version detection and validation in CI/CD environments

#### CI/CD Pipeline Stability

- **Workflow Dependencies**: Fixed job dependencies in GitHub Actions workflow to ensure proper execution order
- **Release Pipeline**: Resolved issues with skipped release and publishing steps
- **Artifact Management**: Improved build artifact lifecycle management across workflow jobs
- **Error Handling**: Enhanced error reporting and recovery in automated testing and deployment

### Changed

#### Development Workflow

- **Test Suite**: Improved Docker-based testing with source code compilation
- **Build Process**: Streamlined TypeScript build integration in containerized environments
- **Quality Gates**: Enhanced CI/CD quality checks and validation steps

### Technical Details

- **Dockerfile Updates**: Modified enhanced test Dockerfile to include proper build steps
- **Version Management**: Synchronized Deno version across all Docker configurations
- **Pipeline Optimization**: Improved workflow execution reliability and error handling

## [1.0.2] - 2025-12-13

### Fixed

#### Cross-platform Docker Support

- **ARM64 Compatibility**: Initial attempt to resolve ARM64 Docker build issues with cross-platform Deno installation
- **Architecture Detection**: Improved platform detection for Deno binary downloads
- **Build Process**: Enhanced Docker build process for multi-architecture support

#### CI/CD Improvements

- **Docker Job Dependencies**: Added proper job dependencies for Docker publishing in release workflow
- **Pipeline Reliability**: Improved overall CI/CD pipeline stability and execution order

### Technical Details

- **Platform Support**: Early work on cross-platform compatibility improvements
- **Workflow Configuration**: Enhanced GitHub Actions workflow job orchestration

## [1.0.1] - 2025-12-12

### Changed

#### CI/CD Pipeline Improvements

- **GitHub Release First**: Restructured CI/CD pipeline to create GitHub releases before NPM publishing
- **Improved Release Flow**: GitHub release creation now happens immediately after successful build and tests
- **NPM Publishing**: NPM publish now depends on successful GitHub release creation
- **Docker Publishing**: Docker image publishing also depends on GitHub release creation
- **Better Dependency Management**: Updated job dependencies for more reliable release process

#### Workflow Enhancements

- **Release Order**: Fixed release workflow to follow proper sequence: Tests → GitHub Release → NPM Publish → Docker Publish
- **Error Prevention**: Prevents NPM publishing if GitHub release creation fails
- **Consistency**: Ensures all releases are properly documented on GitHub before distribution
- **Reliability**: Improved overall release pipeline reliability and error handling

### Technical Details

- **Job Dependencies**: Updated CI/CD job dependencies to enforce correct execution order
- **Release Validation**: Added validation to ensure GitHub releases are created successfully
- **Pipeline Optimization**: Streamlined release process for better maintainability

## [1.0.0] - 2025-12-09

### Added

#### Core Features

- **Complete Deno CLI Integration**: Comprehensive MCP server providing access to all Deno CLI tools
- **25 Deno Tools**: Full coverage of Deno's command-line interface through MCP protocol
- **TypeScript Support**: Strict typing throughout the codebase with comprehensive type definitions
- **Permission Management**: Secure permission handling following Deno's security model
- **Error Handling**: Robust error handling with custom error classes for different failure scenarios

#### Tool Categories

- **Execution Tools**: `deno_run`, `deno_serve`, `deno_task`, `deno_repl`, `deno_eval`
- **Development Tools**: `deno_fmt`, `deno_lint`, `deno_check`, `deno_test`, `deno_bench`, `deno_coverage`
- **Dependency Management**: `deno_add`, `deno_remove`, `deno_install`, `deno_uninstall`, `deno_outdated`, `deno_init`
- **Compilation Tools**: `deno_compile`, `deno_doc`, `deno_info`, `deno_types`
- **Utility Tools**: `deno_upgrade`, `deno_version`, `deno_completions`

#### Documentation & Examples

- **Comprehensive API Documentation**: Complete reference for all 25 tools with input schemas and examples
- **Usage Examples**: Practical examples for common development workflows
- **Docker Support**: Production and development Docker configurations with Docker Compose
- **Project Guidelines**: Detailed contribution and development guidelines
- **Basic Usage Guide**: Step-by-step instructions for getting started

#### Infrastructure

- **NPM Package**: Published as `@sudsarkar13/deno-mcp` with public access
- **Build System**: TypeScript compilation with automated build scripts
- **CLI Integration**: Global installation support with `deno-mcp` command
- **MCP Inspector**: Built-in support for MCP protocol inspection and debugging

#### Security & Quality

- **Permission-based Security**: Leverages Deno's built-in permission system
- **Input Validation**: Comprehensive validation of all tool inputs
- **Error Recovery**: Graceful handling of command failures and system errors
- **Cross-platform Support**: Works on Windows, macOS, and Linux

#### Developer Experience

- **VS Code Integration**: Ready for use with Continue extension and other MCP clients
- **Claude Desktop Support**: Native integration with Claude Desktop application
- **Development Tools**: Hot reload, watch mode, and debugging support
- **Container Support**: Docker configurations for isolated development environments

### Technical Details

#### Architecture

- **Modular Design**: Tools organized by category for maintainability
- **Event-driven**: Asynchronous command execution with proper cleanup
- **Extensible**: Easy to add new tools following established patterns
- **Testable**: Comprehensive error handling and validation

#### Dependencies

- **@modelcontextprotocol/sdk**: ^0.6.0 (MCP protocol implementation)
- **Node.js**: >=18.0.0 (Runtime requirement)
- **TypeScript**: ^5.3.3 (Development dependency)

#### Performance

- **Fast Startup**: Minimal initialization overhead
- **Efficient Execution**: Direct subprocess spawning without shell overhead
- **Memory Management**: Proper cleanup of resources and processes
- **Caching**: Leverages Deno's built-in module caching

### Installation

```bash
npm install -g @sudsarkar13/deno-mcp
```

### Usage

```bash
# Start MCP server
deno-mcp

# Use with MCP inspector
npx @modelcontextprotocol/inspector deno-mcp
```

### Configuration

#### Claude Desktop

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

#### VS Code Continue

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

### Project Structure

```dir
deno-mcp-tools/
├── src/                    # Source code
│   ├── tools/             # Tool implementations
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main server
├── build/                 # Compiled JavaScript
├── docs/                  # Documentation
├── examples/              # Usage examples and Docker configs
├── package.json           # NPM configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # Project overview
├── LICENSE                # MIT License
└── PROJECT_GUIDELINES.md  # Development guidelines
```

### Supported Platforms

- **Node.js**: 18.0.0 or higher
- **Operating Systems**: Windows, macOS, Linux
- **Deno**: Any version (detected automatically)
- **MCP Clients**: Claude Desktop, VS Code Continue, custom implementations

### License

MIT License - see [LICENSE](LICENSE) file for details.

### Author

**Sudeepta Sarkar**

- Email: <sudsarkar13@gmail.com>
- GitHub: [@sudsarkar13](https://github.com/sudsarkar13)

### Repository

- **Homepage**: <https://github.com/sudsarkar13/deno-mcp>
- **Issues**: <https://github.com/sudsarkar13/deno-mcp/issues>
- **NPM**: <https://www.npmjs.com/package/@sudsarkar13/deno-mcp>

This initial release provides a complete, production-ready MCP server for Deno development workflows.
