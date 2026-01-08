import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Bookmark, Share2, Download, Tag, Calendar, User, Languages, Edit2, Trash2, Save, RotateCcw, AlertCircle, Quote } from 'lucide-react';
import { PromptData } from '../types';

interface ImageDetailModalProps {
  data: PromptData | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (data: PromptData) => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ 
  data, 
  isOpen, 
  onClose, 
  onToggleBookmark, 
  onDelete,
  onUpdate 
}) => {
  const [copiedEn, setCopiedEn] = useState(false);
  const [copiedZh, setCopiedZh] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit States
  const [editTitle, setEditTitle] = useState('');
  const [editPromptZh, setEditPromptZh] = useState('');
  const [editPromptEn, setEditPromptEn] = useState('');
  const [editTags, setEditTags] = useState('');

  // Refs for auto-sizing textareas
  const enTextRef = useRef<HTMLTextAreaElement>(null);
  const zhTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
      if (isOpen && data) {
          setIsEditing(false); 
          setConfirmDelete(false);
          setEditTitle(data.title);
          setEditPromptZh(data.promptTextZh || '');
          setEditPromptEn(data.promptText);
          setEditTags(data.tags.join(', '));
      }
  }, [isOpen, data]);

  // Auto-resize textarea effect
  useEffect(() => {
    if (isEditing) {
        if (enTextRef.current) {
            enTextRef.current.style.height = 'auto';
            enTextRef.current.style.height = enTextRef.current.scrollHeight + 'px';
        }
        if (zhTextRef.current) {
            zhTextRef.current.style.height = 'auto';
            zhTextRef.current.style.height = zhTextRef.current.scrollHeight + 'px';
        }
    }
  }, [editPromptEn, editPromptZh, isEditing]);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string, isEn: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEn) {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    } else {
      setCopiedZh(true);
      setTimeout(() => setCopiedZh(false), 2000);
    }
  };

  const handleDownload = () => {
      const link = document.createElement('a');
      link.href = data.imageUrl;
      link.download = `${data.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSave = () => {
      const updatedPrompt: PromptData = {
          ...data,
          title: editTitle,
          promptText: editPromptEn,
          promptTextZh: editPromptZh,
          tags: editTags.split(',').map(t => t.trim()).filter(t => t),
      };
      onUpdate(updatedPrompt);
      setIsEditing(false);
  };

  const handleDeleteClick = () => {
      if (confirmDelete) {
          onDelete(data.id);
      } else {
          setConfirmDelete(true);
          // Auto reset confirm state after 3 seconds if not clicked
          setTimeout(() => setConfirmDelete(false), 3000);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-300">
      {/* 
        Aesthetic Choice: Deep Blur Backdrop 
        Using backdrop-blur-3xl creates a "frosted glass" depth, focusing attention purely on the card.
      */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-3xl transition-opacity"
        onClick={onClose}
      />

      {/* Main Container - The "Floating Slab" */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[92vh] md:rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-[#101012] border border-white/5 animate-in zoom-in-95 duration-300">
        
        {/* Left: The Immersive Image View */}
        <div className="flex-1 bg-black/50 relative flex items-center justify-center overflow-hidden group">
            {/* Ambient Back Glow based on image */}
            <div 
                className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-20 scale-150 pointer-events-none"
                style={{ backgroundImage: `url(${data.imageUrl})` }}
            />
            
            <img 
                src={data.imageUrl} 
                alt={data.title} 
                className="relative z-10 w-full h-full object-contain transition-transform duration-700 ease-out"
            />

            {/* Floating Quick Actions (Top Left) */}
            <div className="absolute top-6 left-6 flex gap-3 z-30">
                <button 
                    onClick={onClose} 
                    className="p-3 bg-black/30 text-white/70 rounded-full hover:bg-white/20 hover:text-white transition-all backdrop-blur-md border border-white/5"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Floating Image Actions (Bottom Center) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-30">
                <button onClick={handleDownload} className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <Download size={16} />
                    <span className="hidden sm:inline">下载原图</span>
                </button>
            </div>
        </div>

        {/* Right: The "Inspector" Panel - Glassmorphic */}
        <div className="w-full lg:w-[480px] bg-[#1c1c1e]/90 backdrop-blur-xl border-l border-white/5 flex flex-col h-[50vh] lg:h-full relative">
            
            {/* 1. Header: Navigation & Primary Actions */}
            <div className="p-6 md:pt-8 flex justify-between items-start shrink-0">
                <div className="flex-1 mr-4">
                    {isEditing ? (
                        <input 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 pb-2 text-2xl font-light text-white outline-none focus:border-white/60 transition-colors placeholder-white/20"
                            placeholder="Add a title..."
                            autoFocus
                        />
                    ) : (
                        <div>
                             <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight tracking-tight">{data.title}</h2>
                             <div className="flex items-center gap-3 mt-2 text-xs font-medium text-white/40 uppercase tracking-widest">
                                <span>{data.author}</span>
                                <span>•</span>
                                <span>{new Date(data.createdAt).toLocaleDateString()}</span>
                             </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                         <>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-white/50 hover:text-white transition-colors" title="Cancel">
                                <X size={20} />
                            </button>
                            <button onClick={handleSave} className="p-2 text-primary hover:text-primary/80 transition-colors" title="Save Changes">
                                <Check size={20} />
                            </button>
                         </>
                    ) : (
                        <>
                            <button 
                                onClick={() => onToggleBookmark(data.id)}
                                className={`p-2 transition-colors duration-300 ${data.isBookmarked ? 'text-primary' : 'text-white/30 hover:text-white'}`}
                            >
                                <Bookmark size={22} fill={data.isBookmarked ? "currentColor" : "none"} />
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-white/30 hover:text-white transition-colors"
                            >
                                <Edit2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 2. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 custom-scrollbar">
                
                {/* Chinese Prompt Section */}
                <div className="space-y-3 group/zh">
                    <div className="flex justify-between items-center text-xs font-medium text-white/40 uppercase tracking-wider">
                         <span className="flex items-center gap-2"><Languages size={12}/> 中文描述</span>
                         {!isEditing && data.promptTextZh && (
                            <button onClick={() => handleCopy(data.promptTextZh!, false)} className="opacity-0 group-hover/zh:opacity-100 transition-opacity flex items-center gap-1 hover:text-primary">
                                {copiedZh ? <Check size={12} /> : <Copy size={12} />} 复制
                            </button>
                         )}
                    </div>
                    {isEditing ? (
                        <textarea 
                            ref={zhTextRef}
                            value={editPromptZh}
                            onChange={(e) => setEditPromptZh(e.target.value)}
                            className="w-full bg-white/5 rounded-xl p-4 text-sm text-white/90 leading-relaxed outline-none focus:bg-white/10 transition-colors resize-none border border-transparent focus:border-white/10"
                            placeholder="输入中文描述..."
                        />
                    ) : (
                        <p className="text-sm text-white/80 leading-7 font-light tracking-wide">
                            {data.promptTextZh || <span className="text-white/20 italic">暂无翻译</span>}
                        </p>
                    )}
                </div>

                {/* English Prompt Section - The "Code" Block */}
                <div className="space-y-3 group/en">
                    <div className="flex justify-between items-center text-xs font-medium text-white/40 uppercase tracking-wider">
                         <span className="flex items-center gap-2"><Quote size={12}/> Prompt (EN)</span>
                         {!isEditing && (
                            <button onClick={() => handleCopy(data.promptText, true)} className="opacity-0 group-hover/en:opacity-100 transition-opacity flex items-center gap-1 hover:text-primary">
                                {copiedEn ? <Check size={12} /> : <Copy size={12} />} 复制
                            </button>
                         )}
                    </div>
                    {isEditing ? (
                        <textarea 
                            ref={enTextRef}
                            value={editPromptEn}
                            onChange={(e) => setEditPromptEn(e.target.value)}
                            className="w-full bg-white/5 rounded-xl p-4 text-sm text-white/90 font-mono leading-relaxed outline-none focus:bg-white/10 transition-colors resize-none border border-transparent focus:border-white/10"
                            placeholder="Enter English prompt..."
                        />
                    ) : (
                        <div className="p-5 bg-[#0a0a0c] border border-white/5 rounded-xl text-sm text-gray-300 font-mono leading-relaxed shadow-inner break-words selection:bg-white/20">
                            {data.promptText}
                        </div>
                    )}
                </div>

                {/* Tags Section */}
                <div className="space-y-3">
                     <div className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
                        <Tag size={12}/> 标签
                     </div>
                     {isEditing ? (
                        <input 
                             value={editTags}
                             onChange={(e) => setEditTags(e.target.value)}
                             className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 border border-transparent"
                             placeholder="Tags (comma separated)..."
                        />
                     ) : (
                        <div className="flex flex-wrap gap-2">
                            {data.aspectRatio && (
                                <span className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-medium text-white/60">
                                    {data.aspectRatio}
                                </span>
                            )}
                            {data.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                     )}
                </div>
            </div>

            {/* 3. Footer: Dangerous Actions */}
            {isEditing && (
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <button 
                        onClick={handleDeleteClick}
                        className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            confirmDelete 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'bg-white/5 text-red-400 hover:bg-white/10'
                        }`}
                    >
                        {confirmDelete ? (
                            <>
                                <AlertCircle size={16} />
                                确定删除吗？(点击确认)
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                删除此卡片
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;