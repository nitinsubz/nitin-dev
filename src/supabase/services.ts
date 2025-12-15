import { supabase } from './config';
import type { TimelineItem, CareerItem, Shitpost } from './types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Collections (table names)
const TIMELINE_TABLE = 'timeline';
const CAREER_TABLE = 'career';
const SHITPOSTS_TABLE = 'shitposts';

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from(TIMELINE_TABLE)
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// ========== TIMELINE SERVICES ==========

export const getTimelineItems = async (): Promise<TimelineItem[]> => {
  try {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      console.warn('⚠️ Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from(TIMELINE_TABLE)
      .select('*')
      .order('date_value', { ascending: false });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Map database fields to our types (date_value -> dateValue)
    return (data || []).map(item => ({
      id: item.id,
      dateValue: item.date_value,
      title: item.title,
      content: item.content,
      tag: item.tag,
      color: item.color || 'bg-emerald-500',
    } as TimelineItem));
  } catch (error: any) {
    console.error('Error fetching timeline items:', error);
    // Return empty array instead of throwing to prevent white screen
    return [];
  }
};

// Real-time listener for timeline items
export const subscribeTimelineItems = (
  callback: (items: TimelineItem[]) => void
): (() => void) => {
  console.log('Setting up timeline subscription...');
  
  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('⚠️ Supabase not configured, skipping subscription');
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  let channel: RealtimeChannel;
  
  try {
    channel = supabase
      .channel('timeline-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TIMELINE_TABLE,
        },
        async () => {
          // Fetch fresh data when changes occur
          try {
            const items = await getTimelineItems();
            callback(items);
          } catch (error) {
            console.error('Error in timeline subscription callback:', error);
            callback([]);
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error('Error setting up subscription:', error);
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  // Initial fetch
  getTimelineItems()
    .then(items => {
      console.log('Timeline items fetched:', items.length);
      callback(items);
    })
    .catch(error => {
      console.error('Error in initial timeline fetch:', error);
      callback([]);
    });
  
  // Return unsubscribe function
  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error removing channel:', error);
    }
  };
};

export const addTimelineItem = async (item: Omit<TimelineItem, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from(TIMELINE_TABLE)
    .insert({
      date_value: item.dateValue,
      title: item.title,
      content: item.content,
      tag: item.tag,
      color: item.color,
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
};

export const updateTimelineItem = async (id: string, item: Partial<TimelineItem>): Promise<void> => {
  const updates: any = {};
  if (item.dateValue !== undefined) updates.date_value = item.dateValue;
  if (item.title !== undefined) updates.title = item.title;
  if (item.content !== undefined) updates.content = item.content;
  if (item.tag !== undefined) updates.tag = item.tag;
  if (item.color !== undefined) updates.color = item.color;
  
  const { error } = await supabase
    .from(TIMELINE_TABLE)
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteTimelineItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TIMELINE_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ========== CAREER SERVICES ==========

export const getCareerItems = async (): Promise<CareerItem[]> => {
  try {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      console.warn('⚠️ Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from(CAREER_TABLE)
      .select('*')
      .order('order', { ascending: false });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      stack: item.stack || [],
      order: item.order || 0,
    } as CareerItem));
  } catch (error: any) {
    console.error('Error fetching career items:', error);
    // Return empty array instead of throwing to prevent white screen
    return [];
  }
};

// Real-time listener for career items
export const subscribeCareerItems = (
  callback: (items: CareerItem[]) => void
): (() => void) => {
  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('⚠️ Supabase not configured, skipping subscription');
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  let channel: RealtimeChannel;
  
  try {
    channel = supabase
      .channel('career-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: CAREER_TABLE,
        },
        async () => {
          try {
            const items = await getCareerItems();
            callback(items);
          } catch (error) {
            console.error('Error in career subscription callback:', error);
            callback([]);
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error('Error setting up subscription:', error);
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  // Initial fetch
  getCareerItems()
    .then(items => callback(items))
    .catch(() => callback([]));
  
  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error removing channel:', error);
    }
  };
};

export const addCareerItem = async (item: Omit<CareerItem, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .insert({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      stack: item.stack || [],
      order: item.order || 0,
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
};

export const updateCareerItem = async (id: string, item: Partial<CareerItem>): Promise<void> => {
  const updates: any = {};
  if (item.role !== undefined) updates.role = item.role;
  if (item.company !== undefined) updates.company = item.company;
  if (item.period !== undefined) updates.period = item.period;
  if (item.description !== undefined) updates.description = item.description;
  if (item.stack !== undefined) updates.stack = item.stack;
  if (item.order !== undefined) updates.order = item.order;
  
  const { error } = await supabase
    .from(CAREER_TABLE)
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteCareerItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(CAREER_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ========== SHITPOSTS SERVICES ==========

export const getShitposts = async (): Promise<Shitpost[]> => {
  try {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      console.warn('⚠️ Supabase not configured, returning empty array');
      return [];
    }

    const { data, error } = await supabase
      .from(SHITPOSTS_TABLE)
      .select('*')
      .order('order', { ascending: false });
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return (data || []).map(item => ({
      id: item.id,
      content: item.content,
      likes: item.likes || '0',
      date: item.date,
      subtext: item.subtext,
      order: item.order || 0,
    } as Shitpost));
  } catch (error: any) {
    console.error('Error fetching shitposts:', error);
    // Return empty array instead of throwing to prevent white screen
    return [];
  }
};

// Real-time listener for shitposts
export const subscribeShitposts = (
  callback: (items: Shitpost[]) => void
): (() => void) => {
  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('⚠️ Supabase not configured, skipping subscription');
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  let channel: RealtimeChannel;
  
  try {
    channel = supabase
      .channel('shitposts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SHITPOSTS_TABLE,
        },
        async () => {
          try {
            const items = await getShitposts();
            callback(items);
          } catch (error) {
            console.error('Error in shitposts subscription callback:', error);
            callback([]);
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error('Error setting up subscription:', error);
    callback([]);
    return () => {}; // Return no-op unsubscribe
  }
  
  // Initial fetch
  getShitposts()
    .then(items => callback(items))
    .catch(() => callback([]));
  
  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('Error removing channel:', error);
    }
  };
};

export const addShitpost = async (item: Omit<Shitpost, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from(SHITPOSTS_TABLE)
    .insert({
      content: item.content,
      likes: item.likes || '0',
      date: item.date,
      subtext: item.subtext,
      order: item.order || 0,
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
};

export const updateShitpost = async (id: string, item: Partial<Shitpost>): Promise<void> => {
  const updates: any = {};
  if (item.content !== undefined) updates.content = item.content;
  if (item.likes !== undefined) updates.likes = item.likes;
  if (item.date !== undefined) updates.date = item.date;
  if (item.subtext !== undefined) updates.subtext = item.subtext;
  if (item.order !== undefined) updates.order = item.order;
  
  const { error } = await supabase
    .from(SHITPOSTS_TABLE)
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteShitpost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(SHITPOSTS_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

