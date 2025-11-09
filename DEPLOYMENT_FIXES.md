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

### 1. Trust Proxy Configuration (`thinkSyncBE/app.js`)
- Added `app.set('trust proxy', 1)` - **CRITICAL for Railway**
- This ensures Express correctly detects HTTPS behind Railway's proxy
- Without this, `req.secure` will be false and secure cookies won't be set

### 2. Session Configuration (`thinkSyncBE/config/session.js`)
- Moved `name` outside cookie config (required by express-session)
- Set `sameSite: "none"` for cross-site cookies in production
- Set `secure: true` in production (required when sameSite is "none")
- Set `path: "/"` to ensure cookie is sent with all requests
- Set `saveUninitialized: true` to ensure session is created before authentication

### 2a. Partitioned Cookie Attribute (`thinkSyncBE/app.js`)
- Added middleware to inject `Partitioned` attribute into session cookies
- **CRITICAL**: Modern browsers (Chrome 127+, Firefox) require `Partitioned` for third-party cookies
- Without this attribute, cookies will be rejected by the browser
- The middleware intercepts Set-Cookie headers and adds `; Partitioned` to session cookies

### 3. CORS Configuration (`thinkSyncBE/app.js`)
- Updated to support multiple origins (comma-separated)
- Added proper headers for credentials
- Updated Socket.IO CORS to match

### 4. Passport Middleware Order (`thinkSyncBE/app.js`)
- **CRITICAL FIX**: Moved `setupPassport()` BEFORE `passport.session()` middleware
- This ensures serializeUser/deserializeUser are registered before Passport tries to use them
- Without this, sessions exist but `req.user` is never populated, causing 401 errors

### 5. Login Route (`thinkSyncBE/routes/auth.routes.js`)
- Added explicit session save before sending response
- Ensured session is properly created and saved
- Added debugging logs to track passport session data

### 6. OAuth Callback (`thinkSyncBE/routes/auth.routes.js`)
- Added session save before redirect
- Fixed redirect URL to handle multiple origins
- Added error handling

### 7. Vercel Configuration (`thinkSyncFE/vercel.json`)
- Added rewrite rules for SPA routing
- Added security headers

### 8. Frontend Auth Context (`thinkSyncFE/src/contexts/AuthContext.jsx`)
- Exposed `refreshAuth()` function to allow components to refresh auth state
- Made `fetchUser` reusable so it can be called after login

### 9. Frontend Login (`thinkSyncFE/src/components/Login.jsx`)
- Added authentication check after OAuth callback
- Fixed Google login URL construction
- Added redirect if already authenticated
- Added user data fetch after login to verify session

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
- **CRITICAL**: Verify `app.set('trust proxy', 1)` is set in app.js (already done)
- Verify `CORS_ORIGIN` is set correctly in Railway: `https://thinksync.me`
- Check that backend URL uses HTTPS (required for Secure cookies)
- Verify `SESSION_SECRET` is set
- Verify `NODE_ENV=production` is set in Railway
- Check browser console for cookie warnings
- Test the `/api/v1/test-session` endpoint to see if sessions work

### 401 Errors after login
- Verify cookies are being sent in requests (check Network tab > Headers > Request Headers)
- Check that `withCredentials: true` is set in axios config (already done)
- Verify CORS allows credentials
- Check browser DevTools > Application > Cookies to see if `thinksync.sid` is present
- Verify the cookie has `SameSite=None; Secure` attributes

### Session not persisting
- Check Railway logs for "Session save error" messages
- Verify database connection is working (sessions are stored in PostgreSQL)
- Check that `user_sessions` table exists in database
- Test with `/api/v1/test-session` endpoint

### Vercel 404 on refresh
- Ensure `vercel.json` is in the frontend root directory
- Redeploy on Vercel after adding vercel.json

### OAuth redirect issues
- Verify Google OAuth callback URL in Google Console matches: `https://thinksync.up.railway.app/api/v1/auth/google/callback`
- Check that `CORS_ORIGIN` is set to `https://thinksync.me` (without trailing slash)

### Debugging Steps
1. Check Railway logs after login attempt - look for "Login successful - Session ID:" message
2. Check browser Network tab - verify `Set-Cookie` header is present in login response
3. Check browser Application > Cookies - verify `thinksync.sid` cookie exists with correct attributes
4. Test `/api/v1/test-session` endpoint to verify session creation works
5. Check `/health` endpoint to verify environment variables are set correctly

