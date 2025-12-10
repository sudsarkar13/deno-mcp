/**
 * Type definitions for Deno MCP Tools
 */

export interface DenoCommandOptions {
  workingDirectory?: string;
  permissions?: string[];
  envVars?: Record<string, string>;
  timeout?: number;
}

export interface DenoRunOptions extends DenoCommandOptions {
  script: string;
  args?: string[];
  watch?: boolean;
  inspect?: boolean;
  inspectBrk?: boolean;
  cached?: boolean;
  lock?: string;
  lockWrite?: boolean;
  noRemote?: boolean;
  reload?: boolean | string[];
  seed?: number;
  v8Flags?: string[];
}

export interface DenoServeOptions extends DenoCommandOptions {
  script: string;
  port?: number;
  host?: string;
  cert?: string;
  key?: string;
}

export interface DenoTestOptions extends DenoCommandOptions {
  pattern?: string;
  ignore?: string[];
  coverage?: boolean;
  coverageDir?: string;
  parallel?: boolean;
  jobs?: number;
  failFast?: boolean;
  allowNone?: boolean;
  filter?: string;
  shuffle?: boolean;
  seed?: number;
  reporter?: "pretty" | "dot" | "json" | "junit" | "tap";
}

export interface DenoBenchOptions extends DenoCommandOptions {
  pattern?: string;
  ignore?: string[];
  filter?: string;
  json?: boolean;
}

export interface DenoFormatOptions extends DenoCommandOptions {
  files?: string[];
  check?: boolean;
  diff?: boolean;
  ext?: string[];
  ignore?: string[];
  indentWidth?: number;
  lineWidth?: number;
  proseWrap?: "always" | "never" | "preserve";
  singleQuote?: boolean;
  semiColons?: boolean;
}

export interface DenoLintOptions extends DenoCommandOptions {
  files?: string[];
  rules?: string[];
  rulesInclude?: string[];
  rulesExclude?: string[];
  ignore?: string[];
  json?: boolean;
  compact?: boolean;
  fix?: boolean;
}

export interface DenoCheckOptions extends DenoCommandOptions {
  files?: string[];
  all?: boolean;
  noRemote?: boolean;
  remote?: boolean;
}

export interface DenoCompileOptions extends DenoCommandOptions {
  script: string;
  output?: string;
  target?: string;
  noTerminal?: boolean;
  icon?: string;
  include?: string[];
  exclude?: string[];
}

export interface DenoInfoOptions extends DenoCommandOptions {
  module?: string;
  json?: boolean;
  importMap?: string;
  noConfig?: boolean;
  noNpm?: boolean;
  noRemote?: boolean;
  reload?: boolean;
}

export interface DenoDocOptions extends DenoCommandOptions {
  source?: string;
  filter?: string;
  json?: boolean;
  html?: boolean;
  name?: string;
  output?: string;
  private?: boolean;
  reload?: boolean;
  stripTrailingSlash?: boolean;
}

export interface DenoAddOptions extends DenoCommandOptions {
  packages: string[];
  dev?: boolean;
}

export interface DenoRemoveOptions extends DenoCommandOptions {
  packages: string[];
}

export interface DenoInstallOptions extends DenoCommandOptions {
  global?: boolean;
  name?: string;
  root?: string;
  force?: boolean;
  script: string;
}

export interface DenoTaskOptions extends DenoCommandOptions {
  task?: string;
  cwd?: string;
}

export interface DenoUpgradeOptions extends DenoCommandOptions {
  version?: string;
  output?: string;
  dryRun?: boolean;
  force?: boolean;
  canary?: boolean;
}

export interface DenoPermissionDescriptor {
  name: "read" | "write" | "net" | "env" | "run" | "ffi" | "hrtime" | "sys";
  path?: string;
  host?: string;
}

export interface DenoCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
  duration: number;
}

export interface DenoProjectInfo {
  denoVersion?: string;
  configPath?: string;
  importMapPath?: string;
  lockPath?: string;
  permissions?: DenoPermissionDescriptor[];
  tasks?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface DenoModuleInfo {
  specifier: string;
  dependencies: Array<{
    specifier: string;
    isDynamic: boolean;
    code?: string;
    type?: string;
  }>;
  size: number;
  mediaType: string;
  local?: string;
  checksum?: string;
  emit?: string;
  map?: string;
}

// Error types
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

export class DenoPermissionError extends Error {
  constructor(
    message: string,
    public permission: DenoPermissionDescriptor,
  ) {
    super(message);
    this.name = "DenoPermissionError";
  }
}

export class DenoConfigError extends Error {
  constructor(
    message: string,
    public configPath?: string,
  ) {
    super(message);
    this.name = "DenoConfigError";
  }
}

// Tool input schemas for MCP
export const TOOL_SCHEMAS = {
  deno_run: {
    type: "object",
    properties: {
      script: { type: "string", description: "Path to the script to run" },
      args: {
        type: "array",
        items: { type: "string" },
        description: "Arguments to pass to the script",
      },
      permissions: {
        type: "array",
        items: { type: "string" },
        description: "Permissions to grant (e.g., --allow-read, --allow-net)",
      },
      watch: {
        type: "boolean",
        description: "Watch for file changes and restart",
      },
      workingDirectory: {
        type: "string",
        description: "Working directory to run the command in",
      },
      envVars: { type: "object", description: "Environment variables to set" },
    },
    required: ["script"],
  },

  deno_serve: {
    type: "object",
    properties: {
      script: { type: "string", description: "Path to the server script" },
      port: { type: "number", description: "Port to serve on (default: 8000)" },
      host: {
        type: "string",
        description: "Host to serve on (default: 0.0.0.0)",
      },
      permissions: {
        type: "array",
        items: { type: "string" },
        description: "Permissions to grant",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
    required: ["script"],
  },

  deno_test: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Test file pattern to match" },
      coverage: { type: "boolean", description: "Generate coverage report" },
      parallel: { type: "boolean", description: "Run tests in parallel" },
      failFast: { type: "boolean", description: "Stop on first failure" },
      filter: { type: "string", description: "Filter tests by name pattern" },
      permissions: {
        type: "array",
        items: { type: "string" },
        description: "Permissions to grant",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_fmt: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: { type: "string" },
        description: "Files or directories to format",
      },
      check: {
        type: "boolean",
        description: "Check if files are formatted without modifying them",
      },
      diff: { type: "boolean", description: "Show diff of formatting changes" },
      singleQuote: { type: "boolean", description: "Use single quotes" },
      indentWidth: {
        type: "number",
        description: "Number of spaces for indentation",
      },
      lineWidth: { type: "number", description: "Maximum line width" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_lint: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: { type: "string" },
        description: "Files or directories to lint",
      },
      rules: {
        type: "array",
        items: { type: "string" },
        description: "Specific rules to run",
      },
      fix: {
        type: "boolean",
        description: "Automatically fix issues where possible",
      },
      json: { type: "boolean", description: "Output in JSON format" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_check: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: { type: "string" },
        description: "Files to type check",
      },
      all: { type: "boolean", description: "Type check all dependencies" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_compile: {
    type: "object",
    properties: {
      script: { type: "string", description: "Script to compile" },
      output: { type: "string", description: "Output file name" },
      target: {
        type: "string",
        description: "Target platform (e.g., x86_64-pc-windows-msvc)",
      },
      permissions: {
        type: "array",
        items: { type: "string" },
        description: "Permissions to grant",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
    required: ["script"],
  },

  deno_info: {
    type: "object",
    properties: {
      module: { type: "string", description: "Module to analyze" },
      json: { type: "boolean", description: "Output in JSON format" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_doc: {
    type: "object",
    properties: {
      source: {
        type: "string",
        description: "Source file or module to document",
      },
      filter: { type: "string", description: "Filter symbols by name" },
      json: { type: "boolean", description: "Output in JSON format" },
      html: { type: "boolean", description: "Generate HTML documentation" },
      output: { type: "string", description: "Output directory for HTML docs" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_add: {
    type: "object",
    properties: {
      packages: {
        type: "array",
        items: { type: "string" },
        description: "Packages to add",
      },
      dev: { type: "boolean", description: "Add as dev dependency" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
    required: ["packages"],
  },

  deno_remove: {
    type: "object",
    properties: {
      packages: {
        type: "array",
        items: { type: "string" },
        description: "Packages to remove",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
    required: ["packages"],
  },

  deno_task: {
    type: "object",
    properties: {
      task: { type: "string", description: "Task name to run" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_init: {
    type: "object",
    properties: {
      name: { type: "string", description: "Project name" },
      lib: { type: "boolean", description: "Initialize as library" },
      serve: {
        type: "boolean",
        description: "Initialize with server template",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_upgrade: {
    type: "object",
    properties: {
      version: {
        type: "string",
        description: "Specific version to upgrade to",
      },
      canary: { type: "boolean", description: "Upgrade to canary version" },
      dryRun: {
        type: "boolean",
        description: "Show what would be upgraded without doing it",
      },
      force: {
        type: "boolean",
        description: "Force upgrade even if already up to date",
      },
    },
  },

  deno_bench: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Benchmark file pattern" },
      filter: { type: "string", description: "Filter benchmarks by name" },
      json: { type: "boolean", description: "Output in JSON format" },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_coverage: {
    type: "object",
    properties: {
      coverageDir: {
        type: "string",
        description: "Coverage directory to analyze",
      },
      html: { type: "boolean", description: "Generate HTML coverage report" },
      lcov: { type: "boolean", description: "Generate LCOV coverage report" },
      output: {
        type: "string",
        description: "Output file for coverage report",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },

  deno_types: {
    type: "object",
    properties: {
      output: {
        type: "string",
        description: "Output file for type definitions",
      },
      workingDirectory: { type: "string", description: "Working directory" },
    },
  },
} as const;
