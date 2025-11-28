import { useState, useEffect } from 'react';
import { timelineAPI, careerAPI, shitpostsAPI } from '../services/api';
import type { TimelineItem, CareerItem, Shitpost } from '../firebase/types';

export const useTimelineData = () => {
  const [data, setData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const items = await timelineAPI.getAll();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching timeline data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await timelineAPI.getAll();
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const items = await careerAPI.getAll();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching career data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await careerAPI.getAll();
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const items = await shitpostsAPI.getAll();
        setData(items);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching shitposts data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: async () => {
      try {
        setLoading(true);
        const items = await shitpostsAPI.getAll();
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

