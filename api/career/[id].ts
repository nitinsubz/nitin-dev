import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { CareerItem } from '../../../server/types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CAREER_TABLE = 'career';

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

      const updates = req.body as Partial<CareerItem>;
      const updateData: any = {};
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.period !== undefined) updateData.period = updates.period;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.stack !== undefined) updateData.stack = updates.stack;
      if (updates.order !== undefined) updateData.order = updates.order;

      const { error } = await supabase
        .from(CAREER_TABLE)
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
        .from(CAREER_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Career error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

