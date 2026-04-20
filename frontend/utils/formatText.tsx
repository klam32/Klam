import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const formatText = (text: string) => {
  if (!text) return null;

  return (
    <div className="markdown-content space-y-4">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-8 mb-4 text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 uppercase" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-6 mb-3 text-xl font-bold text-purple-300/90 tracking-wide border-l-4 border-purple-500/50 pl-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-4 mb-2 text-lg font-semibold text-blue-300/80" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-[16px] leading-relaxed text-gray-300/90 mb-4 font-light tracking-wide" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="space-y-3 my-4 list-none" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="flex items-start gap-3 text-gray-300/80">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.4)] flex-shrink-0" />
              <span className="text-[15.5px]">{props.children}</span>
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white shadow-sm" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-white/10 pl-4 italic text-gray-400 my-4" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};