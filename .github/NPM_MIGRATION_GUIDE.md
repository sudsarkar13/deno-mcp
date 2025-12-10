# NPM Authentication Migration Guide

**⚠️ URGENT ACTION REQUIRED**

This guide provides immediate steps to fix npm authentication issues caused by the December 9, 2025 npm security update that permanently revoked all classic tokens.

## 🚨 Critical Issue

**What happened:** npm permanently revoked all classic tokens on December 9, 2025. Your CI/CD pipeline will fail to publish packages until this is fixed.

**Impact:** Automated releases are broken and will fail with authentication errors.

**Solution:** Replace classic tokens with granular access tokens.

## ⏰ Immediate Action Plan

### Step 1: Create New Granular Access Token (5 minutes)

**Option A: Using npm CLI (Recommended)**

```bash
# 1. Login to npm (creates 2-hour session)
npm login

# 2. Create granular access token
npm token create --read-write --cidr=0.0.0.0/0 --description="GitHub Actions CI/CD deno-mcp $(date +%Y-%m-%d)"

# 3. Copy the generated token (starts with npm_...)
# IMPORTANT: Save this token immediately - it won't be shown again
```

**Option B: Using npm Website**

1. Visit: <https://www.npmjs.com/settings/~/tokens>
2. Click "Generate New Token"
3. Select "Granular Access Token"
4. Configure:
   - **Token Name**: `GitHub Actions CI/CD deno-mcp`
   - **Expiration**: 90 days (maximum allowed)
   - **Packages**: Select `@sudsarkar13/deno-mcp`
   - **Permissions**: Read and write
   - **IP Allowlist**: Leave empty (0.0.0.0/0)
   - **2FA Bypass**: ✅ Enable (required for CI/CD)
5. Click "Generate Token"
6. **Copy the token immediately** (starts with `npm_`)

### Step 2: Update GitHub Repository Secret (2 minutes)

1. **Navigate to repository secrets:**
   - Go to: <https://github.com/sudsarkar13/deno-mcp/settings/secrets/actions>

2. **Update NPM_TOKEN secret:**
   - Find the `NPM_TOKEN` secret
   - Click "Update"
   - Paste the new granular access token
   - Click "Update secret"

3. **Verify the secret is updated:**
   - The secret should show "Updated X seconds ago"

### Step 3: Test the Fix (5 minutes)

**Test with a dummy release:**

```bash
# 1. Clone your repository
git clone https://github.com/sudsarkar13/deno-mcp.git
cd deno-mcp

# 2. Create a test tag
git tag test-npm-auth-v$(date +%s)

# 3. Push the tag to trigger CI/CD
git push origin test-npm-auth-v$(date +%s)

# 4. Monitor the GitHub Actions
# Go to: https://github.com/sudsarkar13/deno-mcp/actions
# Watch for the publish-npm job to succeed

# 5. Clean up test tag after verification
git tag -d test-npm-auth-v$(date +%s)
git push origin --delete test-npm-auth-v$(date +%s)
```

## 🔧 Verification Checklist

- [ ] New granular access token created
- [ ] GitHub secret `NPM_TOKEN` updated with new token
- [ ] Test CI/CD pipeline passes
- [ ] NPM publish job succeeds
- [ ] Package appears on npm registry
- [ ] Test tag cleaned up

## 🚨 If You Still Have Issues

### Common Error Messages and Solutions

**Error**: `npm ERR! 403 Forbidden`
**Solution**: Token permissions incorrect. Ensure:

- Token type is "Granular Access Token"
- Permissions are "Read and write"
- Package scope includes `@sudsarkar13/deno-mcp`
- 2FA Bypass is enabled

**Error**: `npm ERR! need auth`
**Solution**: Token not properly set in GitHub secrets. Double-check:

- Secret name is exactly `NPM_TOKEN`
- Token value starts with `npm_`
- No extra spaces or characters

**Error**: `npm ERR! publish failed, need 2-factor auth`
**Solution**: 2FA bypass not enabled. Update token settings:

- Go to npm token settings
- Enable "Bypass 2FA" for the token

### Emergency Contact

If you continue having issues:

1. Check GitHub Actions logs for detailed error messages
2. Verify token permissions on npm website
3. Contact: <sudsarkar13@gmail.com>

## 📅 Token Rotation Schedule

**⚠️ IMPORTANT**: Granular tokens expire every 90 days maximum.

**Set up calendar reminders:**

- **Next rotation**: 60 days from today
- **Reminder**: "Rotate npm token for deno-mcp project"
- **Include**: Link to this guide

**Rotation Process:**

1. Create new granular token (same process as above)
2. Update GitHub secret
3. Test with dummy release
4. Revoke old token: `npm token revoke <old-token-id>`

## 🔒 Long-term Security Recommendation

**Consider OIDC Trusted Publishing** (most secure, no token management):

1. **Benefits:**
   - No token rotation needed
   - Enhanced security
   - No secrets management

2. **Setup** (future enhancement):
   - Configure trusted publisher on npm
   - Update CI/CD workflow for OIDC
   - Remove token-based authentication

3. **Timeline:**
   - Current: Use granular tokens (immediate fix)
   - Future: Migrate to OIDC when ready

## 📋 Quick Reference Commands

```bash
# Create token
npm token create --read-write --cidr=0.0.0.0/0 --description="GitHub Actions CI/CD"

# List tokens
npm token list

# Revoke token
npm token revoke <token-id>

# Test authentication
npm whoami

# Test CI/CD
git tag test-v$(date +%s) && git push origin test-v$(date +%s)
```

---

**Status**: ✅ Complete this migration immediately to restore automated releases.

**Estimated Time**: 15 minutes total

**Priority**: 🚨 CRITICAL - Blocks all releases until fixed

---

*This guide addresses the npm security update from December 9, 2025. Keep this document for future token rotations.*
