# Project Guidelines - Deno MCP Tools

This document outlines the development guidelines, architecture decisions, and contribution standards for the Deno MCP Tools project.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Standards](#development-standards)
- [Code Organization](#code-organization)
- [Contributing Guidelines](#contributing-guidelines)
- [Testing Strategy](#testing-strategy)
- [Release Process](#release-process)
- [Security Guidelines](#security-guidelines)

## Project Overview

### Mission Statement

Provide a comprehensive, secure, and user-friendly MCP server that exposes the complete Deno CLI toolchain to AI assistants and compatible clients, enabling seamless Deno development workflows through the Model Context Protocol.

### Core Principles

1. **Security First**: Leverage Deno's permission model for sandboxed execution
2. **Comprehensive Coverage**: Support all major Deno CLI commands and workflows
3. **Type Safety**: Full TypeScript implementation with strict typing
4. **Error Resilience**: Robust error handling and graceful degradation
5. **User Experience**: Clear documentation and intuitive tool interfaces
6. **Community Driven**: Open development with community feedback integration

## Architecture

### Project Structure

```directory
deno-mcp-tools/
├── src/
│   ├── index.ts              # Main MCP server entry point
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # All type definitions and schemas
│   ├── utils/                # Utility functions
│   │   └── command.ts        # Command execution utilities
│   ├── tools/                # Tool implementations
│   │   ├── execution.ts      # run, serve, task, repl, eval
│   │   ├── development.ts    # fmt, lint, check, test, bench
│   │   ├── dependencies.ts   # add, remove, install, outdated
│   │   ├── compilation.ts    # compile, doc, types, info
│   │   └── utilities.ts      # upgrade, version, completions
│   ├── examples/             # Usage examples
│   └── docs/                 # Additional documentation
├── build/                    # Compiled JavaScript output
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript configuration
├── README.md                # Main documentation
├── LICENSE                  # MIT license
└── PROJECT_GUIDELINES.md    # This file
```

### Design Patterns

#### Tool Handler Pattern

Each tool category follows a consistent pattern:

```typescript
// Tool implementation
export async function denoRun(
  options: DenoRunOptions,
): Promise<DenoCommandResult> {
  // Implementation
}

// MCP tool handler
export const executionTools = {
  deno_run: {
    name: "deno_run",
    description: "Execute a Deno script",
    inputSchema: TOOL_SCHEMAS.deno_run,
    handler: async (args: any) => {
      // Error handling wrapper
    },
  },
};
```

#### Error Handling Strategy

1. **Command Execution Errors**: Wrapped in `DenoCommandError` with stdout/stderr
2. **Validation Errors**: Schema validation with clear error messages
3. **MCP Errors**: Proper MCP error codes and descriptions
4. **Graceful Degradation**: Fallback behaviors when Deno is not installed

#### Permission Management

- Consistent permission argument building across all tools
- Support for both shorthand (`read`) and full flags (`--allow-read`)
- Security-first approach with explicit permission requirements

## Development Standards

### TypeScript Configuration

- **Strict Mode**: All TypeScript strict checks enabled
- **ES Modules**: Use ES module imports/exports
- **Target**: ES2022 for modern Node.js compatibility
- **Module Resolution**: Node.js style resolution

### Code Style

#### Naming Conventions

- **Files**: kebab-case (`deno-command.ts`)
- **Functions**: camelCase (`executeCommand`)
- **Types/Interfaces**: PascalCase (`DenoCommandOptions`)
- **Constants**: UPPER_SNAKE_CASE (`TOOL_SCHEMAS`)
- **Tool Names**: snake_case (`deno_run`)

#### Import Organization

```typescript
// 1. Node.js built-ins
import { spawn } from "child_process";

// 2. External dependencies
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// 3. Internal modules (by category)
import { DenoCommandOptions } from "../types/index.js";
import { executeCommand } from "../utils/command.js";
```

#### Function Documentation

```typescript
/**
 * Execute a Deno script with specified permissions and options
 *
 * @param options - Configuration options for script execution
 * @returns Promise resolving to command execution result
 * @throws DenoCommandError when execution fails
 */
export async function denoRun(
  options: DenoRunOptions,
): Promise<DenoCommandResult> {
  // Implementation
}
```

### Error Handling Standards

#### Custom Error Types

```typescript
export class DenoCommandError extends Error {
  constructor(
    message: string,
    public code: number,
    public stdout: string,
    public stderr: string,
  ) {
    super(message);
    this.name = "DenoCommandError";
  }
}
```

#### Error Response Format

```typescript
return {
  content: [
    {
      type: "text" as const,
      text: `Error: ${error.message}\n\nDetails: ${error.stderr}`,
    },
  ],
  isError: true,
};
```

## Code Organization

### Tool Categories

#### 1. Execution Tools (`tools/execution.ts`)

- Script execution and server management
- REPL and code evaluation
- Task running

#### 2. Development Tools (`tools/development.ts`)

- Code formatting and linting
- Type checking and testing
- Performance benchmarking

#### 3. Dependency Management (`tools/dependencies.ts`)

- Package management operations
- Project initialization
- Dependency analysis

#### 4. Compilation Tools (`tools/compilation.ts`)

- Binary compilation
- Documentation generation
- Type definition generation

#### 5. Utility Tools (`tools/utilities.ts`)

- Version management
- System utilities
- Shell integrations

### Shared Utilities

#### Command Execution (`utils/command.ts`)

Core utilities for:

- Process spawning and management
- Permission argument building
- Path validation and normalization
- Configuration file parsing
- Error extraction and formatting

#### Type Definitions (`types/index.ts`)

Comprehensive TypeScript definitions for:

- All tool option interfaces
- Command result types
- Error classes
- MCP tool schemas

## Contributing Guidelines

### Getting Started

1. **Fork the Repository**

   ```bash
   git clone https://github.com/your-username/deno-mcp-tools.git
   cd deno-mcp-tools
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build and Test**

   ```bash
   npm run build
   npm run lint
   ```

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-tool-name
   ```

2. **Implement Changes**
   - Follow existing code patterns
   - Add comprehensive type definitions
   - Include error handling
   - Update documentation

3. **Test Changes**

   ```bash
   npm run build
   npm run inspector  # Test with MCP inspector
   ```

4. **Submit Pull Request**
   - Clear description of changes
   - Reference any related issues
   - Include testing instructions

### Code Review Checklist

- [ ] Follows established code style and patterns
- [ ] Includes comprehensive TypeScript types
- [ ] Has proper error handling with meaningful messages
- [ ] Includes documentation updates
- [ ] Follows security best practices
- [ ] Tests pass and build succeeds

## Testing Strategy

### Manual Testing

#### MCP Inspector Testing

```bash
npm run inspector
```

Test each tool with various parameter combinations:

- Valid inputs
- Invalid inputs
- Edge cases
- Permission scenarios

#### Integration Testing

Test with actual MCP clients:

- Cline/Claude Dev extension
- Claude Desktop app
- Custom MCP clients

### Automated Testing (Future)

#### Unit Tests

- Tool function testing
- Utility function testing
- Error handling validation

#### Integration Tests

- End-to-end tool execution
- MCP protocol compliance
- Cross-platform compatibility

## Release Process

### Version Management

Follow Semantic Versioning (SemVer):

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Checklist

1. **Pre-Release**
   - [ ] Update version in package.json
   - [ ] Update CHANGELOG.md
   - [ ] Test all tools thoroughly
   - [ ] Update documentation
   - [ ] Run enhanced Docker tests
   - [ ] Verify multi-platform compatibility

2. **Release**
   - [ ] Create git tag
   - [ ] Build and test
   - [ ] Publish to NPM
   - [ ] Create GitHub release
   - [ ] Publish Docker images to Docker Hub
   - [ ] Publish Docker images to GHCR
   - [ ] Verify multi-platform builds

3. **Post-Release**
   - [ ] Update documentation
   - [ ] Announce to community
   - [ ] Monitor for issues
   - [ ] Verify Docker registry availability
   - [ ] Test ARM64 compatibility

### Enhanced CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with the following features:

#### Multi-Platform Docker Support

- **AMD64 and ARM64**: Full support for both Intel/AMD and ARM architectures
- **Apple Silicon**: Native compatibility with M1/M2/M3 Macs
- **Cloud Deployment**: Support for ARM-based cloud instances
- **Cross-Platform Testing**: Automated testing on both architectures

#### Dual Registry Publishing

- **Docker Hub**: Primary registry for public access
- **GitHub Container Registry (GHCR)**: Secondary registry with enhanced security
- **Automated Publishing**: Both registries updated automatically on release
- **Version Tagging**: Consistent versioning across all registries

#### Enhanced Testing Suite

- **Basic Tests**: Quick validation of core functionality
- **Enhanced Tests**: Comprehensive testing with detailed reporting
- **Multi-Platform Testing**: Validation across AMD64 and ARM64
- **Performance Monitoring**: Resource usage and performance benchmarks

#### Release Automation

- **Semantic Versioning**: Automated version management
- **Changelog Generation**: Automatic changelog updates
- **Tag Management**: Consistent git tagging across releases
- **Artifact Publishing**: NPM, Docker Hub, and GHCR publishing

#### Quality Gates

- **Code Quality**: ESLint, Prettier, and TypeScript checks
- **Security Scanning**: Dependency vulnerability scanning
- **Performance Testing**: Automated performance regression detection
- **Documentation Validation**: Ensure documentation is up-to-date

### NPM Publishing

```bash
# Build for production
npm run build

# Publish to NPM
npm publish
```

## Security Guidelines

### Permission Handling

1. **Principle of Least Privilege**
   - Request only necessary permissions
   - Allow users to specify custom permissions
   - Provide clear permission documentation

2. **Input Validation**
   - Validate all user inputs against schemas
   - Sanitize file paths and arguments
   - Prevent command injection

3. **Error Information**
   - Don't expose sensitive system information
   - Provide helpful but safe error messages
   - Log security-relevant events

### Dependency Management

1. **Dependency Auditing**

   ```bash
   npm audit
   npm audit fix
   ```

2. **Minimal Dependencies**
   - Use only necessary dependencies
   - Prefer well-maintained packages
   - Regular dependency updates

3. **Vulnerability Monitoring**
   - Monitor security advisories
   - Update vulnerable dependencies promptly
   - Document security considerations

## Performance Considerations

### Command Execution

1. **Timeout Management**
   - Set reasonable default timeouts
   - Allow custom timeout configuration
   - Handle timeout scenarios gracefully

2. **Resource Usage**
   - Monitor memory usage
   - Clean up processes properly
   - Handle concurrent executions

3. **Caching**
   - Cache Deno installation checks
   - Cache configuration parsing
   - Optimize repeated operations

## Documentation Standards

### Code Documentation

1. **Function Documentation**
   - Clear parameter descriptions
   - Return value documentation
   - Error conditions
   - Usage examples

2. **Type Documentation**
   - Interface property descriptions
   - Enum value explanations
   - Complex type examples

### User Documentation

1. **Tool Reference**
   - Complete parameter lists
   - Usage examples
   - Common use cases
   - Troubleshooting guides

2. **Integration Guides**
   - MCP client setup
   - Configuration examples
   - Best practices

## Community Engagement

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community discussion
- **Pull Requests**: Code contributions and reviews

### Feature Requests

When requesting new features:

1. Check existing issues first
2. Provide clear use cases
3. Include example usage
4. Consider implementation complexity

### Bug Reports

When reporting bugs:

1. Include reproduction steps
2. Provide system information
3. Include error messages
4. Test with latest version

## Future Roadmap

### Planned Features

1. **Enhanced Testing**
   - Automated test suite
   - CI/CD integration
   - Cross-platform testing

2. **Additional Tools**
   - Deno Deploy integration
   - LSP server tools
   - Jupyter notebook support

3. **Performance Improvements**
   - Command caching
   - Parallel execution
   - Resource optimization

4. **Developer Experience**
   - Interactive configuration
   - Better error messages
   - Enhanced documentation

---

This document is a living guideline that evolves with the project. Contributors are encouraged to suggest improvements and updates to keep it relevant and useful.
