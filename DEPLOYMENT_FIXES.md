# Deployment Fixes for Cross-Site Cookie Issues

## Issues Fixed

1. **Cookie SameSite Configuration** - Fixed session cookie settings for cross-site requests
2. **CORS Configuration** - Updated to properly handle Vercel domain
3. **Vercel SPA Routing** - Added vercel.json to fix 404 errors on refresh
4. **OAuth Callback** - Ensured session is saved before redirecting
5. **Frontend Auth Check** - Added authentication check after OAuth callback

## Environment Variables Required

### Backend (Railway)

Make sure these environment variables are set in your Railway deployment:

```env
# Session Configuration
SESSION_SECRET=your-secret-key-here
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://thinksync.me
# OR if you need multiple origins (comma-separated):
# CORS_ORIGIN=https://thinksync.me,https://www.thinksync.me

# Database
DATABASE_URL=your-postgres-connection-string

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Other required variables...
```

### Frontend (Vercel)

Make sure these environment variables are set in your Vercel deployment:

```env
VITE_BACKEND_URL=https://thinksync.up.railway.app/api/v1
VITE_FRONTEND_URL=https://thinksync.me
```

## Key Changes Made

### 1. Session Configuration (`thinkSyncBE/config/session.js`)
- Moved `name` outside cookie config (required by express-session)
- Set `sameSite: "none"` for cross-site cookies
- Set `secure: true` (required when sameSite is "none")
- Set `path: "/"` to ensure cookie is sent with all requests
- Changed `saveUninitialized: false` to only save authenticated sessions

### 2. CORS Configuration (`thinkSyncBE/app.js`)
- Updated to support multiple origins (comma-separated)
- Added proper headers for credentials
- Updated Socket.IO CORS to match

### 3. OAuth Callback (`thinkSyncBE/routes/auth.routes.js`)
- Added session save before redirect
- Fixed redirect URL to handle multiple origins
- Added error handling

### 4. Vercel Configuration (`thinkSyncFE/vercel.json`)
- Added rewrite rules for SPA routing
- Added security headers

### 5. Frontend Login (`thinkSyncFE/src/components/Login.jsx`)
- Added authentication check after OAuth callback
- Fixed Google login URL construction
- Added redirect if already authenticated

## Testing Checklist

After deploying, verify:

1. ✅ Cookies are being set with `SameSite=None; Secure`
2. ✅ Cookies are visible in browser DevTools (Application > Cookies)
3. ✅ OAuth login redirects properly and sets session
4. ✅ Regular login works and sets session
5. ✅ API requests include cookies (check Network tab)
6. ✅ No 401 errors after login
7. ✅ Page refresh doesn't show 404 errors
8. ✅ User stays logged in after refresh

## Troubleshooting

### Cookies still not being set
- Verify `CORS_ORIGIN` is set correctly in Railway
- Check that backend URL uses HTTPS (required for Secure cookies)
- Verify `SESSION_SECRET` is set
- Check browser console for cookie warnings

### 401 Errors after login
- Verify cookies are being sent in requests (check Network tab)
- Check that `withCredentials: true` is set in axios config (already done)
- Verify CORS allows credentials

### Vercel 404 on refresh
- Ensure `vercel.json` is in the frontend root directory
- Redeploy on Vercel after adding vercel.json

### OAuth redirect issues
- Verify Google OAuth callback URL in Google Console matches: `https://thinksync.up.railway.app/api/v1/auth/google/callback`
- Check that `CORS_ORIGIN` is set to `https://thinksync.me` (without trailing slash)

