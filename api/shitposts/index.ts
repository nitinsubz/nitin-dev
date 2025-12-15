import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Shitpost } from '../../server/types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SHITPOSTS_TABLE = 'shitposts';

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
        .from(SHITPOSTS_TABLE)
        .select('*')
        .order('order', { ascending: false });
      
      if (error) throw error;
      
      const items = (data || []).map(item => ({
        id: item.id,
        content: item.content,
        likes: item.likes || '0',
        date: item.date,
        subtext: item.subtext,
        order: item.order || 0,
      } as Shitpost));
      
      return res.json(items);
    }

    if (req.method === 'POST') {
      if (!authenticate(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const item = req.body as Omit<Shitpost, 'id'>;
      const { data, error } = await supabase
        .from(SHITPOSTS_TABLE)
        .insert({
          content: item.content,
          likes: item.likes || '0',
          date: item.date,
          subtext: item.subtext,
          order: item.order ?? 0,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return res.json({ id: data.id, ...item });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Shitposts error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

