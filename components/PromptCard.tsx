import React, { useState } from 'react';
import { Copy, Check, Bookmark, Languages } from 'lucide-react';
import { PromptData } from '../types';

interface PromptCardProps {
  data: PromptData;
  onCopy: (text: string) => void;
  onToggleBookmark: (id: string) => void;
  onClick: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ data, onCopy, onToggleBookmark, onClick }) => {
  const [copied, setCopied] = useState(false);
  const [showChinese, setShowChinese] = useState(true);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(data.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(data.id);
  };

  return (
    <div 
        onClick={onClick}
        className="group relative break-inside-avoid mb-6 bg-surface border border-border/10 rounded-2xl overflow-hidden hover:border-border/20 transition-all duration-500 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 cursor-zoom-in"
    >
      {/* Image Container - The Hero */}
      <div className="relative overflow-hidden">
        <img 
          src={data.imageUrl} 
          alt={data.title} 
          className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Minimal Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Floating Actions (Visible on hover) */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
           <button 
                onClick={(e) => { e.stopPropagation(); setShowChinese(!showChinese); }}
                className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 hover:bg-white hover:text-black transition-all"
                title="切换中英文"
           >
              <Languages size={14} />
           </button>
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
           <div className="flex justify-between items-end">
              <div className="flex-1 mr-4">
                 <h3 className="text-white font-medium text-base leading-tight mb-1 drop-shadow-md">{data.title}</h3>
                 <p className="text-zinc-300 text-xs font-light line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    {showChinese && data.promptTextZh ? data.promptTextZh : data.promptText}
                 </p>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                  <button 
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 p-2 rounded-full backdrop-blur-md transition-all ${data.isBookmarked ? 'bg-primary text-white' : 'bg-black/30 text-white/70 hover:bg-white hover:text-black'}`}
                    title={data.isBookmarked ? "取消收藏" : "收藏"}
                  >
                    <Bookmark size={14} fill={data.isBookmarked ? "currentColor" : "none"} />
                  </button>
              </div>
           </div>
        </div>
      </div>

      {/* Tags - Outside the image for cleaner look */}
      <div className="px-4 py-3 bg-surface/80 backdrop-blur border-t border-border/10 flex justify-between items-center">
         <div className="flex gap-2 overflow-hidden">
            {data.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-[10px] uppercase tracking-wider text-muted font-medium">
                #{tag}
                </span>
            ))}
         </div>
         <button 
            onClick={handleCopy}
            className={`text-xs flex items-center gap-1.5 transition-colors ${copied ? 'text-primary' : 'text-muted hover:text-main'}`}
         >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
         </button>
      </div>
    </div>
  );
};

export default PromptCard;