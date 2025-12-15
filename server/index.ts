import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import type { TimelineItem, CareerItem, Shitpost } from './types.js';

// Load .env file from project root (try .env.local first, then .env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const envLocalPath = resolve(projectRoot, '.env.local');
const envPath = resolve(projectRoot, '.env');

// Try .env.local first, then .env
let result = config({ path: envLocalPath });
if (result.error) {
  result = config({ path: envPath });
  if (result.error) {
    console.warn('⚠️ Could not load .env file from either .env.local or .env');
  } else {
    console.log('✅ Loaded .env file from:', envPath);
  }
} else {
  console.log('✅ Loaded .env.local file from:', envLocalPath);
}

// Initialize Supabase client with service_role key (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Collections (table names)
const TIMELINE_TABLE = 'timeline';
const CAREER_TABLE = 'career';
const SHITPOSTS_TABLE = 'shitposts';

// ========== TIMELINE ROUTES ==========

// Get all timeline items
app.get('/api/timeline', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TIMELINE_TABLE)
      .select('*')
      .order('date_value', { ascending: false });
    
    if (error) throw error;
    
    // Map database fields to API response format
    const items = (data || []).map(item => ({
      id: item.id,
      dateValue: item.date_value,
      title: item.title,
      content: item.content,
      tag: item.tag,
      color: item.color || 'bg-emerald-500',
    } as TimelineItem));
    
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline items', details: error.message });
  }
});

// Add timeline item
app.post('/api/timeline', authenticate, async (req, res) => {
  try {
    const item = req.body as Omit<TimelineItem, 'id'>;
    
    // Ensure dateValue exists (required for sorting)
    if (!item.dateValue) {
      return res.status(400).json({ error: 'dateValue is required for sorting' });
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
    
    res.json({ id: data.id, ...item });
  } catch (error: any) {
    console.error('Error adding timeline item:', error);
    res.status(500).json({ error: 'Failed to add timeline item', details: error.message });
  }
});

// Update timeline item
app.put('/api/timeline/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
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
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating timeline item:', error);
    res.status(500).json({ error: 'Failed to update timeline item', details: error.message });
  }
});

// Delete timeline item
app.delete('/api/timeline/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from(TIMELINE_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting timeline item:', error);
    res.status(500).json({ error: 'Failed to delete timeline item', details: error.message });
  }
});

// ========== CAREER ROUTES ==========

// Get all career items
app.get('/api/career', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(CAREER_TABLE)
      .select('*')
      .order('order', { ascending: false });
    
    if (error) throw error;
    
    const items = (data || []).map(item => ({
      id: item.id,
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      stack: item.stack || [],
      order: item.order || 0,
    } as CareerItem));
    
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching career:', error);
    res.status(500).json({ error: 'Failed to fetch career items', details: error.message });
  }
});

// Add career item
app.post('/api/career', authenticate, async (req, res) => {
  try {
    const item = req.body as Omit<CareerItem, 'id'>;
    
    const { data, error } = await supabase
      .from(CAREER_TABLE)
      .insert({
        role: item.role,
        company: item.company,
        period: item.period,
        description: item.description,
        stack: item.stack || [],
        order: item.order ?? 0,
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    res.json({ id: data.id, ...item });
  } catch (error: any) {
    console.error('Error adding career item:', error);
    res.status(500).json({ error: 'Failed to add career item', details: error.message });
  }
});

// Update career item
app.put('/api/career/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
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
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating career item:', error);
    res.status(500).json({ error: 'Failed to update career item', details: error.message });
  }
});

// Delete career item
app.delete('/api/career/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from(CAREER_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting career item:', error);
    res.status(500).json({ error: 'Failed to delete career item', details: error.message });
  }
});

// ========== SHITPOSTS ROUTES ==========

// Get all shitposts
app.get('/api/shitposts', async (req, res) => {
  try {
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
    
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching shitposts:', error);
    res.status(500).json({ error: 'Failed to fetch shitposts', details: error.message });
  }
});

// Add shitpost
app.post('/api/shitposts', authenticate, async (req, res) => {
  try {
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
    
    res.json({ id: data.id, ...item });
  } catch (error: any) {
    console.error('Error adding shitpost:', error);
    res.status(500).json({ error: 'Failed to add shitpost', details: error.message });
  }
});

// Update shitpost
app.put('/api/shitposts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<Shitpost>;
    
    const updateData: any = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.likes !== undefined) updateData.likes = updates.likes;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.subtext !== undefined) updateData.subtext = updates.subtext;
    if (updates.order !== undefined) updateData.order = updates.order;
    
    const { error } = await supabase
      .from(SHITPOSTS_TABLE)
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating shitpost:', error);
    res.status(500).json({ error: 'Failed to update shitpost', details: error.message });
  }
});

// Delete shitpost
app.delete('/api/shitposts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from(SHITPOSTS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting shitpost:', error);
    res.status(500).json({ error: 'Failed to delete shitpost', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'supabase' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔷 Using Supabase: ${supabaseUrl}`);
});
