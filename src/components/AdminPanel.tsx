import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Lock,
  Calendar,
  Briefcase,
  Terminal
} from 'lucide-react';
import { timelineAPI, careerAPI, shitpostsAPI } from '../services/api';
import type { TimelineItem, CareerItem, Shitpost } from '../supabase/types';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

// Format date for display (e.g., "May 10, 2010")
const formatDate = (dateValue: string): string => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'career' | 'unfiltered'>('timeline');
  
  // Timeline state
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [editingTimeline, setEditingTimeline] = useState<string | null>(null);
  const [newTimelineItem, setNewTimelineItem] = useState<Partial<TimelineItem>>({
    dateValue: '',
    title: '',
    content: '',
    markdownContent: ''
  });

  // Career state
  const [careerItems, setCareerItems] = useState<CareerItem[]>([]);
  const [editingCareer, setEditingCareer] = useState<string | null>(null);
  const [newCareerItem, setNewCareerItem] = useState<Partial<CareerItem>>({
    role: '',
    company: '',
    period: '',
    description: '',
    stack: [],
    order: 0
  });
  const [newStackItem, setNewStackItem] = useState('');

  // Shitposts state
  const [shitposts, setShitposts] = useState<Shitpost[]>([]);
  const [editingShitpost, setEditingShitpost] = useState<string | null>(null);
  const [newShitpost, setNewShitpost] = useState<Partial<Shitpost>>({
    content: '',
    likes: '0',
    date: '',
    subtext: '',
    order: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [timeline, career, posts] = await Promise.all([
        timelineAPI.getAll(),
        careerAPI.getAll(),
        shitpostsAPI.getAll()
      ]);
      console.log('Loaded timeline items from API:', timeline.length, 'items');
      console.log('Timeline items summary:', timeline.map(item => ({
        id: item.id,
        title: item.title,
        hasMarkdown: !!item.markdownContent,
        markdownLength: item.markdownContent?.length || 0,
        markdownValue: item.markdownContent ? item.markdownContent.substring(0, 50) + '...' : 'null/undefined',
        allKeys: Object.keys(item)
      })));
      if (timeline.length > 0) {
        console.log('Full first item from API:', JSON.stringify(timeline[0], null, 2));
        console.log('First item markdownContent type:', typeof timeline[0].markdownContent);
        console.log('First item markdownContent value:', timeline[0].markdownContent);
      }
      setTimelineItems(timeline);
      setCareerItems(career);
      setShitposts(posts);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Make sure your backend server is running and Supabase is configured correctly.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  // Timeline handlers
  const handleAddTimeline = async () => {
    if (!newTimelineItem.dateValue || !newTimelineItem.title || !newTimelineItem.content) {
      alert('Please fill in all required fields, especially the date');
      return;
    }
    try {
      const itemToCreate: Omit<TimelineItem, 'id'> = {
        dateValue: newTimelineItem.dateValue!,
        title: newTimelineItem.title!,
        content: newTimelineItem.content!,
        markdownContent: newTimelineItem.markdownContent || undefined, // Explicitly include
      };
      
      console.log('Creating timeline item:', {
        item: itemToCreate,
        hasMarkdown: !!itemToCreate.markdownContent,
        markdownLength: itemToCreate.markdownContent?.length || 0,
        markdownValue: itemToCreate.markdownContent
      });
      
      await timelineAPI.create(itemToCreate);
      setNewTimelineItem({ dateValue: '', title: '', content: '', markdownContent: '' });
      loadData();
    } catch (error: any) {
      console.error('Error adding timeline item:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Error adding item: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  };

  const handleUpdateTimeline = async (id: string) => {
    try {
      const item = timelineItems.find(i => i.id === id);
      if (item) {
        // Build update payload explicitly to ensure all fields are included
        const updatePayload: Partial<TimelineItem> = {
          dateValue: item.dateValue,
          title: item.title,
          content: item.content,
          // Send a string (never null) to satisfy TS types; empty string clears content
          markdownContent: item.markdownContent ?? '',
        };
        
        console.log('Updating timeline item:', {
          id,
          originalItem: item,
          updatePayload,
          hasMarkdown: updatePayload.markdownContent !== null && updatePayload.markdownContent !== undefined,
          markdownLength: updatePayload.markdownContent?.length || 0,
          markdownValue: updatePayload.markdownContent,
          payloadString: JSON.stringify(updatePayload)
        });
        
        await timelineAPI.update(id, updatePayload);
        setEditingTimeline(null);
        loadData();
      }
    } catch (error: any) {
      console.error('Error updating timeline item:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Error updating item: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await timelineAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      alert('Error deleting item. Make sure your backend server is running and configured correctly.');
    }
  };

  // Career handlers
  const handleAddCareer = async () => {
    if (!newCareerItem.role || !newCareerItem.company || !newCareerItem.period) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await careerAPI.create(newCareerItem as Omit<CareerItem, 'id'>);
      setNewCareerItem({ role: '', company: '', period: '', description: '', stack: [], order: 0 });
      setNewStackItem('');
      loadData();
    } catch (error) {
      console.error('Error adding career item:', error);
      alert('Error adding item. Make sure your backend server is running and configured correctly.');
    }
  };

  const handleAddStackItem = () => {
    if (newStackItem.trim()) {
      setNewCareerItem({
        ...newCareerItem,
        stack: [...(newCareerItem.stack || []), newStackItem.trim()]
      });
      setNewStackItem('');
    }
  };

  const handleRemoveStackItem = (index: number) => {
    const stack = newCareerItem.stack || [];
    setNewCareerItem({ ...newCareerItem, stack: stack.filter((_, i) => i !== index) });
  };

  const handleUpdateCareer = async (id: string) => {
    try {
      const item = careerItems.find(i => i.id === id);
      if (item) {
        const { id: _, ...updates } = item;
        await careerAPI.update(id, updates);
        setEditingCareer(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating career item:', error);
      alert('Error updating item. Make sure your backend server is running and configured correctly.');
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await careerAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting career item:', error);
      alert('Error deleting item. Make sure your backend server is running and configured correctly.');
    }
  };

  // Shitposts handlers
  const handleAddShitpost = async () => {
    if (!newShitpost.content || !newShitpost.date) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await shitpostsAPI.create(newShitpost as Omit<Shitpost, 'id'>);
      setNewShitpost({ content: '', likes: '0', date: '', subtext: '', order: 0 });
      loadData();
    } catch (error) {
      console.error('Error adding shitpost:', error);
      alert('Error adding item. Make sure your backend server is running and configured correctly.');
    }
  };

  const handleUpdateShitpost = async (id: string) => {
    try {
      const item = shitposts.find(i => i.id === id);
      if (item) {
        const { id: _, ...updates } = item;
        await shitpostsAPI.update(id, updates);
        setEditingShitpost(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating shitpost:', error);
      alert('Error updating item. Make sure your backend server is running and configured correctly.');
    }
  };

  const handleDeleteShitpost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await shitpostsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting shitpost:', error);
      alert('Error deleting item. Make sure your backend server is running and configured correctly.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={24} className="text-zinc-400" />
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Login
            </button>
          </form>
          <p className="text-xs text-zinc-600 mt-4 text-center">
            Set VITE_ADMIN_PASSWORD in .env file to change password
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          {(['timeline', 'career', 'unfiltered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'timeline' && <Calendar size={18} className="inline mr-2" />}
              {tab === 'career' && <Briefcase size={18} className="inline mr-2" />}
              {tab === 'unfiltered' && <Terminal size={18} className="inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Add New Timeline Item</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={newTimelineItem.dateValue || ''}
                    onChange={(e) => setNewTimelineItem({ ...newTimelineItem, dateValue: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                  {newTimelineItem.dateValue && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Will display as: {formatDate(newTimelineItem.dateValue)}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  value={newTimelineItem.title || ''}
                  onChange={(e) => setNewTimelineItem({ ...newTimelineItem, title: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Content (Short preview/excerpt)"
                  value={newTimelineItem.content || ''}
                  onChange={(e) => setNewTimelineItem({ ...newTimelineItem, content: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white md:col-span-2"
                  rows={3}
                />
                <textarea
                  placeholder="Markdown Content (Full blog post - supports markdown)"
                  value={newTimelineItem.markdownContent ?? ''}
                  onChange={(e) => setNewTimelineItem({ ...newTimelineItem, markdownContent: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white md:col-span-2 font-mono text-sm"
                  rows={10}
                />
              </div>
              <button
                onClick={handleAddTimeline}
                className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Timeline Item
              </button>
            </div>

            <div className="space-y-4">
              {timelineItems.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  {editingTimeline === item.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">Date</label>
                        <input
                          type="date"
                          value={item.dateValue || ''}
                          onChange={(e) => {
                            const updated = timelineItems.map(i => 
                              i.id === item.id ? { ...i, dateValue: e.target.value } : i
                            );
                            setTimelineItems(updated);
                          }}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                        {item.dateValue && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Will display as: {formatDate(item.dateValue)}
                          </p>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = timelineItems.map(i => 
                            i.id === item.id ? { ...i, title: e.target.value } : i
                          );
                          setTimelineItems(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      />
                      <textarea
                        placeholder="Content (Short preview/excerpt)"
                        value={item.content}
                        onChange={(e) => {
                          const updated = timelineItems.map(i => 
                            i.id === item.id ? { ...i, content: e.target.value } : i
                          );
                          setTimelineItems(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        rows={3}
                      />
                      <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                          Markdown Content (Full blog post)
                          {item.markdownContent !== undefined && item.markdownContent !== null && (
                            <span className="ml-2 text-emerald-400 text-xs">
                              ({item.markdownContent.length} chars loaded)
                            </span>
                          )}
                        </label>
                        <textarea
                          placeholder="Write your full blog post in markdown..."
                          value={item.markdownContent ?? ''}
                          onChange={(e) => {
                            console.log('Markdown changed for item', item.id, 'new length:', e.target.value.length);
                            const updated = timelineItems.map(i => 
                              i.id === item.id ? { ...i, markdownContent: e.target.value } : i
                            );
                            setTimelineItems(updated);
                          }}
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm"
                          rows={12}
                        />
                        <div className="mt-1 text-xs">
                          {item.markdownContent !== undefined && item.markdownContent !== null ? (
                            <p className="text-emerald-400">
                              ✓ Markdown content loaded ({item.markdownContent.length} characters)
                            </p>
                          ) : (
                            <p className="text-zinc-500">
                              No markdown content (value: {String(item.markdownContent)})
                            </p>
                          )}
                          <p className="text-zinc-500 mt-1">
                            Supports markdown: **bold**, *italic*, links, code blocks, lists, etc.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTimeline(item.id!)}
                          className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTimeline(null)}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                            {item.dateValue ? formatDate(item.dateValue) : 'No date'}
                          </span>
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          {item.markdownContent && (
                            <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs rounded border border-emerald-800">
                              Has Markdown
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 mb-2">{item.content}</p>
                        {item.markdownContent && (
                          <p className="text-xs text-zinc-500 mt-2">
                            Markdown: {item.markdownContent.length} characters
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingTimeline(item.id!)}
                          className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTimeline(item.id!)}
                          className="p-2 bg-red-900/30 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Tab */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Add New Career Item</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Role"
                  value={newCareerItem.role || ''}
                  onChange={(e) => setNewCareerItem({ ...newCareerItem, role: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newCareerItem.company || ''}
                  onChange={(e) => setNewCareerItem({ ...newCareerItem, company: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Period (e.g., 2023 - Present)"
                  value={newCareerItem.period || ''}
                  onChange={(e) => setNewCareerItem({ ...newCareerItem, period: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                />
                <textarea
                  placeholder="Description"
                  value={newCareerItem.description || ''}
                  onChange={(e) => setNewCareerItem({ ...newCareerItem, description: e.target.value })}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white md:col-span-2"
                  rows={3}
                />
                <div className="md:col-span-2">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add technology"
                      value={newStackItem}
                      onChange={(e) => setNewStackItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStackItem()}
                      className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddStackItem}
                      className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg hover:bg-zinc-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(newCareerItem.stack || []).map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full flex items-center gap-2">
                        {tech}
                        <button
                          onClick={() => handleRemoveStackItem(idx)}
                          className="text-zinc-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddCareer}
                className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Career Item
              </button>
            </div>

            <div className="space-y-4">
              {careerItems.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  {editingCareer === item.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={item.role}
                        onChange={(e) => {
                          const updated = careerItems.map(i => 
                            i.id === item.id ? { ...i, role: e.target.value } : i
                          );
                          setCareerItems(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={item.company}
                        onChange={(e) => {
                          const updated = careerItems.map(i => 
                            i.id === item.id ? { ...i, company: e.target.value } : i
                          );
                          setCareerItems(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          const updated = careerItems.map(i => 
                            i.id === item.id ? { ...i, description: e.target.value } : i
                          );
                          setCareerItems(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCareer(item.id!)}
                          className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCareer(null)}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{item.role}</h3>
                        <p className="text-zinc-400 mb-2">{item.company} • {item.period}</p>
                        <p className="text-zinc-300 mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.stack.map((tech, idx) => (
                            <span key={idx} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingCareer(item.id!)}
                          className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCareer(item.id!)}
                          className="p-2 bg-red-900/30 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unfiltered Tab */}
        {activeTab === 'unfiltered' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Add New Post</h2>
              <div className="space-y-4">
                <textarea
                  placeholder="Content"
                  value={newShitpost.content || ''}
                  onChange={(e) => setNewShitpost({ ...newShitpost, content: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Likes (e.g., 420, 1.2k)"
                    value={newShitpost.likes || ''}
                    onChange={(e) => setNewShitpost({ ...newShitpost, likes: e.target.value })}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Date (e.g., 2h ago, 1d ago)"
                    value={newShitpost.date || ''}
                    onChange={(e) => setNewShitpost({ ...newShitpost, date: e.target.value })}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Subtext (optional)"
                    value={newShitpost.subtext || ''}
                    onChange={(e) => setNewShitpost({ ...newShitpost, subtext: e.target.value })}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleAddShitpost}
                className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Post
              </button>
            </div>

            <div className="space-y-4">
              {shitposts.map((item) => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  {editingShitpost === item.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={item.content}
                        onChange={(e) => {
                          const updated = shitposts.map(i => 
                            i.id === item.id ? { ...i, content: e.target.value } : i
                          );
                          setShitposts(updated);
                        }}
                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        rows={3}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={item.likes}
                          onChange={(e) => {
                            const updated = shitposts.map(i => 
                              i.id === item.id ? { ...i, likes: e.target.value } : i
                            );
                            setShitposts(updated);
                          }}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => {
                            const updated = shitposts.map(i => 
                              i.id === item.id ? { ...i, date: e.target.value } : i
                            );
                            setShitposts(updated);
                          }}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                        <input
                          type="text"
                          value={item.subtext || ''}
                          onChange={(e) => {
                            const updated = shitposts.map(i => 
                              i.id === item.id ? { ...i, subtext: e.target.value } : i
                            );
                            setShitposts(updated);
                          }}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateShitpost(item.id!)}
                          className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingShitpost(null)}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-zinc-300 mb-2">{item.content}</p>
                        {item.subtext && <p className="text-zinc-500 text-sm italic mb-2">{item.subtext}</p>}
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{item.date}</span>
                          <span>{item.likes} likes</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingShitpost(item.id!)}
                          className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteShitpost(item.id!)}
                          className="p-2 bg-red-900/30 border border-red-800 rounded-lg hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

