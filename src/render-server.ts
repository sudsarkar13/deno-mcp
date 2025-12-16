#!/usr/bin/env node

/**
 * Render-compatible wrapper for Deno MCP Tools Server
 * 
 * This wrapper provides HTTP endpoints for health checks while maintaining
 * the core MCP server functionality for client connections.
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { spawn, ChildProcess } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const MCP_SERVER_NAME = process.env.MCP_SERVER_NAME || 'deno-mcp-render';

// MCP server process
let mcpProcess: ChildProcess | null = null;
let serverStartTime = new Date();
let isHealthy = true;
let lastHealthCheck = new Date();

/**
 * Start the MCP server process
 */
function startMcpServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const mcpServerPath = join(__dirname, 'index.js');
      mcpProcess = spawn('node', [mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      });

      mcpProcess.on('error', (error) => {
        console.error('MCP Server process error:', error);
        isHealthy = false;
        reject(error);
      });

      mcpProcess.on('exit', (code, signal) => {
        console.log(`MCP Server process exited with code ${code}, signal ${signal}`);
        isHealthy = false;
        
        // Auto-restart if not intentionally stopped
        if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
          console.log('Attempting to restart MCP server...');
          setTimeout(() => {
            startMcpServer().catch(console.error);
          }, 5000);
        }
      });

      mcpProcess.stdout?.on('data', (data) => {
        console.log('MCP Server stdout:', data.toString());
      });

      mcpProcess.stderr?.on('data', (data) => {
        console.error('MCP Server stderr:', data.toString());
      });

      // Give the process a moment to start
      setTimeout(() => {
        if (mcpProcess && !mcpProcess.killed) {
          isHealthy = true;
          console.log('MCP Server started successfully');
          resolve();
        } else {
          reject(new Error('MCP Server failed to start'));
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to start MCP server:', error);
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
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - serverStartTime.getTime()) / 1000),
    server: MCP_SERVER_NAME,
    version: process.env.npm_package_version || '1.0.6',
    node_version: process.version,
    memory: process.memoryUsage(),
    mcp_process: {
      running: mcpProcess !== null && !mcpProcess.killed,
      pid: mcpProcess?.pid || null
    },
    environment: {
      node_env: process.env.NODE_ENV,
      port: PORT,
      deno_dir: process.env.DENO_DIR
    }
  };

  const statusCode = isHealthy ? 200 : 503;
  
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  });
  
  res.end(JSON.stringify(healthStatus, null, 2));
  
  console.log(`Health check: ${healthStatus.status} (${statusCode})`);
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
    mcp_process_running: (mcpProcess !== null && !mcpProcess.killed) ? 1 : 0
  };

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache'
  });

  // Prometheus format
  let metricsText = '';
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === 'number') {
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
        <p class="timestamp">Last updated: ${new Date().toISOString()}</p>
        
        <div class="status ${isHealthy ? 'healthy' : 'unhealthy'}">
            <strong>Status: ${isHealthy ? 'Healthy' : 'Unhealthy'}</strong>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Server Info</h3>
                <p><strong>Version:</strong> ${process.env.npm_package_version || '1.0.6'}</p>
                <p><strong>Node.js:</strong> ${process.version}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>Port:</strong> ${PORT}</p>
            </div>
            
            <div class="info-card">
                <h3>Runtime</h3>
                <p><strong>Uptime:</strong> ${Math.floor((Date.now() - serverStartTime.getTime()) / 1000)}s</p>
                <p><strong>Memory (RSS):</strong> ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB</p>
                <p><strong>Memory (Heap):</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
                <p><strong>Last Health Check:</strong> ${lastHealthCheck.toLocaleTimeString()}</p>
            </div>
            
            <div class="info-card">
                <h3>MCP Process</h3>
                <p><strong>Running:</strong> ${mcpProcess !== null && !mcpProcess.killed ? 'Yes' : 'No'}</p>
                <p><strong>PID:</strong> ${mcpProcess?.pid || 'N/A'}</p>
                <p><strong>Started:</strong> ${serverStartTime.toLocaleTimeString()}</p>
            </div>
            
            <div class="info-card">
                <h3>Environment</h3>
                <p><strong>Deno Dir:</strong> ${process.env.DENO_DIR || 'default'}</p>
                <p><strong>Log Level:</strong> ${process.env.LOG_LEVEL || 'info'}</p>
                <p><strong>Platform:</strong> ${process.platform}</p>
                <p><strong>Architecture:</strong> ${process.arch}</p>
            </div>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 4px;">
            <h3>Available Endpoints</h3>
            <ul>
                <li><a href="/health">/health</a> - Health check (JSON)</li>
                <li><a href="/metrics">/metrics</a> - Prometheus metrics</li>
                <li><a href="/">/</a> - This status page</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
  });
  
  res.end(statusHtml);
}

/**
 * HTTP server request handler
 */
function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '/';
  
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route requests
  switch (url) {
    case '/health':
      handleHealthCheck(req, res);
      break;
    
    case '/metrics':
      handleMetrics(req, res);
      break;
    
    case '/':
    case '/status':
      handleStatus(req, res);
      break;
    
    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Not Found',
        message: 'Available endpoints: /, /health, /metrics',
        timestamp: new Date().toISOString()
      }));
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
    console.log('HTTP server closed');
    
    // Stop MCP server process
    if (mcpProcess && !mcpProcess.killed) {
      console.log('Stopping MCP server process...');
      mcpProcess.kill('SIGTERM');
      
      // Force kill after timeout
      setTimeout(() => {
        if (mcpProcess && !mcpProcess.killed) {
          console.log('Force killing MCP server process...');
          mcpProcess.kill('SIGKILL');
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
    console.log(`Starting ${MCP_SERVER_NAME}...`);
    
    // Start MCP server
    await startMcpServer();
    
    // Start HTTP server
    httpServer.listen(PORT, HOST, () => {
      console.log(`HTTP server listening on http://${HOST}:${PORT}`);
      console.log(`Health check available at: http://${HOST}:${PORT}/health`);
      console.log(`Status page available at: http://${HOST}:${PORT}/`);
      console.log(`Metrics available at: http://${HOST}:${PORT}/metrics`);
    });

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      isHealthy = false;
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      isHealthy = false;
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    console.log(`${MCP_SERVER_NAME} started successfully!`);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
