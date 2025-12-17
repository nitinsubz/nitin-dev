import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { TimelineItem } from '../../server/types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TIMELINE_TABLE = 'timeline';

const authenticate = (req: VercelRequest): boolean => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return authHeader === `Bearer ${adminPassword}`;
};

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }

  setCorsHeaders(res);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(TIMELINE_TABLE)
        .select('*')
        .order('date_value', { ascending: false });
      
      if (error) throw error;
      
      const items = (data || []).map((item, index) => {
        const mapped = {
          id: item.id,
          dateValue: item.date_value,
          title: item.title,
          content: item.content,
          markdownContent: item.markdown_content ?? undefined, // Use nullish coalescing to preserve null
          tag: item.tag,
          color: item.color || 'bg-emerald-500',
        } as TimelineItem;
        
        // Debug log for first item
        if (index === 0) {
          console.log('Mapping first timeline item:', {
            original: {
              id: item.id,
              markdown_content: item.markdown_content,
              markdown_content_type: typeof item.markdown_content,
              markdown_content_length: item.markdown_content?.length
            },
            mapped: {
              id: mapped.id,
              markdownContent: mapped.markdownContent,
              markdownContent_type: typeof mapped.markdownContent,
              markdownContent_length: mapped.markdownContent?.length
            }
          });
        }
        
        return mapped;
      });
      
      console.log('API returning timeline items:', items.length, 'items');
      if (items.length > 0) {
        console.log('First item markdownContent:', items[0].markdownContent ? `${items[0].markdownContent.substring(0, 50)}...` : 'null/undefined');
      }
      
      return res.json(items);
    }

    if (req.method === 'POST') {
      if (!authenticate(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const item = req.body as Omit<TimelineItem, 'id'>;
      if (!item.dateValue) {
        return res.status(400).json({ error: 'dateValue is required' });
      }

      console.log('Creating timeline item with markdown:', {
        item,
        hasMarkdown: !!item.markdownContent,
        markdownLength: item.markdownContent?.length || 0,
        markdownValue: item.markdownContent
      });

      const insertData: any = {
        date_value: item.dateValue,
        title: item.title,
        content: item.content,
        tag: item.tag,
        color: item.color || 'bg-emerald-500',
        markdown_content: item.markdownContent ?? null, // Use nullish coalescing
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from(TIMELINE_TABLE)
        .insert(insertData)
        .select('id, markdown_content') // Select markdown_content to verify
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }
      
      console.log('Insert successful, created:', data);
      return res.json({ id: data.id, ...item });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Timeline error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

