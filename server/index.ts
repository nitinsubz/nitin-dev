import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import type { TimelineItem, CareerItem, Shitpost } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and save it as server/serviceAccountKey.json
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple authentication middleware (you can enhance this)
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Collections
const TIMELINE_COLLECTION = 'timeline';
const CAREER_COLLECTION = 'career';
const SHITPOSTS_COLLECTION = 'shitposts';

// ========== TIMELINE ROUTES ==========

// Get all timeline items
app.get('/api/timeline', async (req, res) => {
  try {
    let snapshot;
    try {
      snapshot = await db.collection(TIMELINE_COLLECTION)
        .orderBy('dateValue', 'desc')
        .get();
    } catch (error) {
      // If orderBy fails (no index or missing dateValue field), get all and sort manually
      console.warn('OrderBy failed, fetching all and sorting manually:', error);
      snapshot = await db.collection(TIMELINE_COLLECTION).get();
    }
    
    const items = snapshot.docs.map(doc => {
      const data = doc.data() as TimelineItem;
      // If dateValue is missing, use a default
      if (!data.dateValue) {
        data.dateValue = '1900-01-01';
      }
      return {
        id: doc.id,
        ...data
      } as TimelineItem;
    });
    
    // Sort by dateValue (newest first)
    items.sort((a, b) => {
      const dateA = a.dateValue || '1900-01-01';
      const dateB = b.dateValue || '1900-01-01';
      return dateB.localeCompare(dateA); // Descending order (newest first)
    });
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline items' });
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
    const docRef = await db.collection(TIMELINE_COLLECTION).add(item);
    res.json({ id: docRef.id, ...item });
  } catch (error) {
    console.error('Error adding timeline item:', error);
    res.status(500).json({ error: 'Failed to add timeline item' });
  }
});

// Update timeline item
app.put('/api/timeline/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<TimelineItem>;
    await db.collection(TIMELINE_COLLECTION).doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating timeline item:', error);
    res.status(500).json({ error: 'Failed to update timeline item' });
  }
});

// Delete timeline item
app.delete('/api/timeline/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(TIMELINE_COLLECTION).doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    res.status(500).json({ error: 'Failed to delete timeline item' });
  }
});

// ========== CAREER ROUTES ==========

// Get all career items
app.get('/api/career', async (req, res) => {
  try {
    let snapshot;
    try {
      snapshot = await db.collection(CAREER_COLLECTION)
        .orderBy('order', 'desc')
        .get();
    } catch (error) {
      console.warn('OrderBy failed, fetching all and sorting manually:', error);
      snapshot = await db.collection(CAREER_COLLECTION).get();
    }
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CareerItem));
    
    items.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderB - orderA;
    });
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching career:', error);
    res.status(500).json({ error: 'Failed to fetch career items' });
  }
});

// Add career item
app.post('/api/career', authenticate, async (req, res) => {
  try {
    const item = req.body as Omit<CareerItem, 'id'>;
    const itemWithOrder = {
      ...item,
      order: item.order ?? 0
    };
    const docRef = await db.collection(CAREER_COLLECTION).add(itemWithOrder);
    res.json({ id: docRef.id, ...itemWithOrder });
  } catch (error) {
    console.error('Error adding career item:', error);
    res.status(500).json({ error: 'Failed to add career item' });
  }
});

// Update career item
app.put('/api/career/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<CareerItem>;
    await db.collection(CAREER_COLLECTION).doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating career item:', error);
    res.status(500).json({ error: 'Failed to update career item' });
  }
});

// Delete career item
app.delete('/api/career/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(CAREER_COLLECTION).doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting career item:', error);
    res.status(500).json({ error: 'Failed to delete career item' });
  }
});

// ========== SHITPOSTS ROUTES ==========

// Get all shitposts
app.get('/api/shitposts', async (req, res) => {
  try {
    let snapshot;
    try {
      snapshot = await db.collection(SHITPOSTS_COLLECTION)
        .orderBy('order', 'desc')
        .get();
    } catch (error) {
      console.warn('OrderBy failed, fetching all and sorting manually:', error);
      snapshot = await db.collection(SHITPOSTS_COLLECTION).get();
    }
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Shitpost));
    
    items.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderB - orderA;
    });
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching shitposts:', error);
    res.status(500).json({ error: 'Failed to fetch shitposts' });
  }
});

// Add shitpost
app.post('/api/shitposts', authenticate, async (req, res) => {
  try {
    const item = req.body as Omit<Shitpost, 'id'>;
    const itemWithOrder = {
      ...item,
      order: item.order ?? 0
    };
    const docRef = await db.collection(SHITPOSTS_COLLECTION).add(itemWithOrder);
    res.json({ id: docRef.id, ...itemWithOrder });
  } catch (error) {
    console.error('Error adding shitpost:', error);
    res.status(500).json({ error: 'Failed to add shitpost' });
  }
});

// Update shitpost
app.put('/api/shitposts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<Shitpost>;
    await db.collection(SHITPOSTS_COLLECTION).doc(id).update(updates);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating shitpost:', error);
    res.status(500).json({ error: 'Failed to update shitpost' });
  }
});

// Delete shitpost
app.delete('/api/shitposts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(SHITPOSTS_COLLECTION).doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shitpost:', error);
    res.status(500).json({ error: 'Failed to delete shitpost' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});

