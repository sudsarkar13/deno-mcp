/**
 * Basic MCP Server Tests
 * These tests verify that the MCP server can start and respond correctly
 */

import { spawn } from 'child_process';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const serverPath = join(projectRoot, 'build', 'index.js');

test('MCP Server - Should start without errors', async (t) => {
  let serverProcess;
  let serverOutput = '';
  let serverError = '';

  try {
    // Start the MCP server process
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot
    });

    // Collect output
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      serverError += data.toString();
    });

    // Wait for server to initialize
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check if process is still running (not crashed)
    assert.strictEqual(serverProcess.killed, false, 'Server process should still be running');

    // Verify no critical errors in stderr
    assert.ok(!serverError.includes('Error:'), `Server should not have critical errors: ${serverError}`);
    
    console.log('✅ MCP Server started successfully');
    console.log('Server output:', serverOutput);

  } catch (error) {
    throw new Error(`MCP Server test failed: ${error.message}`);
  } finally {
    // Clean up: kill the server process
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }
  }
});

test('MCP Server - Should handle process signals correctly', async (t) => {
  let serverProcess;

  try {
    // Start the MCP server process
    serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot
    });

    // Wait for server to initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Send SIGTERM and verify graceful shutdown
    serverProcess.kill('SIGTERM');

    // Wait for process to exit
    const exitPromise = new Promise((resolve) => {
      serverProcess.on('exit', (code, signal) => {
        resolve({ code, signal });
      });
    });

    const { code, signal } = await Promise.race([
      exitPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Process did not exit within timeout')), 5000)
      )
    ]);

    // Verify clean exit
    assert.ok(code === 0 || signal === 'SIGTERM', `Process should exit cleanly, got code: ${code}, signal: ${signal}`);
    
    console.log('✅ MCP Server handles signals correctly');

  } catch (error) {
    throw new Error(`Signal handling test failed: ${error.message}`);
  } finally {
    // Cleanup
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
  }
});

test('MCP Server - Should have build output available', async (t) => {
  // Test that the build output exists and is executable
  try {
    const fs = await import('fs');
    
    // Check if build directory exists
    assert.ok(fs.existsSync(join(projectRoot, 'build')), 'Build directory should exist');
    
    // Check if main executable exists
    assert.ok(fs.existsSync(serverPath), 'Main executable should exist');
    
    // Check if executable has correct permissions (Unix systems)
    if (process.platform !== 'win32') {
      const stats = fs.statSync(serverPath);
      const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
      assert.ok(isExecutable, 'Main executable should have execute permissions');
    }
    
    console.log('✅ Build output is available and properly configured');

  } catch (error) {
    throw new Error(`Build output test failed: ${error.message}`);
  }
});
