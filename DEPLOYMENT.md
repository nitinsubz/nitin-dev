# Deployment Guide

## Backend Deployment

Your backend server needs to be accessible for the frontend to work. You have several options:

### Option 1: Deploy Backend Separately (Recommended)

1. Deploy your backend server (e.g., to Railway, Render, Fly.io, or your own server)
2. Set `VITE_API_URL` in your build environment to point to your backend:
   ```bash
   VITE_API_URL=https://your-backend-url.com/api
   ```
3. Rebuild your frontend with this environment variable

### Option 2: Reverse Proxy (Same Domain)

If you want to serve both frontend and backend from the same domain:

1. Set up a reverse proxy (nginx, Cloudflare, etc.) to route `/api/*` to your backend
2. Deploy backend to a separate service/port
3. Configure proxy:
   ```nginx
   location /api {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
   }
   ```

### Option 3: API Subdomain

1. Deploy backend to `api.nsub.dev`
2. Set `VITE_API_URL=https://api.nsub.dev/api` in your build
3. Or update the auto-detection logic to use `api.` subdomain

## Current Issue

If you're seeing 404 errors for `/api/*` endpoints, it means:
- The backend server is not deployed/accessible
- Or the reverse proxy is not configured
- Or the backend URL needs to be set via `VITE_API_URL`

## Quick Fix

For now, you can set `VITE_API_URL` in your deployment platform's environment variables to point to where your backend is actually running.

Example:
- Backend at: `https://nitin-dev-backend.railway.app`
- Set: `VITE_API_URL=https://nitin-dev-backend.railway.app/api`
- Rebuild and redeploy frontend

