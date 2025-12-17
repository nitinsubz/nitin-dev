# Fix: Markdown Content Not Saving

## Issue
Markdown content isn't being saved when you add or edit timeline items.

## Most Likely Cause
The `markdown_content` column doesn't exist in your Supabase database yet.

## Solution

### Step 1: Run the Database Migration

Go to your Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE timeline 
ADD COLUMN IF NOT EXISTS markdown_content TEXT;
```

**Or** copy and paste the contents of `SUPABASE_MARKDOWN_MIGRATION.sql`

### Step 2: Verify the Column Exists

Run this query to check:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'timeline' 
AND column_name = 'markdown_content';
```

You should see a row with `markdown_content` and `text`.

### Step 3: Test Again

1. Go to Admin Panel
2. Edit a timeline item
3. Add markdown content
4. Save
5. Refresh and check if it saved

## If It Still Doesn't Work

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try saving markdown content
4. Look for any error messages

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try saving markdown content
4. Click on the API request
5. Check:
   - **Request Payload** - Does it include `markdownContent`?
   - **Response** - What error message does it show?

### Check Vercel/Server Logs
If deployed on Vercel:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to Functions tab
4. Check the logs for errors

If running locally:
- Check your terminal where the backend server is running
- Look for error messages

## Common Errors

### Error: "column markdown_content does not exist"
**Solution:** Run the migration SQL above.

### Error: "permission denied"
**Solution:** Check your RLS policies allow updates. The backend uses service_role key which should bypass RLS, but verify your environment variables are set correctly.

### No Error, But Content Doesn't Save
**Solution:** 
1. Check that `markdownContent` is being sent in the request (Network tab)
2. Verify the column exists in the database
3. Check if there are any character limits or constraints

## Still Having Issues?

Share:
1. The error message (if any)
2. What you see in the browser console
3. What you see in the network request/response
4. Whether the column exists in your database

