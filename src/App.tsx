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

// Get color classes based on index for systematic color assignment
const getTimelineColorClasses = (index: number) => {
  const colorSets = [
    { border: 'border-emerald-500/30', borderHover: 'hover:border-emerald-500/60', shadow: 'hover:shadow-emerald-500/20', text: 'group-hover:text-emerald-400', borderDivider: 'group-hover:border-emerald-500/30', gradient: 'from-emerald-500/10 via-emerald-400/10 to-emerald-600/10' },
    { border: 'border-blue-500/30', borderHover: 'hover:border-blue-500/60', shadow: 'hover:shadow-blue-500/20', text: 'group-hover:text-blue-400', borderDivider: 'group-hover:border-blue-500/30', gradient: 'from-blue-500/10 via-blue-400/10 to-blue-600/10' },
    { border: 'border-purple-500/30', borderHover: 'hover:border-purple-500/60', shadow: 'hover:shadow-purple-500/20', text: 'group-hover:text-purple-400', borderDivider: 'group-hover:border-purple-500/30', gradient: 'from-purple-500/10 via-purple-400/10 to-purple-600/10' },
    { border: 'border-cyan-500/30', borderHover: 'hover:border-cyan-500/60', shadow: 'hover:shadow-cyan-500/20', text: 'group-hover:text-cyan-400', borderDivider: 'group-hover:border-cyan-500/30', gradient: 'from-cyan-500/10 via-cyan-400/10 to-cyan-600/10' },
    { border: 'border-indigo-500/30', borderHover: 'hover:border-indigo-500/60', shadow: 'hover:shadow-indigo-500/20', text: 'group-hover:text-indigo-400', borderDivider: 'group-hover:border-indigo-500/30', gradient: 'from-indigo-500/10 via-indigo-400/10 to-indigo-600/10' },
    { border: 'border-rose-500/30', borderHover: 'hover:border-rose-500/60', shadow: 'hover:shadow-rose-500/20', text: 'group-hover:text-rose-400', borderDivider: 'group-hover:border-rose-500/30', gradient: 'from-rose-500/10 via-rose-400/10 to-rose-600/10' },
    { border: 'border-amber-500/30', borderHover: 'hover:border-amber-500/60', shadow: 'hover:shadow-amber-500/20', text: 'group-hover:text-amber-400', borderDivider: 'group-hover:border-amber-500/30', gradient: 'from-amber-500/10 via-amber-400/10 to-amber-600/10' },
    { border: 'border-teal-500/30', borderHover: 'hover:border-teal-500/60', shadow: 'hover:shadow-teal-500/20', text: 'group-hover:text-teal-400', borderDivider: 'group-hover:border-teal-500/30', gradient: 'from-teal-500/10 via-teal-400/10 to-teal-600/10' },
  ];
  return colorSets[index % colorSets.length];
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
  const colors = getTimelineColorClasses(index);

  const handleClick = () => {
    if (hasMarkdown && data.id) {
      navigate(`/post/${data.id}`);
    }
  };

  return (
    <div 
      ref={ref}
      className={`relative pl-8 md:pl-0 md:grid md:grid-cols-2 gap-12 mb-20 md:mb-24 transition-all duration-1000 ease-out ${
        onScreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      }`}
    >
      {/* The Dot */}
      <div className="absolute left-0 md:left-1/2 md:-ml-4 w-8 h-8 rounded-full border-4 border-zinc-950 bg-zinc-100 z-10 shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.15),inset_0_0_10px_rgba(255,255,255,0.3)]">
        <div className="absolute inset-0 rounded-full bg-white/20 blur-sm"></div>
      </div>

      {/* Date (Left Side on Desktop, Hidden/Moved on Mobile) */}
      <div className={`md:text-right md:pr-10 ${index % 2 === 0 ? "md:order-1" : "md:order-2 md:text-left md:pl-10"}`}>
         <span className="inline-block px-5 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-md text-zinc-200 text-sm font-mono mb-2 border border-zinc-700/40 shadow-lg shadow-black/30 hover:border-zinc-600/60 hover:text-zinc-100 transition-all duration-300">
            {formatTimelineDate(data.dateValue)}
         </span>
      </div>

      {/* Content Card */}
      <div className={`${index % 2 === 0 ? "md:order-2" : "md:order-1 md:text-right"}`}>
        <div 
          onClick={handleClick}
          className={`relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-zinc-900/90 backdrop-blur-xl border-2 ${colors.border} p-8 md:p-10 rounded-3xl transition-all duration-500 group ${
            hasMarkdown ? `${colors.borderHover} cursor-pointer hover:bg-gradient-to-br hover:from-zinc-900 hover:via-zinc-950 hover:to-zinc-900 hover:shadow-2xl ${colors.shadow} hover:-translate-y-2 hover:scale-[1.02]` : ''
          }`}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
          }}
        >
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors.gradient} blur-xl`}></div>
          </div>
          
          {/* Subtle inner glow */}
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>
          
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          ></div>
          
          {/* Content wrapper */}
          <div className="relative z-10">
            <div className={`mb-5 ${index % 2 !== 0 ? "md:text-right" : ""}`}>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight group-hover:text-zinc-50 transition-colors">
                {data.title}
              </h3>
            </div>
            <p className="text-zinc-300/90 text-base md:text-lg leading-relaxed font-light mb-6 group-hover:text-zinc-200 transition-colors">
              {data.content}
            </p>
            {hasMarkdown && (
              <div className={`pt-5 border-t border-zinc-800/60 ${colors.borderDivider} transition-colors ${index % 2 !== 0 ? "md:text-right" : ""}`}>
                <span className={`inline-flex items-center gap-2 text-sm text-zinc-500 ${colors.text} transition-all duration-300 font-medium`}>
                  <span>Read more</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </span>
              </div>
            )}
          </div>
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-bl-full pointer-events-none"></div>
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
