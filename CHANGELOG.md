# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-12-12

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

## [1.0.0] - 2024-12-09

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
