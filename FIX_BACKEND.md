# Fix Backend Server Issue

## Problem
The admin panel can't load data because the backend server isn't running or isn't configured correctly.

## Issue Found
Your `.env` file has `SUPABASE_SERVICE_ROLE_KEY` set to the same value as `VITE_SUPABASE_ANON_KEY`. This is **incorrect**.

## Solution

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Find the **`service_role`** key (NOT the `anon` key)
5. Copy this key - it's different from the anon key and starts with `eyJ...`

**⚠️ Important:** The service_role key has admin privileges and should NEVER be exposed in the frontend. Only use it in your backend server.

### Step 2: Update Your .env File

Update your `.env` file with the correct service role key:

```env
# Supabase Configuration (Frontend)
VITE_SUPABASE_URL=https://xvdenbnvnkjwdmohkoqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZGVuYm52bmtqd2Rtb2hrb3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTUzODAsImV4cCI6MjA4MTIzMTM4MH0.aQvS1xK7YVtfBjjKOR1IWxt7ueceagAj8tayh1jugRk

# Backend (Server) Configuration
SUPABASE_URL=https://xvdenbnvnkjwdmohkoqs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE  # ← Replace this!

# Admin Password
ADMIN_PASSWORD=nitin
VITE_ADMIN_PASSWORD=nitin
```

### Step 3: Start the Backend Server

In a terminal, run:

```bash
npm run dev:server
```

You should see:
```
🚀 Server running on http://localhost:3001
📝 API endpoints available at http://localhost:3001/api
🔷 Using Supabase: https://xvdenbnvnkjwdmohkoqs.supabase.co
```

### Step 4: Test the Admin Panel

1. Make sure the backend server is running
2. Refresh your browser
3. Go to the admin panel (Settings)
4. It should now load the data

## Alternative: Run Both Servers Together

You can run both frontend and backend together:

```bash
npm run dev:all
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`

## Troubleshooting

### Server won't start
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in your `.env`
- Make sure the service role key is correct (not the anon key)
- Check the terminal for error messages

### "Unauthorized" errors
- Make sure `ADMIN_PASSWORD` matches `VITE_ADMIN_PASSWORD`
- The password you enter in the admin panel should match these values

### Still getting errors?
- Check the browser console (F12) for frontend errors
- Check the backend server terminal for backend errors
- Verify your Supabase tables exist and RLS policies are set correctly

