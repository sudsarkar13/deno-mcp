/**
 * Deno execution tools: run, serve, task, repl, eval
 */

import {
  DenoRunOptions,
  DenoServeOptions,
  DenoTaskOptions,
  DenoCommandResult,
  TOOL_SCHEMAS,
} from "../types/index.js";
import {
  executeCommand,
  buildPermissionArgs,
  validateAndNormalizePath,
  getAvailableTasks,
  formatCommandOutput,
} from "../utils/command.js";

/**
 * Execute a Deno script
 */
export async function denoRun(
  options: DenoRunOptions,
): Promise<DenoCommandResult> {
  const {
    script,
    args = [],
    permissions = [],
    watch = false,
    inspect = false,
    inspectBrk = false,
    cached = false,
    lock,
    lockWrite = false,
    noRemote = false,
    reload = false,
    seed,
    v8Flags = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const scriptPath = validateAndNormalizePath(script, workingDirectory);
  const permissionArgs = buildPermissionArgs(permissions);

  const commandArgs = ["run"];

  // Add flags
  if (watch) commandArgs.push("--watch");
  if (inspect) commandArgs.push("--inspect");
  if (inspectBrk) commandArgs.push("--inspect-brk");
  if (cached) commandArgs.push("--cached-only");
  if (lock) commandArgs.push("--lock", lock);
  if (lockWrite) commandArgs.push("--lock-write");
  if (noRemote) commandArgs.push("--no-remote");
  if (reload) {
    if (Array.isArray(reload)) {
      commandArgs.push("--reload", reload.join(","));
    } else {
      commandArgs.push("--reload");
    }
  }
  if (seed !== undefined) commandArgs.push("--seed", seed.toString());

  // Add V8 flags
  for (const flag of v8Flags) {
    commandArgs.push("--v8-flags", flag);
  }

  // Add permissions
  commandArgs.push(...permissionArgs);

  // Add script and arguments
  commandArgs.push(scriptPath, ...args);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Start a Deno HTTP server
 */
export async function denoServe(
  options: DenoServeOptions,
): Promise<DenoCommandResult> {
  const {
    script,
    port,
    host,
    cert,
    key,
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const scriptPath = validateAndNormalizePath(script, workingDirectory);
  const permissionArgs = buildPermissionArgs(permissions);

  const commandArgs = ["serve"];

  // Add server options
  if (port) commandArgs.push("--port", port.toString());
  if (host) commandArgs.push("--host", host);
  if (cert) commandArgs.push("--cert", cert);
  if (key) commandArgs.push("--key", key);

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
 * Run a Deno task from deno.json
 */
export async function denoTask(
  options: DenoTaskOptions,
): Promise<DenoCommandResult> {
  const { task, workingDirectory, envVars, timeout } = options;

  const commandArgs = ["task"];

  if (task) {
    // Verify task exists
    const availableTasks = await getAvailableTasks(workingDirectory);
    if (!availableTasks[task]) {
      throw new Error(
        `Task "${task}" not found. Available tasks: ${Object.keys(availableTasks).join(", ")}`,
      );
    }
    commandArgs.push(task);
  }

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Start Deno REPL
 */
export async function denoRepl(options: {
  eval?: string;
  unstable?: boolean;
  permissions?: string[];
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
}): Promise<DenoCommandResult> {
  const {
    eval: evalCode,
    unstable = false,
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const permissionArgs = buildPermissionArgs(permissions);
  const commandArgs = ["repl"];

  if (unstable) commandArgs.push("--unstable");
  if (evalCode) commandArgs.push("--eval", evalCode);

  // Add permissions
  commandArgs.push(...permissionArgs);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Evaluate Deno code
 */
export async function denoEval(options: {
  code: string;
  print?: boolean;
  typescript?: boolean;
  permissions?: string[];
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
}): Promise<DenoCommandResult> {
  const {
    code,
    print = false,
    typescript = false,
    permissions = [],
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const permissionArgs = buildPermissionArgs(permissions);
  const commandArgs = ["eval"];

  if (print) commandArgs.push("--print");
  if (typescript) commandArgs.push("--ext", "ts");

  // Add permissions
  commandArgs.push(...permissionArgs);

  // Add code
  commandArgs.push(code);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Get list of available tasks
 */
export async function listTasks(
  workingDirectory?: string,
): Promise<Record<string, string>> {
  return getAvailableTasks(workingDirectory);
}

/**
 * Tool handlers for MCP
 */
export const executionTools = {
  deno_run: {
    name: "deno_run",
    description: "Execute a Deno script with specified permissions and options",
    inputSchema: TOOL_SCHEMAS.deno_run,
    handler: async (args: any) => {
      try {
        const result = await denoRun(args);
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
              text: `Error executing script: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_serve: {
    name: "deno_serve",
    description: "Start a Deno HTTP server",
    inputSchema: TOOL_SCHEMAS.deno_serve,
    handler: async (args: any) => {
      try {
        const result = await denoServe(args);
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
              text: `Error starting server: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_task: {
    name: "deno_task",
    description: "Run a task defined in deno.json",
    inputSchema: TOOL_SCHEMAS.deno_task,
    handler: async (args: any) => {
      try {
        if (!args.task) {
          // List available tasks
          const tasks = await listTasks(args.workingDirectory);
          const taskList = Object.entries(tasks)
            .map(([name, command]) => `  ${name}: ${command}`)
            .join("\n");

          return {
            content: [
              {
                type: "text" as const,
                text: taskList
                  ? `Available tasks:\n${taskList}`
                  : "No tasks defined in deno.json",
              },
            ],
          };
        }

        const result = await denoTask(args);
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
              text: `Error running task: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_repl: {
    name: "deno_repl",
    description: "Start Deno REPL (Read-Eval-Print Loop)",
    inputSchema: {
      type: "object",
      properties: {
        eval: { type: "string", description: "Code to evaluate in REPL" },
        unstable: { type: "boolean", description: "Enable unstable APIs" },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Permissions to grant",
        },
        workingDirectory: { type: "string", description: "Working directory" },
      },
    },
    handler: async (args: any) => {
      try {
        const result = await denoRepl(args);
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
              text: `Error starting REPL: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_eval: {
    name: "deno_eval",
    description: "Evaluate Deno code directly",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Code to evaluate" },
        print: { type: "boolean", description: "Print the result" },
        typescript: {
          type: "boolean",
          description: "Treat code as TypeScript",
        },
        permissions: {
          type: "array",
          items: { type: "string" },
          description: "Permissions to grant",
        },
        workingDirectory: { type: "string", description: "Working directory" },
      },
      required: ["code"],
    },
    handler: async (args: any) => {
      try {
        const result = await denoEval(args);
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
              text: `Error evaluating code: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};
