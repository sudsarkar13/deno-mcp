# Deno MCP Server API Reference

This document provides a comprehensive reference for all tools available in the Deno MCP server.

## Tool Categories

The Deno MCP server provides tools organized into five main categories:

1. **Execution Tools** - Run and serve Deno applications
2. **Development Tools** - Code quality and testing
3. **Dependency Management** - Package and project management
4. **Compilation Tools** - Building and documentation
5. **Utility Tools** - System utilities and version management

## Execution Tools

### deno_run

Execute a Deno script with specified permissions and options.

**Input Schema:**

```typescript
{
  script: string;           // Required: Path to script file
  permissions?: {
    allow_net?: boolean | string[];
    allow_read?: boolean | string[];
    allow_write?: boolean | string[];
    allow_env?: boolean | string[];
    allow_run?: boolean | string[];
    allow_ffi?: boolean | string[];
    allow_hrtime?: boolean;
    allow_sys?: boolean | string[];
  };
  import_map?: string;      // Path to import map file
  config?: string;          // Path to deno.json config file
  watch?: boolean;          // Enable file watching
  inspect?: boolean | string; // Enable debugging
  args?: string[];          // Arguments to pass to script
}
```

**Example:**

```json
{
  "script": "main.ts",
  "permissions": {
    "allow_net": true,
    "allow_read": ["./data"]
  },
  "watch": true
}
```

### deno_serve

Start a Deno HTTP server.

**Input Schema:**

```typescript
{
  script: string;           // Required: Path to server script
  port?: number;            // Port to listen on (default: 8000)
  hostname?: string;        // Hostname to bind to
  cert?: string;           // Path to TLS certificate
  key?: string;            // Path to TLS private key
  permissions?: PermissionOptions;
  import_map?: string;
  config?: string;
  watch?: boolean;
}
```

### deno_task

Run a task defined in deno.json.

**Input Schema:**

```typescript
{
  task: string;            // Required: Task name from deno.json
  cwd?: string;           // Working directory
}
```

### deno_repl

Start an interactive Deno REPL session.

**Input Schema:**

```typescript
{
  permissions?: PermissionOptions;
  import_map?: string;
  config?: string;
  eval?: string;          // Code to evaluate on startup
}
```

### deno_eval

Evaluate Deno code directly.

**Input Schema:**

```typescript
{
  code: string;           // Required: Code to evaluate
  permissions?: PermissionOptions;
  import_map?: string;
  config?: string;
  print?: boolean;        // Print result (default: true)
}
```

## Development Tools

### deno_fmt

Format Deno source code.

**Input Schema:**

```typescript
{
  files?: string[];       // Files to format (default: all)
  check?: boolean;        // Check if files are formatted
  config?: string;        // Path to deno.json config
  ext?: string[];         // File extensions to format
  ignore?: string[];      // Files to ignore
  indent_width?: number;  // Indentation width
  line_width?: number;    // Maximum line width
  prose_wrap?: 'always' | 'never' | 'preserve';
  no_semicolons?: boolean;
  single_quote?: boolean;
}
```

### deno_lint

Lint Deno source code for errors and style issues.

**Input Schema:**

```typescript
{
  files?: string[];       // Files to lint (default: all)
  fix?: boolean;          // Auto-fix issues
  rules_tags?: string[];  // Rule tags to include/exclude
  rules_include?: string[]; // Specific rules to include
  rules_exclude?: string[]; // Specific rules to exclude
  config?: string;        // Path to deno.json config
  ignore?: string[];      // Files to ignore
  json?: boolean;         // Output in JSON format
}
```

### deno_check

Type-check Deno source code.

**Input Schema:**

```typescript
{
  files: string[];        // Required: Files to check
  import_map?: string;
  config?: string;
  remote?: boolean;       // Check remote modules
  no_check?: boolean;     // Skip type checking
  all?: boolean;          // Check all files including remote
}
```

### deno_test

Run Deno tests.

**Input Schema:**

```typescript
{
  files?: string[];       // Test files to run
  filter?: string;        // Filter tests by name pattern
  permissions?: PermissionOptions;
  parallel?: boolean;     // Run tests in parallel
  jobs?: number;          // Number of parallel jobs
  fail_fast?: boolean;    // Stop on first failure
  allow_none?: boolean;   // Allow no tests
  coverage?: string;      // Coverage output directory
  reporter?: 'pretty' | 'dot' | 'junit' | 'tap';
  junit_path?: string;    // JUnit output file
  config?: string;
  import_map?: string;
  watch?: boolean;
}
```

### deno_bench

Run Deno benchmarks.

**Input Schema:**

```typescript
{
  files?: string[];       // Benchmark files to run
  filter?: string;        // Filter benchmarks by name
  permissions?: PermissionOptions;
  config?: string;
  import_map?: string;
  json?: boolean;         // Output in JSON format
  watch?: boolean;
}
```

### deno_coverage

Generate test coverage reports.

**Input Schema:**

```typescript
{
  coverage_dir: string;   // Required: Coverage data directory
  include?: string[];     // Files to include in report
  exclude?: string[];     // Files to exclude from report
  output?: string;        // Output file for report
  html?: boolean;         // Generate HTML report
  lcov?: boolean;         // Generate LCOV report
  detailed?: boolean;     // Show detailed coverage
}
```

## Dependency Management

### deno_add

Add dependencies to a Deno project.

**Input Schema:**

```typescript
{
  packages: string[];     // Required: Package specifiers to add
  dev?: boolean;          // Add as dev dependencies
  global?: boolean;       // Install globally
  config?: string;        // Path to deno.json config
}
```

### deno_remove

Remove dependencies from a Deno project.

**Input Schema:**

```typescript
{
  packages: string[];     // Required: Package names to remove
  config?: string;        // Path to deno.json config
}
```

### deno_install

Install a Deno script as an executable.

**Input Schema:**

```typescript
{
  script: string;         // Required: Script URL or path
  name?: string;          // Executable name
  root?: string;          // Installation root directory
  force?: boolean;        // Force overwrite existing
  permissions?: PermissionOptions;
  import_map?: string;
  config?: string;
}
```

### deno_uninstall

Uninstall a Deno executable.

**Input Schema:**

```typescript
{
  name: string;           // Required: Executable name
  root?: string;          // Installation root directory
}
```

### deno_outdated

Check for outdated dependencies.

**Input Schema:**

```typescript
{
  config?: string;        // Path to deno.json config
  json?: boolean;         // Output in JSON format
  compatible?: boolean;   // Show only compatible updates
}
```

### deno_init

Initialize a new Deno project.

**Input Schema:**

```typescript
{
  name?: string;          // Project name
  lib?: boolean;          // Create a library project
  serve?: boolean;        // Create a server project
  quiet?: boolean;        // Suppress output
}
```

## Compilation Tools

### deno_compile

Compile a Deno script to a standalone executable.

**Input Schema:**

```typescript
{
  script: string;         // Required: Script to compile
  output?: string;        // Output executable path
  target?: string;        // Target platform
  permissions?: PermissionOptions;
  import_map?: string;
  config?: string;
  include?: string[];     // Additional files to include
  icon?: string;          // Windows icon file
  no_terminal?: boolean;  // Windows: don't show terminal
}
```

### deno_doc

Generate documentation for Deno modules.

**Input Schema:**

```typescript
{
  source?: string;        // Source file or URL
  filter?: string;        // Filter symbols by name
  format?: 'json' | 'html'; // Output format
  name?: string;          // Project name for HTML
  output?: string;        // Output directory for HTML
  private?: boolean;      // Include private symbols
  import_map?: string;
  config?: string;
}
```

### deno_info

Show information about a Deno module.

**Input Schema:**

```typescript
{
  module?: string;        // Module to analyze
  json?: boolean;         // Output in JSON format
  import_map?: string;
  config?: string;
  reload?: boolean;       // Reload cache
}
```

### deno_types

Generate TypeScript declaration files.

**Input Schema:**

```typescript
{
  output?: string;        // Output file path
}
```

## Utility Tools

### deno_upgrade

Upgrade Deno to the latest version.

**Input Schema:**

```typescript
{
  version?: string;       // Specific version to upgrade to
  output?: string;        // Output path for new binary
  dry_run?: boolean;      // Show what would be upgraded
  force?: boolean;        // Force upgrade even if up to date
  canary?: boolean;       // Upgrade to canary version
}
```

### deno_version

Show Deno version information.

**Input Schema:**

```typescript
{
  json?: boolean;         // Output in JSON format
}
```

### deno_completions

Generate shell completion scripts.

**Input Schema:**

```typescript
{
  shell: 'bash' | 'zsh' | 'fish' | 'powershell' | 'fig';
  output?: string;        // Output file path
}
```

## Error Handling

All tools use standardized error handling with the following error types:

### DenoCommandError

Thrown when a Deno command fails to execute or returns a non-zero exit code.

**Properties:**

- `message`: Error description
- `code`: Exit code (if available)
- `stderr`: Standard error output
- `command`: The command that failed

### DenoPermissionError

Thrown when a command requires permissions that weren't granted.

**Properties:**

- `message`: Error description
- `permission`: The permission that was missing
- `suggestion`: Suggested permission flags

### DenoNotFoundError

Thrown when the Deno executable cannot be found on the system.

**Properties:**

- `message`: Error description
- `suggestion`: Installation instructions

## Usage Examples

### Basic Script Execution

```json
{
  "tool": "deno_run",
  "arguments": {
    "script": "hello.ts",
    "permissions": {
      "allow_net": true
    }
  }
}
```

### Development Workflow

```json
[
  {
    "tool": "deno_fmt",
    "arguments": {
      "files": ["src/**/*.ts"]
    }
  },
  {
    "tool": "deno_lint",
    "arguments": {
      "files": ["src/**/*.ts"]
    }
  },
  {
    "tool": "deno_test",
    "arguments": {
      "coverage": "coverage"
    }
  }
]
```

### Production Build

```json
{
  "tool": "deno_compile",
  "arguments": {
    "script": "main.ts",
    "output": "dist/myapp",
    "permissions": {
      "allow_net": true,
      "allow_read": ["./config"]
    }
  }
}
```

## Best Practices

1. **Permission Management**: Always use the principle of least privilege
2. **Error Handling**: Check for `DenoNotFoundError` and provide installation guidance
3. **Configuration**: Use `deno.json` for project configuration when possible
4. **Performance**: Use `--watch` mode during development for faster iteration
5. **Security**: Validate all input parameters before passing to Deno commands

This API reference provides the complete interface for interacting with the Deno MCP server. All tools follow consistent patterns for input validation, error handling, and output formatting.
