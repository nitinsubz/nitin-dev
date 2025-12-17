-- Check if markdown_content column exists
-- Run this in Supabase SQL Editor

-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'timeline' 
AND column_name = 'markdown_content';

-- If the above returns no rows, the column doesn't exist. Run this:
ALTER TABLE timeline 
ADD COLUMN IF NOT EXISTS markdown_content TEXT;

-- Verify it was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'timeline' 
AND column_name = 'markdown_content';

-- Test: Try to insert a test value
-- UPDATE timeline SET markdown_content = 'test' WHERE id = 'YOUR_ID_HERE';
-- Then check: SELECT id, title, markdown_content FROM timeline WHERE id = 'YOUR_ID_HERE';

