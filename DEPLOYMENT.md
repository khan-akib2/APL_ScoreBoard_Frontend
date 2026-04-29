# Deployment Guide

## Vercel Deployment

### Environment Variables

**CRITICAL:** Vercel does not automatically read `.env` files. You must manually add environment variables in the Vercel dashboard.

#### Required Environment Variables

Add these in your Vercel project settings (Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL=https://apl-scoreboard-backend.onrender.com/api
```

**Without this environment variable, the following features will NOT work in deployment:**
- Leaderboard page (`/leaderboard`)
- Awards page (`/awards`)
- Dashboard data
- Match details
- All API calls

### Steps to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://apl-scoreboard-backend.onrender.com/api`
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

### Verifying Deployment

After deployment, test these routes:
- `/leaderboard` - Should show team rankings
- `/awards` - Should show tournament awards
- `/dashboard` - Should load match data
- `/matches` - Should show match list

If any of these show "No data" or fail to load, the environment variable is not set correctly.

### Common Issues

**Issue:** Leaderboard/Awards showing in local but not in deployment
**Solution:** Add `NEXT_PUBLIC_API_URL` to Vercel environment variables and redeploy

**Issue:** API calls returning errors in production
**Solution:** Verify the backend URL is correct and accessible from Vercel's servers

**Issue:** Changes to `.env` not reflecting in deployment
**Solution:** `.env` files are not deployed. Always set environment variables in Vercel dashboard.
