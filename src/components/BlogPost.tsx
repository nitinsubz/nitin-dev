import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useTimelineData } from '../hooks/useSupabaseData';
import type { TimelineItem } from '../supabase/types';

// Format date for display
const formatTimelineDate = (dateValue: string): string => {
  if (!dateValue) return 'Date TBD';
  try {
    const date = new Date(dateValue);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateValue;
  }
};

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useTimelineData();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Error loading post</div>
      </div>
    );
  }

  const post = data.find((item: TimelineItem) => item.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Go to Timeline
          </button>
        </div>
      </div>
    );
  }

  const hasMarkdown = post.markdownContent && post.markdownContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Timeline</span>
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${post.color}`}></div>
            <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-mono rounded border border-zinc-700">
              #{post.tag}
            </span>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Calendar size={14} />
              <span>{formatTimelineDate(post.dateValue)}</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          {hasMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-zinc-300 leading-relaxed mb-4" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? (
                    <code className="bg-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm" {...props} />
                  ) : (
                    <code className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm" {...props} />
                  ),
                pre: ({node, ...props}) => <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-zinc-300 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-zinc-300 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-zinc-700 pl-4 italic text-zinc-400 my-4" {...props} />,
                img: ({node, ...props}) => <img className="rounded-lg my-4 max-w-full" {...props} />,
                hr: ({node, ...props}) => <hr className="border-zinc-800 my-8" {...props} />,
              }}
            >
              {post.markdownContent}
            </ReactMarkdown>
          ) : (
            <div className="text-zinc-300 leading-relaxed">
              <p className="text-lg mb-4">{post.content}</p>
              <p className="text-zinc-500 italic">No extended content available for this post.</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

