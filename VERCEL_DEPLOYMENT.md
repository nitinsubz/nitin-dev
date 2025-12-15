# Deploying to Vercel

## Overview

Yes! Both your frontend and backend will be deployed to Vercel. The backend is converted to Vercel serverless functions that run automatically.

## What Changed

1. **Created `api/index.ts`** - Serverless function that handles all API routes
2. **Created `vercel.json`** - Vercel configuration
3. **Backend runs as serverless functions** - No need for a separate server!

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

```
SUPABASE_URL=https://xvdenbnvnkjwdmohkoqs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_PASSWORD=your-admin-password
VITE_SUPABASE_URL=https://xvdenbnvnkjwdmohkoqs.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=your-admin-password
```

**Important:** 
- Add these for **Production**, **Preview**, and **Development** environments
- The `VITE_*` variables are for the frontend
- The non-`VITE_*` variables are for the backend API functions

### 3. Deploy

**Option A: Using Vercel CLI**
```bash
vercel
```

**Option B: Using Git (Recommended)**
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repo to Vercel
3. Vercel will automatically deploy on every push

### 4. Update Frontend API URL (if needed)

The frontend automatically detects the API URL. If your Vercel deployment is at `https://your-app.vercel.app`, the API will be at `https://your-app.vercel.app/api`.

If you need to override this, set `VITE_API_URL` in Vercel environment variables to your full API URL.

## How It Works

### Frontend
- Built as a static site (Vite build)
- Served from Vercel's CDN
- Fast and cached

### Backend API
- Runs as serverless functions in `/api`
- Each API route (`/api/timeline`, `/api/career`, etc.) is handled by the serverless function
- Automatically scales
- No server to manage!

## API Routes

All your API routes work the same as before:
- `GET /api/timeline` - Get all timeline items
- `POST /api/timeline` - Create timeline item (requires auth)
- `PUT /api/timeline/:id` - Update timeline item (requires auth)
- `DELETE /api/timeline/:id` - Delete timeline item (requires auth)

Same for `/api/career` and `/api/shitposts`.

## Testing Locally

You can test the Vercel setup locally:

```bash
npm install -g vercel
vercel dev
```

This will:
- Start the frontend
- Run API functions locally
- Simulate the Vercel environment

## Troubleshooting

### API routes return 404
- Make sure `vercel.json` is in the root directory
- Check that `api/index.ts` exists
- Verify the build completed successfully

### Environment variables not working
- Make sure they're set in Vercel dashboard (not just `.env.local`)
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### CORS errors
- The API function includes CORS headers
- If you still see CORS errors, check that the frontend URL is allowed

### Authentication not working
- Verify `ADMIN_PASSWORD` and `VITE_ADMIN_PASSWORD` match
- Check that the Authorization header is being sent correctly

## Cost

Vercel's free tier includes:
- Unlimited serverless function invocations (with limits on execution time)
- 100GB bandwidth
- Perfect for personal projects!

## Next Steps

1. Deploy to Vercel
2. Test all functionality
3. Set up a custom domain (optional)
4. Enable automatic deployments from Git

Your app is now fully serverless! 🚀

