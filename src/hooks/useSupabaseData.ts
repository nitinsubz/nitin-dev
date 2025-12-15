import { useState, useEffect } from 'react';
import { 
  getTimelineItems, 
  getCareerItems, 
  getShitposts,
  subscribeTimelineItems,
  subscribeCareerItems,
  subscribeShitposts
} from '../supabase/services';
import type { TimelineItem, CareerItem, Shitpost } from '../supabase/types';

export const useTimelineData = () => {
  const [data, setData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Set up real-time listener
    const unsubscribe = subscribeTimelineItems((items) => {
      setData(items);
      setError(null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await getTimelineItems();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching timeline data:', err);
      } finally {
        setLoading(false);
      }
    }
  };
};

export const useCareerData = () => {
  const [data, setData] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Set up real-time listener
    const unsubscribe = subscribeCareerItems((items) => {
      setData(items);
      setError(null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await getCareerItems();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching career data:', err);
      } finally {
        setLoading(false);
      }
    }
  };
};

export const useShitpostsData = () => {
  const [data, setData] = useState<Shitpost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Set up real-time listener
    const unsubscribe = subscribeShitposts((items) => {
      setData(items);
      setError(null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await getShitposts();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching shitposts data:', err);
      } finally {
        setLoading(false);
      }
    }
  };
};

