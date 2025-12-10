/**
 * Deno compilation tools: compile, doc, types, info
 */

import {
  DenoCompileOptions,
  DenoDocOptions,
  DenoInfoOptions,
  DenoCommandResult,
  TOOL_SCHEMAS,
} from "../types/index.js";
import {
  executeCommand,
  buildPermissionArgs,
  validateAndNormalizePath,
  formatCommandOutput,
} from "../utils/command.js";

/**
 * Compile Deno script to standalone executable
 */
export async function denoCompile(
  options: DenoCompileOptions,
): Promise<DenoCommandResult> {
  const {
    script,
    output,
    target,
    noTerminal = false,
    icon,
    include = [],
    exclude = [],
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const scriptPath = validateAndNormalizePath(script, workingDirectory);
  const permissionArgs = buildPermissionArgs(permissions);

  const commandArgs = ["compile"];

  // Add compile options
  if (output) commandArgs.push("--output", output);
  if (target) commandArgs.push("--target", target);
  if (noTerminal) commandArgs.push("--no-terminal");
  if (icon) commandArgs.push("--icon", icon);

  // Add include/exclude patterns
  for (const pattern of include) {
    commandArgs.push("--include", pattern);
  }

  for (const pattern of exclude) {
    commandArgs.push("--exclude", pattern);
  }

  // Add permissions
  commandArgs.push(...permissionArgs);

  // Add script
  commandArgs.push(scriptPath);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Generate documentation for Deno modules
 */
export async function denoDoc(
  options: DenoDocOptions,
): Promise<DenoCommandResult> {
  const {
    source,
    filter,
    json = false,
    html = false,
    name,
    output,
    private: includePrivate = false,
    reload = false,
    stripTrailingSlash = false,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["doc"];

  // Add doc options
  if (json) commandArgs.push("--json");
  if (html) commandArgs.push("--html");
  if (name) commandArgs.push("--name", name);
  if (output) commandArgs.push("--output", output);
  if (includePrivate) commandArgs.push("--private");
  if (reload) commandArgs.push("--reload");
  if (stripTrailingSlash) commandArgs.push("--strip-trailing-slash");
  if (filter) commandArgs.push("--filter", filter);

  // Add source
  if (source) {
    const sourcePath = validateAndNormalizePath(source, workingDirectory);
    commandArgs.push(sourcePath);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Get information about modules and dependencies
 */
export async function denoInfo(
  options: DenoInfoOptions,
): Promise<DenoCommandResult> {
  const {
    module,
    json = false,
    importMap,
    noConfig = false,
    noNpm = false,
    noRemote = false,
    reload = false,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["info"];

  // Add info options
  if (json) commandArgs.push("--json");
  if (importMap) commandArgs.push("--import-map", importMap);
  if (noConfig) commandArgs.push("--no-config");
  if (noNpm) commandArgs.push("--no-npm");
  if (noRemote) commandArgs.push("--no-remote");
  if (reload) commandArgs.push("--reload");

  // Add module
  if (module) {
    commandArgs.push(module);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Generate TypeScript type definitions
 */
export async function denoTypes(
  options: {
    output?: string;
    workingDirectory?: string;
    envVars?: Record<string, string>;
    timeout?: number;
  } = {},
): Promise<DenoCommandResult> {
  const { output, workingDirectory, envVars, timeout } = options;

  const commandArgs = ["types"];

  // Add output option
  if (output) commandArgs.push("--output", output);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Tool handlers for MCP
 */
export const compilationTools = {
  deno_compile: {
    name: "deno_compile",
    description: "Compile Deno script to standalone executable",
    inputSchema: TOOL_SCHEMAS.deno_compile,
    handler: async (args: any) => {
      try {
        const result = await denoCompile(args);
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
              text: `Error compiling script: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_doc: {
    name: "deno_doc",
    description: "Generate documentation for Deno modules",
    inputSchema: TOOL_SCHEMAS.deno_doc,
    handler: async (args: any) => {
      try {
        const result = await denoDoc(args);
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
              text: `Error generating documentation: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_info: {
    name: "deno_info",
    description: "Get information about modules and dependencies",
    inputSchema: TOOL_SCHEMAS.deno_info,
    handler: async (args: any) => {
      try {
        const result = await denoInfo(args);
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
              text: `Error getting module info: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_types: {
    name: "deno_types",
    description: "Generate TypeScript type definitions for Deno runtime",
    inputSchema: TOOL_SCHEMAS.deno_types,
    handler: async (args: any) => {
      try {
        const result = await denoTypes(args);
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
              text: `Error generating types: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};
