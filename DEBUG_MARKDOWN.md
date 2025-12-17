# Debug: Markdown Not Saving

## Step 1: Check Database Column

Run this in Supabase SQL Editor:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'timeline' 
AND column_name = 'markdown_content';

-- If it doesn't exist, create it:
ALTER TABLE timeline 
ADD COLUMN IF NOT EXISTS markdown_content TEXT;
```

## Step 2: Test Directly in Browser Console

Open your browser console (F12) and run:

```javascript
// Test if markdownContent is in the data
fetch('/api/timeline')
  .then(r => r.json())
  .then(data => {
    console.log('Timeline items:', data);
    console.log('First item markdown:', data[0]?.markdownContent);
  });
```

## Step 3: Check Network Request

1. Open DevTools (F12)
2. Go to Network tab
3. Clear the network log
4. Edit a timeline item and add markdown
5. Click Save
6. Find the PUT or POST request to `/api/timeline`
7. Click on it
8. Check:
   - **Request Payload** - Does it have `markdownContent`?
   - **Response** - What does it say?

## Step 4: Test API Directly

Test the API endpoint directly:

```bash
# Replace YOUR_ID and YOUR_PASSWORD
curl -X PUT https://nsub.dev/api/timeline/YOUR_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -d '{
    "title": "Test",
    "content": "Test content",
    "markdownContent": "# Test Markdown\n\nThis is a test.",
    "tag": "test",
    "color": "bg-emerald-500",
    "dateValue": "2025-01-01"
  }'
```

## Step 5: Check Vercel Logs

If deployed on Vercel:
1. Go to Vercel Dashboard
2. Your Project → Functions
3. Click on a recent function invocation
4. Check the logs for errors

## Common Issues

### Issue: Column doesn't exist
**Solution:** Run the ALTER TABLE command above

### Issue: Data sent but not saved
**Check:** 
- Vercel function logs
- Supabase logs
- RLS policies (shouldn't matter with service_role key)

### Issue: Data saved but not loaded
**Check:**
- GET request response
- API route mapping (markdown_content → markdownContent)

## Quick Test

Try this in the admin panel:
1. Edit an existing timeline item
2. Add this markdown: `# Test`
3. Save
4. Open browser console
5. You should see logs showing the markdown being sent
6. Refresh the page
7. Check if the markdown is still there

If you see the logs but it doesn't save, the issue is in the API/database.
If you don't see the logs, the issue is in the frontend.

