import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Sparkles, 
  Calendar, 
  ArrowDown, 
  Menu, 
  X,
  Github,
  Twitter,
  Linkedin,
  Terminal,
  Ghost,
  Settings
} from 'lucide-react';
import { useTimelineData, useCareerData, useShitpostsData } from './hooks/useSupabaseData';
import type { TimelineItem } from './supabase/types';
import AdminPanel from './components/AdminPanel';
import BlogPost from './components/BlogPost';

/**
 * COMPONENTS
 */

// Format date for display (e.g., "May 10, 2010")
const formatTimelineDate = (dateValue: string): string => {
  if (!dateValue) return 'Date TBD';
  try {
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateValue;
  }
};

// A hook to detect when an element is in view for scroll animations
const useOnScreen = (ref: React.RefObject<HTMLDivElement>, rootMargin = "0px") => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
};

// 1. TIMELINE ITEM COMPONENT
interface TimelineItemProps {
  data: TimelineItem;
  index: number;
}

const TimelineItemComponent: React.FC<TimelineItemProps> = ({ data, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, "-100px");
  const navigate = useNavigate();
  const hasMarkdown = data.markdownContent && data.markdownContent.trim().length > 0;

  const handleClick = () => {
    if (hasMarkdown && data.id) {
      navigate(`/post/${data.id}`);
    }
  };

  return (
    <div 
      ref={ref}
      className={`relative pl-8 md:pl-0 md:grid md:grid-cols-2 gap-10 mb-16 transition-all duration-1000 ease-out ${
        onScreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      }`}
    >
      {/* The Dot */}
      <div className="absolute left-0 md:left-1/2 md:-ml-3 w-6 h-6 rounded-full border-4 border-zinc-900 bg-zinc-200 z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>

      {/* Date (Left Side on Desktop, Hidden/Moved on Mobile) */}
      <div className={`md:text-right md:pr-10 ${index % 2 === 0 ? "md:order-1" : "md:order-2 md:text-left md:pl-10"}`}>
         <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono mb-2 border border-zinc-700">
            {formatTimelineDate(data.dateValue)}
         </span>
      </div>

      {/* Content Card */}
      <div className={`${index % 2 === 0 ? "md:order-2" : "md:order-1 md:text-right"}`}>
        <div 
          onClick={handleClick}
          className={`bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl transition-colors group ${
            hasMarkdown ? 'hover:border-zinc-600 cursor-pointer hover:bg-zinc-900/70' : ''
          }`}
        >
           <div className={`flex items-center gap-3 mb-2 ${index % 2 !== 0 ? "md:justify-end" : ""}`}>
              <div className={`w-2 h-2 rounded-full ${data.color}`}></div>
              <h3 className="text-xl font-bold text-zinc-100">{data.title}</h3>
           </div>
           <p className="text-zinc-400 leading-relaxed font-light">
             {data.content}
           </p>
           <div className={`mt-4 flex items-center justify-between ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
             <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
               #{data.tag}
             </span>
             {hasMarkdown && (
               <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                 Read more →
               </span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

// 2. TIMELINE PAGE (with landing section)
const Timeline: React.FC = () => {
  const { data, loading, error } = useTimelineData();
  const timelineRef = React.useRef<HTMLDivElement>(null);

  const scrollToTimeline = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-zinc-400">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          Error loading timeline. Please check your Supabase configuration.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Landing Section */}
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Hey, I'm <span className="text-emerald-400">Nitin</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-light">
            Scroll down to see what I've been up to
          </p>

          {/* Scroll indicator */}
          <div className="flex justify-center">
            <button
              onClick={scrollToTimeline}
              className="flex flex-col items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors group"
            >
              <ArrowDown 
                size={24} 
                className="animate-bounce group-hover:animate-none group-hover:translate-y-2 transition-transform" 
              />
            </button>
          </div>
        </div>

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
      </div>

      {/* Timeline Section */}
      <div ref={timelineRef} className="max-w-4xl mx-auto px-6 -mt-16 pb-20 relative">
        {/* The Central Line */}
        <div className="absolute left-3 md:left-1/2 top-0 bottom-20 w-px bg-gradient-to-b from-zinc-700 via-zinc-800 to-transparent"></div>

        <div className="space-y-12">
          {data.length === 0 ? (
            <div className="text-center text-zinc-600 py-20">
              <p>No timeline items yet. Add some in the admin panel!</p>
            </div>
          ) : (
            data.map((item, index) => (
              <TimelineItemComponent key={item.id || index} data={item} index={index} />
            ))
          )}
        </div>

        {data.length > 0 && (
          <div className="text-center mt-32 text-zinc-600 font-mono text-sm">
            <p>End of recorded history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. CAREER PAGE
const Career: React.FC = () => {
  const { data, loading, error } = useCareerData();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center text-zinc-400">Loading career history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center text-red-400">
          Error loading career data. Please check your Supabase configuration.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-12">
        Work History
      </h1>
      
      <div className="space-y-8">
        {data.length === 0 ? (
          <div className="text-center text-zinc-600 py-20">
            <p>No career items yet. Add some in the admin panel!</p>
          </div>
        ) : (
          data.map((job, idx) => (
            <div key={job.id || idx} className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:bg-zinc-800/50 transition-all duration-300">
              <div className="absolute -left-3 top-10 w-1 h-12 bg-zinc-700 group-hover:bg-white transition-colors"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{job.role}</h3>
                  <div className="text-zinc-400 flex items-center gap-2 mt-1">
                    <Briefcase size={14} />
                    <span>{job.company}</span>
                  </div>
                </div>
                <span className="mt-2 md:mt-0 px-3 py-1 bg-zinc-950 rounded border border-zinc-800 text-zinc-500 text-xs font-mono">
                  {job.period}
                </span>
              </div>
              
              <p className="text-zinc-300 mb-6 leading-relaxed">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {job.stack.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-zinc-950 text-zinc-500 text-xs rounded-full border border-zinc-800/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-20 p-8 bg-zinc-900/30 border border-dashed border-zinc-700 rounded-xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">Want to work together?</h3>
        <p className="text-zinc-400 mb-6">I'm currently open to freelance opportunities and bad jokes.</p>
        <button className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors">
          Get in Touch
        </button>
      </div>
    </div>
  );
};

// 4. UNFILTERED PAGE
const Unfiltered: React.FC = () => {
  const { data, loading, error } = useShitpostsData();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center text-zinc-400">Loading unfiltered thoughts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center text-red-400">
          Error loading posts. Please check your Supabase configuration.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
       <div className="flex items-center gap-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Unfiltered
        </h1>
        <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-mono border border-red-500/20 rounded">
          Raw Thoughts
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center text-zinc-600 py-20">
          <p>No posts yet. Add some in the admin panel!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.map((post) => (
            <div key={post.id} className="break-inside-avoid bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-pink-500/50 transition-colors">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-400"></div>
                    <span className="font-bold text-sm text-zinc-200">@me</span>
                  </div>
                  <Twitter size={14} className="text-zinc-600" />
               </div>
               <p className="text-zinc-300 text-lg font-medium mb-4">
                 {post.content}
               </p>
               {post.subtext && (
                 <p className="text-zinc-500 text-sm italic mb-4">{post.subtext}</p>
               )}
               <div className="flex items-center justify-between text-xs text-zinc-500 font-mono border-t border-zinc-800 pt-4">
                 <span>{post.date}</span>
                 <span className="flex items-center gap-1">
                   <Sparkles size={12} /> {post.likes}
                 </span>
               </div>
            </div>
          ))}
          
          {/* Random placeholder for visual variety */}
          <div className="break-inside-avoid bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-700 p-6 rounded-xl text-center min-h-[200px] flex flex-col items-center justify-center">
             <Ghost size={48} className="text-indigo-300 mb-4 animate-pulse" />
             <p className="text-indigo-200 font-bold">404: Brain cells not found</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. NAVIGATION COMPONENT
const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Timeline', icon: <Calendar size={18} /> },
    { path: '/career', label: 'Career', icon: <Briefcase size={18} /> },
    { path: '/unfiltered', label: 'Unfiltered', icon: <Terminal size={18} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/post/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          className="font-bold text-xl tracking-tighter text-white cursor-pointer hover:text-zinc-300 transition-colors"
          onClick={() => navigate('/')}
        >
          nitin.dev
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                isActive(item.path)
                  ? 'text-white scale-105' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Social Icons Desktop */}
        <div className="hidden md:flex items-center gap-4 border-l border-zinc-800 pl-6 ml-2">
           <Github size={18} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
           <Linkedin size={18} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
           <button
             onClick={() => navigate('/admin')}
             className="text-zinc-500 hover:text-white transition-colors"
             title="Admin Panel"
           >
             <Settings size={18} />
           </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-zinc-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 absolute w-full pb-6">
           <div className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-4 rounded-lg text-lg font-medium ${
                  isActive(item.path)
                    ? 'bg-zinc-900 text-white' 
                    : 'text-zinc-500'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-4 rounded-lg text-lg font-medium text-zinc-500"
            >
              <Settings size={18} />
              Admin
            </button>
           </div>
        </div>
      )}
    </nav>
  );
};

// 6. MAIN APP LAYOUT
export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-white selection:text-black">
      <Navigation />
      
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/career" element={<Career />} />
        <Route path="/unfiltered" element={<Unfiltered />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/post/:id" element={<BlogPost />} />
      </Routes>

      {/* Footer - only show on main pages */}
      <Routes>
        <Route path="/" element={
          <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 text-sm">
            <p>&copy; 2025 Personal Website. Built with React & Tailwind.</p>
          </footer>
        } />
        <Route path="/career" element={
          <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 text-sm">
            <p>&copy; 2025 Personal Website. Built with React & Tailwind.</p>
          </footer>
        } />
        <Route path="/unfiltered" element={
          <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 text-sm">
            <p>&copy; 2025 Personal Website. Built with React & Tailwind.</p>
          </footer>
        } />
      </Routes>
    </div>
  );
}
