/**
 * Deno development tools: fmt, lint, check, test, bench, coverage
 */

import {
  DenoFormatOptions,
  DenoLintOptions,
  DenoCheckOptions,
  DenoTestOptions,
  DenoBenchOptions,
  DenoCommandResult,
  TOOL_SCHEMAS,
} from "../types/index.js";
import {
  executeCommand,
  buildPermissionArgs,
  formatCommandOutput,
} from "../utils/command.js";

/**
 * Format Deno code
 */
export async function denoFormat(
  options: DenoFormatOptions,
): Promise<DenoCommandResult> {
  const {
    files = [],
    check = false,
    diff = false,
    ext = [],
    ignore = [],
    indentWidth,
    lineWidth,
    proseWrap,
    singleQuote = false,
    semiColons = true,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["fmt"];

  // Add formatting options
  if (check) commandArgs.push("--check");
  if (diff) commandArgs.push("--diff");
  if (indentWidth) commandArgs.push("--indent-width", indentWidth.toString());
  if (lineWidth) commandArgs.push("--line-width", lineWidth.toString());
  if (proseWrap) commandArgs.push("--prose-wrap", proseWrap);
  if (singleQuote) commandArgs.push("--single-quote");
  if (!semiColons) commandArgs.push("--no-semicolons");

  // Add extensions
  for (const extension of ext) {
    commandArgs.push("--ext", extension);
  }

  // Add ignore patterns
  for (const pattern of ignore) {
    commandArgs.push("--ignore", pattern);
  }

  // Add files/directories
  if (files.length > 0) {
    commandArgs.push(...files);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Lint Deno code
 */
export async function denoLint(
  options: DenoLintOptions,
): Promise<DenoCommandResult> {
  const {
    files = [],
    rules = [],
    rulesInclude = [],
    rulesExclude = [],
    ignore = [],
    json = false,
    compact = false,
    fix = false,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["lint"];

  // Add lint options
  if (json) commandArgs.push("--json");
  if (compact) commandArgs.push("--compact");
  if (fix) commandArgs.push("--fix");

  // Add rule configurations
  for (const rule of rules) {
    commandArgs.push("--rules-tags", rule);
  }

  for (const rule of rulesInclude) {
    commandArgs.push("--rules-include", rule);
  }

  for (const rule of rulesExclude) {
    commandArgs.push("--rules-exclude", rule);
  }

  // Add ignore patterns
  for (const pattern of ignore) {
    commandArgs.push("--ignore", pattern);
  }

  // Add files/directories
  if (files.length > 0) {
    commandArgs.push(...files);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Type check Deno code
 */
export async function denoCheck(
  options: DenoCheckOptions,
): Promise<DenoCommandResult> {
  const {
    files = [],
    all = false,
    noRemote = false,
    remote = false,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["check"];

  // Add check options
  if (all) commandArgs.push("--all");
  if (noRemote) commandArgs.push("--no-remote");
  if (remote) commandArgs.push("--remote");

  // Add files
  if (files.length > 0) {
    commandArgs.push(...files);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Run Deno tests
 */
export async function denoTest(
  options: DenoTestOptions,
): Promise<DenoCommandResult> {
  const {
    pattern,
    ignore = [],
    coverage = false,
    coverageDir,
    parallel = false,
    jobs,
    failFast = false,
    allowNone = false,
    filter,
    shuffle = false,
    seed,
    reporter,
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const permissionArgs = buildPermissionArgs(permissions);
  const commandArgs = ["test"];

  // Add test options
  if (coverage) {
    commandArgs.push("--coverage");
    if (coverageDir) commandArgs.push("--coverage-dir", coverageDir);
  }
  if (parallel) commandArgs.push("--parallel");
  if (jobs) commandArgs.push("--jobs", jobs.toString());
  if (failFast) commandArgs.push("--fail-fast");
  if (allowNone) commandArgs.push("--allow-none");
  if (filter) commandArgs.push("--filter", filter);
  if (shuffle) commandArgs.push("--shuffle");
  if (seed) commandArgs.push("--seed", seed.toString());
  if (reporter) commandArgs.push("--reporter", reporter);

  // Add ignore patterns
  for (const pattern of ignore) {
    commandArgs.push("--ignore", pattern);
  }

  // Add permissions
  commandArgs.push(...permissionArgs);

  // Add test pattern
  if (pattern) {
    commandArgs.push(pattern);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Run Deno benchmarks
 */
export async function denoBench(
  options: DenoBenchOptions,
): Promise<DenoCommandResult> {
  const {
    pattern,
    ignore = [],
    filter,
    json = false,
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const permissionArgs = buildPermissionArgs(permissions);
  const commandArgs = ["bench"];

  // Add bench options
  if (json) commandArgs.push("--json");
  if (filter) commandArgs.push("--filter", filter);

  // Add ignore patterns
  for (const pattern of ignore) {
    commandArgs.push("--ignore", pattern);
  }

  // Add permissions
  commandArgs.push(...permissionArgs);

  // Add benchmark pattern
  if (pattern) {
    commandArgs.push(pattern);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Generate test coverage report
 */
export async function denoCoverage(options: {
  coverageDir?: string;
  html?: boolean;
  lcov?: boolean;
  output?: string;
  include?: string[];
  exclude?: string[];
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
}): Promise<DenoCommandResult> {
  const {
    coverageDir = "coverage",
    html = false,
    lcov = false,
    output,
    include = [],
    exclude = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["coverage"];

  // Add coverage options
  if (html) commandArgs.push("--html");
  if (lcov) commandArgs.push("--lcov");
  if (output) commandArgs.push("--output", output);

  // Add include/exclude patterns
  for (const pattern of include) {
    commandArgs.push("--include", pattern);
  }

  for (const pattern of exclude) {
    commandArgs.push("--exclude", pattern);
  }

  // Add coverage directory
  commandArgs.push(coverageDir);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Tool handlers for MCP
 */
export const developmentTools = {
  deno_fmt: {
    name: "deno_fmt",
    description:
      "Format Deno/TypeScript code according to standard conventions",
    inputSchema: TOOL_SCHEMAS.deno_fmt,
    handler: async (args: any) => {
      try {
        const result = await denoFormat(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error formatting code: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_lint: {
    name: "deno_lint",
    description:
      "Lint Deno/TypeScript code for potential issues and style violations",
    inputSchema: TOOL_SCHEMAS.deno_lint,
    handler: async (args: any) => {
      try {
        const result = await denoLint(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error linting code: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_check: {
    name: "deno_check",
    description: "Type check Deno/TypeScript code without executing it",
    inputSchema: TOOL_SCHEMAS.deno_check,
    handler: async (args: any) => {
      try {
        const result = await denoCheck(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error type checking: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_test: {
    name: "deno_test",
    description: "Run Deno tests with coverage and reporting options",
    inputSchema: TOOL_SCHEMAS.deno_test,
    handler: async (args: any) => {
      try {
        const result = await denoTest(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error running tests: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_bench: {
    name: "deno_bench",
    description: "Run Deno benchmarks to measure performance",
    inputSchema: TOOL_SCHEMAS.deno_bench,
    handler: async (args: any) => {
      try {
        const result = await denoBench(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error running benchmarks: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_coverage: {
    name: "deno_coverage",
    description: "Generate test coverage reports in various formats",
    inputSchema: TOOL_SCHEMAS.deno_coverage,
    handler: async (args: any) => {
      try {
        const result = await denoCoverage(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error generating coverage: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};
