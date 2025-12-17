-- Migration: Add markdown_content column to timeline table
-- Run this in your Supabase SQL Editor

ALTER TABLE timeline 
ADD COLUMN IF NOT EXISTS markdown_content TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN timeline.markdown_content IS 'Full markdown content for blog post. If provided, clicking the timeline item will show a full blog post page.';

