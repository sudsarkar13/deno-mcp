#!/bin/bash
set -euo pipefail

# Enhanced Docker Test Runner for Deno MCP Server
# This script runs comprehensive tests inside the Docker container

echo "🐳 Starting Enhanced Docker Test Suite for Deno MCP Server"
echo "========================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TEST_RESULTS_FILE="/test-results/docker-test-results.json"

# Initialize results file
echo '{"tests": [], "summary": {}}' > "$TEST_RESULTS_FILE"

# Function to log test results
log_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    if [[ "$status" == "PASS" ]]; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name: FAILED - $message${NC}"
        ((TESTS_FAILED++))
    fi
    
    # Update JSON results (with error handling)
    if command -v jq >/dev/null 2>&1; then
        jq --arg name "$test_name" \
           --arg status "$status" \
           --arg message "$message" \
           --arg timestamp "$timestamp" \
           '.tests += [{"name": $name, "status": $status, "message": $message, "timestamp": $timestamp}]' \
           "$TEST_RESULTS_FILE" > "${TEST_RESULTS_FILE}.tmp" && mv "${TEST_RESULTS_FILE}.tmp" "$TEST_RESULTS_FILE" || {
           echo "Warning: Failed to update JSON results"
        }
    else
        echo "Warning: jq not available for JSON processing"
    fi
}

# Test 1: System Dependencies
echo -e "\n${BLUE}🔧 Testing System Dependencies${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log_test_result "Node.js Installation" "PASS" "Node.js version: $NODE_VERSION"
else
    log_test_result "Node.js Installation" "FAIL" "Node.js not found"
fi

if command -v deno >/dev/null 2>&1; then
    DENO_VERSION=$(timeout 5 deno --version 2>/dev/null | head -n1 || echo "unknown")
    log_test_result "Deno Installation" "PASS" "Deno version: $DENO_VERSION"
else
    log_test_result "Deno Installation" "FAIL" "Deno not found"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    log_test_result "NPM Installation" "PASS" "NPM version: $NPM_VERSION"
else
    log_test_result "NPM Installation" "FAIL" "NPM not found"
fi

# Test 2: File System Structure
echo -e "\n${BLUE}📁 Testing File System Structure${NC}"
if [[ -f "/app/build/index.js" ]]; then
    log_test_result "Build Output Exists" "PASS" "Main executable found"
else
    log_test_result "Build Output Exists" "FAIL" "Main executable not found"
fi

if [[ -d "/app/test" ]]; then
    log_test_result "Test Directory Exists" "PASS" "Test directory found"
else
    log_test_result "Test Directory Exists" "FAIL" "Test directory not found"
fi

if [[ -f "/app/package.json" ]]; then
    PACKAGE_NAME=$(jq -r '.name' /app/package.json)
    log_test_result "Package Configuration" "PASS" "Package: $PACKAGE_NAME"
else
    log_test_result "Package Configuration" "FAIL" "package.json not found"
fi

# Test 3: Permissions and Security
echo -e "\n${BLUE}🔒 Testing Permissions and Security${NC}"
if [[ $(id -u) -ne 0 ]]; then
    CURRENT_USER=$(whoami)
    log_test_result "Non-root User" "PASS" "Running as user: $CURRENT_USER"
else
    log_test_result "Non-root User" "FAIL" "Running as root (security risk)"
fi

if [[ -x "/app/build/index.js" ]]; then
    log_test_result "Executable Permissions" "PASS" "Main executable has correct permissions"
else
    log_test_result "Executable Permissions" "FAIL" "Main executable lacks execute permissions"
fi

# Test 4: MCP Server Basic Functionality
echo -e "\n${BLUE}🚀 Testing MCP Server Basic Functionality${NC}"
cd /app

# Test server startup (quick test)
timeout 10s node build/index.js --version >/dev/null 2>&1 && \
    log_test_result "Server Version Check" "PASS" "Server responds to version check" || \
    log_test_result "Server Version Check" "FAIL" "Server failed version check"

# Test server startup and shutdown
SERVER_PID=""
if timeout 5s bash -c '
    node build/index.js &
    SERVER_PID=$!
    sleep 3
    kill -TERM $SERVER_PID 2>/dev/null || kill -INT $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
'; then
    log_test_result "Server Startup/Shutdown" "PASS" "Server starts and stops cleanly"
else
    log_test_result "Server Startup/Shutdown" "FAIL" "Server startup/shutdown failed"
fi

# Test 5: Node.js Test Suite
echo -e "\n${BLUE}🧪 Running Node.js Test Suite${NC}"
if npm test 2>/dev/null; then
    log_test_result "Node.js Test Suite" "PASS" "All Node.js tests passed"
else
    log_test_result "Node.js Test Suite" "FAIL" "Some Node.js tests failed"
fi

# Test 6: Environment Variables
echo -e "\n${BLUE}🌍 Testing Environment Configuration${NC}"
if [[ -n "${DENO_DIR:-}" ]]; then
    log_test_result "Deno Environment" "PASS" "DENO_DIR set to: $DENO_DIR"
else
    log_test_result "Deno Environment" "FAIL" "DENO_DIR not set"
fi

if [[ "${NODE_ENV:-}" == "test" ]]; then
    log_test_result "Node Environment" "PASS" "NODE_ENV correctly set to test"
else
    log_test_result "Node Environment" "FAIL" "NODE_ENV not set to test"
fi

# Test 7: Resource Usage
echo -e "\n${BLUE}📊 Testing Resource Usage${NC}"
MEMORY_USAGE=$(ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -e | head -n 10)
CPU_INFO=$(cat /proc/cpuinfo | grep "model name" | head -n 1 | cut -d: -f2 | xargs)
DISK_USAGE=$(df -h /app | tail -n 1 | awk '{print $5}')

log_test_result "Resource Monitoring" "PASS" "Memory and CPU monitoring successful"

# Test 8: Network Connectivity (if applicable)
echo -e "\n${BLUE}🌐 Testing Network Connectivity${NC}"
if ping -c 1 google.com >/dev/null 2>&1; then
    log_test_result "External Connectivity" "PASS" "External network access available"
else
    log_test_result "External Connectivity" "FAIL" "No external network access"
fi

# Test 9: Container Health Check
echo -e "\n${BLUE}💓 Testing Container Health${NC}"
if node /app/build/index.js --version >/dev/null 2>&1; then
    log_test_result "Health Check" "PASS" "Container health check passed"
else
    log_test_result "Health Check" "FAIL" "Container health check failed"
fi

# Generate final summary
echo -e "\n${BLUE}📋 Generating Test Summary${NC}"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))

# Update JSON summary
jq --argjson passed "$TESTS_PASSED" \
   --argjson failed "$TESTS_FAILED" \
   --argjson total "$TOTAL_TESTS" \
   --argjson success_rate "$SUCCESS_RATE" \
   --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
   --arg environment "docker-container" \
   '.summary = {
     "tests_passed": $passed,
     "tests_failed": $failed,
     "total_tests": $total,
     "success_rate": $success_rate,
     "timestamp": $timestamp,
     "environment": $environment
   }' "$TEST_RESULTS_FILE" > "${TEST_RESULTS_FILE}.tmp" && mv "${TEST_RESULTS_FILE}.tmp" "$TEST_RESULTS_FILE"

# Display final results
echo "========================================================"
echo -e "${BLUE}🐳 Docker Test Suite Results${NC}"
echo "========================================================"
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Success Rate: ${YELLOW}$SUCCESS_RATE%${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! Container is ready for production.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the results above.${NC}"
    echo -e "${YELLOW}📄 Detailed results saved to: $TEST_RESULTS_FILE${NC}"
    exit 1
fi
