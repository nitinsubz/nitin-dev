import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { TimelineItem } from '../../../server/types.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }

  setCorsHeaders(res);

  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    if (req.method === 'PUT') {
      if (!authenticate(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates = req.body as Partial<TimelineItem>;
      const updateData: any = {};
      if (updates.dateValue !== undefined) updateData.date_value = updates.dateValue;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.tag !== undefined) updateData.tag = updates.tag;
      if (updates.color !== undefined) updateData.color = updates.color;

      const { error } = await supabase
        .from(TIMELINE_TABLE)
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      return res.json({ success: true });
    }

    if (req.method === 'DELETE') {
      if (!authenticate(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from(TIMELINE_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Timeline error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

