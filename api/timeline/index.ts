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
      
      const items = (data || []).map(item => ({
        id: item.id,
        dateValue: item.date_value,
        title: item.title,
        content: item.content,
        tag: item.tag,
        color: item.color || 'bg-emerald-500',
      } as TimelineItem));
      
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

      const { data, error } = await supabase
        .from(TIMELINE_TABLE)
        .insert({
          date_value: item.dateValue,
          title: item.title,
          content: item.content,
          tag: item.tag,
          color: item.color || 'bg-emerald-500',
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return res.json({ id: data.id, ...item });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Timeline error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

