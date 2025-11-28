import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import type { TimelineItem, CareerItem, Shitpost } from './types';

// Collections
const TIMELINE_COLLECTION = 'timeline';
const CAREER_COLLECTION = 'career';
const SHITPOSTS_COLLECTION = 'shitposts';

// Test Firebase connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    const testSnapshot = await getDocs(collection(db, TIMELINE_COLLECTION));
    console.log('✅ Firebase connection successful. Documents found:', testSnapshot.docs.length);
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 PERMISSION DENIED: Check your Firestore security rules!');
      console.error('See FIRESTORE_SETUP.md for instructions on updating rules.');
    }
    return false;
  }
};

// Timeline Services
export const getTimelineItems = async (): Promise<TimelineItem[]> => {
  try {
    const q = query(collection(db, TIMELINE_COLLECTION), orderBy('order', 'desc'));
    const querySnapshot = await getDocs(q);
    console.log('Timeline query successful, docs:', querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimelineItem));
  } catch (error: any) {
    // If orderBy fails (no index or no order field), try without orderBy
    console.warn('OrderBy query failed, trying without order:', error);
    if (error.code === 'permission-denied') {
      console.error('🔒 PERMISSION DENIED: Check your Firestore security rules!');
      throw error;
    }
    const querySnapshot = await getDocs(collection(db, TIMELINE_COLLECTION));
    console.log('Timeline query (no orderBy) successful, docs:', querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimelineItem));
  }
};

// Real-time listener for timeline items
export const subscribeTimelineItems = (
  callback: (items: TimelineItem[]) => void
): (() => void) => {
  console.log('Setting up timeline subscription...');
  
  try {
    // Start with simple collection query to avoid index issues
    const unsubscribe = onSnapshot(
      collection(db, TIMELINE_COLLECTION),
      (snapshot) => {
        console.log('Timeline snapshot received, docs:', snapshot.docs.length);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TimelineItem));
        
        // Sort by dateValue (newest first)
        items.sort((a, b) => {
          const dateA = a.dateValue || '';
          const dateB = b.dateValue || '';
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.localeCompare(dateA); // Descending order (newest first)
        });
        
        console.log('Timeline items processed:', items.length);
        callback(items);
      },
      (error) => {
        console.error('Error in timeline subscription:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        // Try to fetch once on error
        getTimelineItems()
          .then(items => {
            console.log('Fallback fetch successful, items:', items.length);
            callback(items);
          })
          .catch(fetchError => {
            console.error('Fallback fetch also failed:', fetchError);
            callback([]);
          });
      }
    );
    
    console.log('Timeline subscription set up successfully');
    return unsubscribe;
  } catch (error) {
    console.error('Failed to set up timeline subscription:', error);
    // Fallback to one-time fetch
    getTimelineItems()
      .then(items => callback(items))
      .catch(() => callback([]));
    // Return no-op unsubscribe
    return () => {};
  }
};

export const addTimelineItem = async (item: Omit<TimelineItem, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, TIMELINE_COLLECTION), item);
  return docRef.id;
};

export const updateTimelineItem = async (id: string, item: Partial<TimelineItem>): Promise<void> => {
  await updateDoc(doc(db, TIMELINE_COLLECTION, id), item);
};

export const deleteTimelineItem = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, TIMELINE_COLLECTION, id));
};

// Career Services
export const getCareerItems = async (): Promise<CareerItem[]> => {
  try {
    const q = query(collection(db, CAREER_COLLECTION), orderBy('order', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CareerItem));
  } catch (error) {
    console.warn('OrderBy query failed, trying without order:', error);
    const querySnapshot = await getDocs(collection(db, CAREER_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CareerItem));
  }
};

// Real-time listener for career items
export const subscribeCareerItems = (
  callback: (items: CareerItem[]) => void
): (() => void) => {
  const unsubscribe = onSnapshot(
    collection(db, CAREER_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CareerItem));
      
      items.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderB - orderA;
      });
      
      callback(items);
    },
    (error) => {
      console.error('Error in career subscription:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

export const addCareerItem = async (item: Omit<CareerItem, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, CAREER_COLLECTION), item);
  return docRef.id;
};

export const updateCareerItem = async (id: string, item: Partial<CareerItem>): Promise<void> => {
  await updateDoc(doc(db, CAREER_COLLECTION, id), item);
};

export const deleteCareerItem = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, CAREER_COLLECTION, id));
};

// Shitposts Services
export const getShitposts = async (): Promise<Shitpost[]> => {
  try {
    const q = query(collection(db, SHITPOSTS_COLLECTION), orderBy('order', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Shitpost));
  } catch (error) {
    console.warn('OrderBy query failed, trying without order:', error);
    const querySnapshot = await getDocs(collection(db, SHITPOSTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Shitpost));
  }
};

// Real-time listener for shitposts
export const subscribeShitposts = (
  callback: (items: Shitpost[]) => void
): (() => void) => {
  const unsubscribe = onSnapshot(
    collection(db, SHITPOSTS_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Shitpost));
      
      items.sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderB - orderA;
      });
      
      callback(items);
    },
    (error) => {
      console.error('Error in shitposts subscription:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

export const addShitpost = async (item: Omit<Shitpost, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, SHITPOSTS_COLLECTION), item);
  return docRef.id;
};

export const updateShitpost = async (id: string, item: Partial<Shitpost>): Promise<void> => {
  await updateDoc(doc(db, SHITPOSTS_COLLECTION, id), item);
};

export const deleteShitpost = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, SHITPOSTS_COLLECTION, id));
};

