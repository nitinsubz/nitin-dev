# Supabase Setup Guide

This guide will walk you through setting up Supabase to replace Firebase for your website.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `nitin-dev` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon) → **API**
2. You'll need these values:
   - **Project URL**: `https://xxxxx.supabase.co` (copy this)
   - **anon/public key**: The `anon` key (starts with `eyJ...`)
   - **service_role key**: The `service_role` key (starts with `eyJ...`) - **Keep this secret!**

Save these values - you'll need them for your `.env` file.

## Step 3: Create Database Tables

Go to **SQL Editor** in the Supabase dashboard and run these SQL commands:

### Create Timeline Table

```sql
-- Create timeline table
CREATE TABLE timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date_value TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT,
  color TEXT DEFAULT 'bg-emerald-500',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX idx_timeline_date_value ON timeline(date_value DESC);

-- Enable Row Level Security
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
```

### Create Career Table

```sql
-- Create career table
CREATE TABLE career (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  stack TEXT[] DEFAULT '{}',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX idx_career_order ON career("order" DESC);

-- Enable Row Level Security
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
```

### Create Shitposts Table

```sql
-- Create shitposts table
CREATE TABLE shitposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  likes TEXT DEFAULT '0',
  date TEXT,
  subtext TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX idx_shitposts_order ON shitposts("order" DESC);

-- Enable Row Level Security
ALTER TABLE shitposts ENABLE ROW LEVEL SECURITY;
```

## Step 4: Set Up Row Level Security (RLS) Policies

These policies allow:
- **Public read access** (anyone can view the data)
- **Write access only via service_role key** (your backend server)

Run these SQL commands in the SQL Editor:

### Timeline Policies

```sql
-- Allow public read access
CREATE POLICY "Allow public read access on timeline"
  ON timeline FOR SELECT
  USING (true);

-- Deny all writes from client (only backend can write)
CREATE POLICY "Deny client writes on timeline"
  ON timeline FOR ALL
  USING (false);
```

### Career Policies

```sql
-- Allow public read access
CREATE POLICY "Allow public read access on career"
  ON career FOR SELECT
  USING (true);

-- Deny all writes from client (only backend can write)
CREATE POLICY "Deny client writes on career"
  ON career FOR ALL
  USING (false);
```

### Shitposts Policies

```sql
-- Allow public read access
CREATE POLICY "Allow public read access on shitposts"
  ON shitposts FOR SELECT
  USING (true);

-- Deny all writes from client (only backend can write)
CREATE POLICY "Deny client writes on shitposts"
  ON shitposts FOR ALL
  USING (false);
```

## Step 5: Create Updated At Trigger (Optional but Recommended)

This automatically updates the `updated_at` timestamp when records are modified:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to timeline table
CREATE TRIGGER update_timeline_updated_at
  BEFORE UPDATE ON timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to career table
CREATE TRIGGER update_career_updated_at
  BEFORE UPDATE ON career
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to shitposts table
CREATE TRIGGER update_shitposts_updated_at
  BEFORE UPDATE ON shitposts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 6: Environment Variables

Create or update your `.env` file in the project root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend (Server) Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Password (for backend authentication)
ADMIN_PASSWORD=your-admin-password-here
VITE_ADMIN_PASSWORD=your-admin-password-here
```

**Important Notes:**
- Replace `xxxxx` with your actual Supabase project reference ID
- The `anon` key is safe to expose in the frontend
- The `service_role` key should **NEVER** be exposed in the frontend - only use it in your backend server
- Add `.env` to your `.gitignore` if it's not already there

## Step 7: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables: `timeline`, `career`, and `shitposts`
3. Try adding a test row manually to verify the structure

## Step 8: Migrate Existing Data (If You Have Any)

If you have existing Firebase data, you'll need to:

1. Export your Firebase data (from Firebase Console)
2. Import it into Supabase using the SQL Editor or Table Editor
3. Make sure field names match:
   - Firebase `dateValue` → Supabase `date_value`
   - Firebase `order` → Supabase `order` (same)

## Next Steps

Once you've completed these steps, let me know and I'll help you:
1. Update the frontend code to use Supabase
2. Update the backend server to use Supabase
3. Remove Firebase dependencies
4. Test everything works correctly

## Troubleshooting

### Can't see tables?
- Make sure you ran all the SQL commands successfully
- Check the SQL Editor for any error messages

### RLS policies not working?
- Make sure you enabled RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check that policies are created: Go to **Authentication** → **Policies**

### Connection issues?
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active (not paused)

