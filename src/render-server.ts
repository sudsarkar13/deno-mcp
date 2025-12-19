#!/usr/bin/env node

/**
 * Render-compatible wrapper for Deno MCP Tools Server
 *
 * This wrapper provides HTTP endpoints for health checks while maintaining
 * the core MCP server functionality for client connections.
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { spawn, ChildProcess } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Import all tool categories
import { executionTools } from "./tools/execution.js";
import { developmentTools } from "./tools/development.js";
import { dependencyTools } from "./tools/dependencies.js";
import { compilationTools } from "./tools/compilation.js";
import { utilityTools } from "./tools/utilities.js";
import { checkDenoInstallation } from "./utils/command.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";
const MCP_SERVER_NAME = process.env.MCP_SERVER_NAME || "deno-mcp-render";

// IST timezone helper functions
const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format date to IST string
 */
function toISTString(date: Date = new Date()): string {
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';
}

/**
 * Format date to IST ISO string with timezone offset
 */
function toISTISOString(date: Date = new Date()): string {
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
  const offset = '+05:30';
  return istDate.toISOString().slice(0, -1) + offset;
}

/**
 * Format time only in IST
 */
function toISTTimeString(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';
}

// MCP server process
let mcpProcess: ChildProcess | null = null;
let serverStartTime = new Date();
let isHealthy = true;
let lastHealthCheck = new Date();

// HTTP MCP Server instance
let httpMcpServer: Server | null = null;

/**
 * Combine all tool handlers
 */
const allTools = {
  ...executionTools,
  ...developmentTools,
  ...dependencyTools,
  ...compilationTools,
  ...utilityTools,
};

/**
 * Validate arguments against a schema
 */
function validateArguments(args: any, schema: any): boolean {
  if (!schema || !schema.properties) return true;

  // Check required properties
  if (schema.required) {
    for (const required of schema.required) {
      if (!(required in args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Missing required parameter: ${required}`,
        );
      }
    }
  }

  // Basic type checking for known properties
  for (const [key, value] of Object.entries(args)) {
    const propSchema = schema.properties[key];
    if (!propSchema) continue;

    if (propSchema.type === "string" && typeof value !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a string`,
      );
    }

    if (propSchema.type === "number" && typeof value !== "number") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a number`,
      );
    }

    if (propSchema.type === "boolean" && typeof value !== "boolean") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a boolean`,
      );
    }

    if (propSchema.type === "array" && !Array.isArray(value)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be an array`,
      );
    }
  }

  return true;
}

/**
 * Initialize HTTP MCP Server
 */
function initializeHttpMcpServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      httpMcpServer = new Server(
        {
          name: "@sudsarkar13/deno-mcp-http",
          version: "1.0.7",
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );

      // List all available tools
      httpMcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
        // Check if Deno is installed before listing tools
        const denoInstalled = await checkDenoInstallation();

        if (!denoInstalled) {
          return {
            tools: [
              {
                name: "deno_version",
                description:
                  "⚠️ Deno not found! Use this tool to check installation status and get installation instructions.",
                inputSchema: {
                  type: "object",
                  properties: {},
                  additionalProperties: false,
                },
              },
            ],
          };
        }

        return {
          tools: Object.values(allTools).map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        };
      });

      // Handle tool execution
      httpMcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        // Find the tool handler
        const tool = allTools[name as keyof typeof allTools];
        if (!tool) {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }

        try {
          // Validate arguments
          validateArguments(args || {}, tool.inputSchema);

          // Execute the tool
          const result = await tool.handler(args || {});
          return result;
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }

          // Handle unexpected errors
          console.error(`Error executing tool ${name}:`, error);
          throw new McpError(
            ErrorCode.InternalError,
            `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });

      // Error handling
      httpMcpServer.onerror = (error) => {
        console.error(`[${toISTTimeString()}] HTTP MCP Server error:`, error);
      };

      console.log(`[${toISTTimeString()}] HTTP MCP Server initialized successfully`);
      resolve();
    } catch (error) {
      console.error(`[${toISTTimeString()}] Failed to initialize HTTP MCP server:`, error);
      reject(error);
    }
  });
}

/**
 * Start the MCP server process
 */
function startMcpServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const mcpServerPath = join(__dirname, "index.js");
      mcpProcess = spawn("node", [mcpServerPath], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "production" },
      });

      mcpProcess.on("error", (error) => {
        console.error(`[${toISTTimeString()}] MCP Server process error:`, error);
        isHealthy = false;
        reject(error);
      });

      mcpProcess.on("exit", (code, signal) => {
        console.log(
          `[${toISTTimeString()}] MCP Server process exited with code ${code}, signal ${signal}`,
        );
        isHealthy = false;

        // Auto-restart if not intentionally stopped
        if (code !== 0 && signal !== "SIGTERM" && signal !== "SIGINT") {
          console.log(`[${toISTTimeString()}] Attempting to restart MCP server...`);
          setTimeout(() => {
            startMcpServer().catch(console.error);
          }, 5000);
        }
      });

      mcpProcess.stdout?.on("data", (data) => {
        console.log(`[${toISTTimeString()}] MCP Server stdout:`, data.toString());
      });

      mcpProcess.stderr?.on("data", (data) => {
        console.error(`[${toISTTimeString()}] MCP Server stderr:`, data.toString());
      });

      // Give the process a moment to start
      setTimeout(() => {
        if (mcpProcess && !mcpProcess.killed) {
          isHealthy = true;
          console.log(`[${toISTTimeString()}] MCP Server started successfully`);
          resolve();
        } else {
          reject(new Error("MCP Server failed to start"));
        }
      }, 1000);
    } catch (error) {
      console.error(`[${toISTTimeString()}] Failed to start MCP server:`, error);
      isHealthy = false;
      reject(error);
    }
  });
}

/**
 * Health check endpoint handler
 */
function handleHealthCheck(req: IncomingMessage, res: ServerResponse) {
  lastHealthCheck = new Date();

  const healthStatus = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: toISTISOString(),
    timestamp_ist: toISTString(),
    uptime: Math.floor((Date.now() - serverStartTime.getTime()) / 1000),
    server: MCP_SERVER_NAME,
    version: process.env.npm_package_version || "1.0.7",
    node_version: process.version,
    memory: process.memoryUsage(),
    mcp_process: {
      running: mcpProcess !== null && !mcpProcess.killed,
      pid: mcpProcess?.pid || null,
    },
    environment: {
      node_env: process.env.NODE_ENV,
      port: PORT,
      deno_dir: process.env.DENO_DIR,
    },
  };

  const statusCode = isHealthy ? 200 : 503;

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  });

  res.end(JSON.stringify(healthStatus, null, 2));

  console.log(`[${toISTTimeString()}] Health check: ${healthStatus.status} (${statusCode})`);
}

/**
 * Metrics endpoint handler
 */
function handleMetrics(req: IncomingMessage, res: ServerResponse) {
  const metrics = {
    server_name: MCP_SERVER_NAME,
    uptime_seconds: Math.floor((Date.now() - serverStartTime.getTime()) / 1000),
    health_status: isHealthy ? 1 : 0,
    memory_usage_bytes: process.memoryUsage().rss,
    memory_heap_used_bytes: process.memoryUsage().heapUsed,
    memory_heap_total_bytes: process.memoryUsage().heapTotal,
    last_health_check: Math.floor(lastHealthCheck.getTime() / 1000),
    mcp_process_running: mcpProcess !== null && !mcpProcess.killed ? 1 : 0,
  };

  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Cache-Control": "no-cache",
  });

  // Prometheus format
  let metricsText = "";
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === "number") {
      metricsText += `${key} ${value}\n`;
    } else {
      metricsText += `${key}{value="${value}"} 1\n`;
    }
  }

  res.end(metricsText);
}

/**
 * Status page handler
 */
function handleStatus(req: IncomingMessage, res: ServerResponse) {
  const statusHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>${MCP_SERVER_NAME} - Status</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 20px; border-radius: 4px; margin: 20px 0; }
        .healthy { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .unhealthy { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; }
        .info-card h3 { margin: 0 0 10px 0; color: #495057; }
        .info-card p { margin: 5px 0; color: #6c757d; }
        h1 { color: #343a40; margin-bottom: 10px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${MCP_SERVER_NAME}</h1>
        <p class="timestamp">Last updated: ${toISTString()}</p>
        
        <div class="status ${isHealthy ? "healthy" : "unhealthy"}">
            <strong>Status: ${isHealthy ? "Healthy" : "Unhealthy"}</strong>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Server Info</h3>
                <p><strong>Version:</strong> ${process.env.npm_package_version || "1.0.7"}</p>
                <p><strong>Node.js:</strong> ${process.version}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</p>
                <p><strong>Port:</strong> ${PORT}</p>
            </div>
            
            <div class="info-card">
                <h3>Runtime</h3>
                <p><strong>Uptime:</strong> ${Math.floor((Date.now() - serverStartTime.getTime()) / 1000)}s</p>
                <p><strong>Memory (RSS):</strong> ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB</p>
                <p><strong>Memory (Heap):</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
                <p><strong>Last Health Check:</strong> ${toISTTimeString(lastHealthCheck)}</p>
            </div>
            
            <div class="info-card">
                <h3>MCP Process</h3>
                <p><strong>Running:</strong> ${mcpProcess !== null && !mcpProcess.killed ? "Yes" : "No"}</p>
                <p><strong>PID:</strong> ${mcpProcess?.pid || "N/A"}</p>
                <p><strong>Started:</strong> ${toISTTimeString(serverStartTime)}</p>
            </div>
            
            <div class="info-card">
                <h3>Environment</h3>
                <p><strong>Deno Dir:</strong> ${process.env.DENO_DIR || "default"}</p>
                <p><strong>Log Level:</strong> ${process.env.LOG_LEVEL || "info"}</p>
                <p><strong>Platform:</strong> ${process.platform}</p>
                <p><strong>Architecture:</strong> ${process.arch}</p>
            </div>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 4px;">
            <h3>Available Endpoints</h3>
            <ul>
                <li><a href="/health">/health</a> - Health check (JSON)</li>
                <li><a href="/metrics">/metrics</a> - Prometheus metrics</li>
                <li><strong>/mcp</strong> - MCP protocol over HTTP with Server-Sent Events (POST only)</li>
                <li><a href="/">/</a> - This status page</li>
            </ul>
            <div style="margin-top: 15px; padding: 10px; background: #d1ecf1; border-radius: 4px; border-left: 4px solid #0c5460;">
                <h4 style="margin: 0 0 10px 0; color: #0c5460;">MCP HTTP Usage</h4>
                <p style="margin: 5px 0; font-size: 0.9em; color: #0c5460;">
                    <strong>Endpoint:</strong> POST /mcp<br>
                    <strong>Content-Type:</strong> application/json<br>
                    <strong>Response:</strong> text/event-stream (Server-Sent Events)<br>
                    <strong>Protocol:</strong> JSON-RPC 2.0 (MCP compatible)
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

  res.writeHead(200, {
    "Content-Type": "text/html",
    "Cache-Control": "no-cache",
  });

  res.end(statusHtml);
}

/**
 * Handle MCP protocol over HTTP with streaming
 */
async function handleMcpEndpoint(req: IncomingMessage, res: ServerResponse) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "Method Not Allowed",
      message: "MCP endpoint only accepts POST requests",
      timestamp: toISTISOString(),
    }));
    return;
  }

  // Validate content type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "Bad Request",
      message: "Content-Type must be application/json",
      timestamp: toISTISOString(),
    }));
    return;
  }

  // Check if HTTP MCP server is initialized
  if (!httpMcpServer) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "Service Unavailable",
      message: "MCP server not initialized",
      timestamp: toISTISOString(),
    }));
    return;
  }

  try {
    // Read request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        // Parse JSON-RPC request
        const mcpRequest = JSON.parse(body);
        
        // Validate JSON-RPC format
        if (!mcpRequest.jsonrpc || mcpRequest.jsonrpc !== "2.0") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32600,
              message: "Invalid Request - missing or invalid jsonrpc version"
            },
            id: mcpRequest.id || null,
          }));
          return;
        }

        if (!mcpRequest.method) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: -32600,
              message: "Invalid Request - missing method"
            },
            id: mcpRequest.id || null,
          }));
          return;
        }

        console.log(`[${toISTTimeString()}] MCP HTTP Request: ${mcpRequest.method}`);

        // Set up Server-Sent Events headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        });

        // Send initial connection event
        res.write(`event: connected\n`);
        res.write(`data: ${JSON.stringify({
          type: "connection",
          message: "MCP HTTP stream established",
          timestamp: toISTISOString()
        })}\n\n`);

        // Process MCP request
        let mcpResponse;
        
        if (mcpRequest.method === "tools/list") {
          // Handle list tools request directly
          const denoInstalled = await checkDenoInstallation();

          if (!denoInstalled) {
            mcpResponse = {
              tools: [
                {
                  name: "deno_version",
                  description:
                    "⚠️ Deno not found! Use this tool to check installation status and get installation instructions.",
                  inputSchema: {
                    type: "object",
                    properties: {},
                    additionalProperties: false,
                  },
                },
              ],
            };
          } else {
            mcpResponse = {
              tools: Object.values(allTools).map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
              })),
            };
          }
        } else if (mcpRequest.method === "tools/call") {
          // Handle tool call request directly
          const { name, arguments: args } = mcpRequest.params || {};

          // Send progress event
          res.write(`event: progress\n`);
          res.write(`data: ${JSON.stringify({
            type: "progress",
            message: `Executing tool: ${name || 'unknown'}`,
            timestamp: toISTISOString()
          })}\n\n`);

          // Find the tool handler
          const tool = allTools[name as keyof typeof allTools];
          if (!tool) {
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
          }

          try {
            // Validate arguments
            validateArguments(args || {}, tool.inputSchema);

            // Execute the tool
            const result = await tool.handler(args || {});
            mcpResponse = result;
          } catch (error) {
            if (error instanceof McpError) {
              throw error;
            }

            // Handle unexpected errors
            console.error(`Error executing tool ${name}:`, error);
            throw new McpError(
              ErrorCode.InternalError,
              `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown method: ${mcpRequest.method}`);
        }

        // Send the response as an event
        res.write(`event: response\n`);
        res.write(`data: ${JSON.stringify({
          jsonrpc: "2.0",
          result: mcpResponse,
          id: mcpRequest.id,
        })}\n\n`);

        // Send completion event
        res.write(`event: complete\n`);
        res.write(`data: ${JSON.stringify({
          type: "completion",
          message: "Request processed successfully",
          timestamp: toISTISOString()
        })}\n\n`);

        console.log(`[${toISTTimeString()}] MCP HTTP Response sent for: ${mcpRequest.method}`);

        // Close the stream
        res.end();

      } catch (error) {
        console.error(`[${toISTTimeString()}] MCP endpoint error:`, error);
        
        // Send error as event
        let requestId = null;
        try {
          const parsedRequest = JSON.parse(body);
          requestId = parsedRequest.id || null;
        } catch {
          // If we can't parse the request, use null id
        }

        const errorResponse = {
          jsonrpc: "2.0",
          error: {
            code: error instanceof McpError ? error.code : ErrorCode.InternalError,
            message: error instanceof Error ? error.message : "Unknown error",
          },
          id: requestId,
        };

        if (res.headersSent) {
          res.write(`event: error\n`);
          res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
          res.end();
        } else {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(errorResponse));
        }
      }
    });

    // Handle request errors
    req.on('error', (error) => {
      console.error(`[${toISTTimeString()}] MCP request error:`, error);
      if (!res.headersSent) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          jsonrpc: "2.0",
          error: {
            code: -32700,
            message: "Parse error"
          },
          id: null,
        }));
      }
    });

  } catch (error) {
    console.error(`[${toISTTimeString()}] MCP endpoint setup error:`, error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: "Internal Server Error",
      message: "Failed to process MCP request",
      timestamp: toISTISOString(),
    }));
  }
}

/**
 * HTTP server request handler
 */
function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || "/";

  // CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route requests
  switch (url) {
    case "/health":
      handleHealthCheck(req, res);
      break;

    case "/metrics":
      handleMetrics(req, res);
      break;

    case "/mcp":
      handleMcpEndpoint(req, res);
      break;

    case "/":
    case "/status":
      handleStatus(req, res);
      break;

    default:
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Not Found",
          message: "Available endpoints: /, /health, /metrics, /mcp",
          timestamp: toISTISOString(),
          timestamp_ist: toISTString(),
        }),
      );
  }
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  isHealthy = false;

  // Stop HTTP server
  httpServer.close(() => {
    console.log("HTTP server closed");

    // Stop MCP server process
    if (mcpProcess && !mcpProcess.killed) {
      console.log("Stopping MCP server process...");
      mcpProcess.kill("SIGTERM");

      // Force kill after timeout
      setTimeout(() => {
        if (mcpProcess && !mcpProcess.killed) {
          console.log("Force killing MCP server process...");
          mcpProcess.kill("SIGKILL");
        }
        process.exit(0);
      }, 5000);
    } else {
      process.exit(0);
    }
  });
}

/**
 * Start the HTTP server
 */
const httpServer = createServer(handleRequest);

/**
 * Main startup function
 */
async function main() {
  try {
    console.log(`[${toISTTimeString()}] Starting ${MCP_SERVER_NAME}...`);

    // Initialize HTTP MCP server
    await initializeHttpMcpServer();

    // Start MCP server
    await startMcpServer();

    // Start HTTP server
    httpServer.listen(PORT, HOST, () => {
      console.log(`[${toISTTimeString()}] HTTP server listening on http://${HOST}:${PORT}`);
      console.log(`[${toISTTimeString()}] Health check available at: http://${HOST}:${PORT}/health`);
      console.log(`[${toISTTimeString()}] Status page available at: http://${HOST}:${PORT}/`);
      console.log(`[${toISTTimeString()}] Metrics available at: http://${HOST}:${PORT}/metrics`);
      console.log(`[${toISTTimeString()}] MCP HTTP endpoint available at: http://${HOST}:${PORT}/mcp`);
    });

    // Setup graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error(`[${toISTTimeString()}] Uncaught exception:`, error);
      isHealthy = false;
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error(`[${toISTTimeString()}] Unhandled rejection at:`, promise, "reason:", reason);
      isHealthy = false;
      gracefulShutdown("UNHANDLED_REJECTION");
    });

    console.log(`[${toISTTimeString()}] ${MCP_SERVER_NAME} started successfully!`);
  } catch (error) {
    console.error(`[${toISTTimeString()}] Failed to start server:`, error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error(`[${toISTTimeString()}] Server startup error:`, error);
  process.exit(1);
});
