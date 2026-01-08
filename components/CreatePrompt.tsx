import React, { useState, useRef } from 'react';
import { Wand2, Image as ImageIcon, Sparkles, Loader2, Save, Settings, Plus, X, Trash2, ChevronRight, UploadCloud, Type, Check } from 'lucide-react';
import { enhancePrompt, generatePreviewImage } from '../services/geminiService';
import { PromptData, RatioOption } from '../types';

interface CreatePromptProps {
  onSave: (prompt: PromptData) => void;
  onCancel: () => void;
  availableStyles: string[];
  setAvailableStyles: (styles: string[]) => void;
  availableRatios: RatioOption[];
  setAvailableRatios: (ratios: RatioOption[]) => void;
}

const CreatePrompt: React.FC<CreatePromptProps> = ({ 
  onSave, 
  onCancel,
  availableStyles,
  setAvailableStyles,
  availableRatios,
  setAvailableRatios
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  // Common State
  const [baseIdea, setBaseIdea] = useState(''); // Used as title in Manual
  const [style, setStyle] = useState(availableStyles[0] || '真实感摄影');
  
  // AI Mode State
  const [englishPrompt, setEnglishPrompt] = useState('');
  const [chinesePrompt, setChinesePrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual Mode State
  const [manualImage, setManualImage] = useState<string | null>(null);
  
  // Shared Result
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>(availableRatios[0]?.value || '1:1');

  // Management Modal State
  const [manageMode, setManageMode] = useState<'style' | 'ratio' | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualImage(reader.result as string);
        setGeneratedImage(reader.result as string); // In manual mode, uploaded image IS the result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!baseIdea) return;
    setIsEnhancing(true);
    try {
      const result = await enhancePrompt(baseIdea, style);
      setEnglishPrompt(result.englishPrompt);
      setChinesePrompt(result.chineseTranslation);
    } catch (e) {
      alert("优化失败，请检查 API Key。");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    const promptToUse = englishPrompt || baseIdea;
    if (!promptToUse) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generatePreviewImage(promptToUse, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (e) {
      alert("生成失败，请检查 API Key。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedImage) return;
    
    // In Manual Mode, baseIdea is the Title. In AI mode, it's the idea.
    const finalTitle = mode === 'manual' ? baseIdea : (baseIdea || "未命名创作");

    const newPrompt: PromptData = {
      id: Date.now().toString(),
      title: finalTitle || "未命名创作",
      promptText: englishPrompt || (mode === 'manual' ? "" : baseIdea), // In manual, user might leave en prompt empty if lazy, or we can add a field
      promptTextZh: chinesePrompt || (mode === 'manual' ? "" : baseIdea),
      imageUrl: generatedImage,
      tags: [style.toLowerCase(), mode === 'manual' ? 'imported' : 'generated'],
      likes: 0,
      isBookmarked: false,
      author: 'You',
      createdAt: Date.now(),
      aspectRatio
    };
    onSave(newPrompt);
  };

  // Minimal Input Component
  const InputField = ({ label, value, onChange, placeholder, rows = 3 }: any) => (
    <div className="space-y-2 group">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider group-focus-within:text-primary transition-colors">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-surface border border-border/10 rounded-xl p-4 text-main placeholder-muted outline-none focus:border-primary/50 focus:bg-surface/80 transition-all font-light resize-none shadow-sm"
      />
    </div>
  );

  const handleDeleteItem = (val: string) => {
    if (manageMode === 'style') {
      const newStyles = availableStyles.filter(s => s !== val);
      setAvailableStyles(newStyles);
      if (style === val) setStyle(newStyles[0] || '');
    } else if (manageMode === 'ratio') {
      const newRatios = availableRatios.filter(r => r.value !== val);
      setAvailableRatios(newRatios);
      if (aspectRatio === val) setAspectRatio(newRatios[0]?.value || '1:1');
    }
  };

  const handleAddItem = () => {
    if (!newItemValue.trim()) return;
    if (manageMode === 'style') {
      if (!availableStyles.includes(newItemValue)) {
        setAvailableStyles([...availableStyles, newItemValue]);
        setStyle(newItemValue);
      }
    } else if (manageMode === 'ratio') {
      const newRatio: RatioOption = {
        label: newItemLabel || newItemValue,
        value: newItemValue
      };
      setAvailableRatios([...availableRatios, newRatio]);
      setAspectRatio(newItemValue);
    }
    setNewItemValue('');
    setNewItemLabel('');
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col shadow-2xl">
            
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-6 border-b border-border/10 pb-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {mode === 'ai' ? <Sparkles size={20} /> : <UploadCloud size={20} />}
                  </div>
                  <h2 className="text-xl font-semibold text-main">
                    {mode === 'ai' ? 'AI 创作工坊' : '手动入库'}
                  </h2>
               </div>
               
               <div className="flex bg-surface border border-border/10 rounded-lg p-1">
                  <button 
                    onClick={() => { setMode('ai'); setGeneratedImage(null); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'ai' ? 'bg-main text-page shadow-sm' : 'text-muted hover:text-main'}`}
                  >
                    AI 生成
                  </button>
                  <button 
                    onClick={() => { setMode('manual'); setGeneratedImage(null); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'manual' ? 'bg-main text-page shadow-sm' : 'text-muted hover:text-main'}`}
                  >
                    手动导入
                  </button>
               </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               
               {/* MODE: MANUAL IMPORT */}
               {mode === 'manual' && (
                 <>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all p-8 group ${manualImage ? 'border-primary/50 bg-primary/5' : 'border-border/20 hover:border-primary/30 hover:bg-main/5'}`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleManualImageUpload} />
                        <UploadCloud className="text-muted group-hover:text-primary mb-2 transition-colors" size={24} />
                        <span className="text-xs text-muted group-hover:text-main transition-colors">点击上传图片 (JPG/PNG)</span>
                    </div>

                    <div className="space-y-4">
                        <InputField label="标题" value={baseIdea} onChange={(e: any) => setBaseIdea(e.target.value)} placeholder="给你的作品起个名字..." rows={1} />
                        <InputField label="中文提示词" value={chinesePrompt} onChange={(e: any) => setChinesePrompt(e.target.value)} placeholder="记录中文描述..." />
                        <InputField label="英文提示词 (Prompt)" value={englishPrompt} onChange={(e: any) => setEnglishPrompt(e.target.value)} placeholder="Record the original English prompt..." />
                    </div>
                 </>
               )}

               {/* MODE: AI GENERATION */}
               {mode === 'ai' && (
                 <>
                    <InputField 
                        label="核心创意" 
                        value={baseIdea} 
                        onChange={(e: any) => setBaseIdea(e.target.value)} 
                        placeholder="描述你想象中的画面..." 
                    />

                    {/* AI Action */}
                    <button 
                        onClick={handleEnhance}
                        disabled={!baseIdea || isEnhancing}
                        className="w-full py-3 bg-surface hover:bg-elevated text-main rounded-xl text-sm font-medium transition-all border border-border/10 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                        AI 智能润色与翻译
                    </button>

                     {/* Output Fields */}
                    {(englishPrompt || isEnhancing) && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                            <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    优化后的提示词 (English)
                            </label>
                            <div className="bg-elevated border border-primary/20 rounded-xl p-4 text-sm text-main font-mono leading-relaxed shadow-inner">
                                {englishPrompt || "AI 正在思考中..."}
                            </div>
                            </div>
                            <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted uppercase tracking-wider">中文翻译</label>
                            <div className="bg-surface border border-border/10 rounded-xl p-4 text-sm text-muted shadow-inner">
                                {chinesePrompt || "正在翻译..."}
                            </div>
                            </div>
                        </div>
                    )}
                 </>
               )}

               {/* SHARED SETTINGS */}
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/10">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">风格标签</label>
                        <button onClick={() => setManageMode('style')} className="text-muted hover:text-main transition-colors"><Settings size={12} /></button>
                    </div>
                    <div className="relative">
                        <select 
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full appearance-none bg-surface border border-border/10 rounded-xl px-4 py-3 text-sm text-main outline-none focus:border-primary/50 shadow-sm"
                        >
                            {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">比例</label>
                        <button onClick={() => setManageMode('ratio')} className="text-muted hover:text-main transition-colors"><Settings size={12} /></button>
                    </div>
                    <div className="relative">
                        <select 
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full appearance-none bg-surface border border-border/10 rounded-xl px-4 py-3 text-sm text-main outline-none focus:border-primary/50 shadow-sm"
                        >
                            {availableRatios.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                             <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                  </div>
               </div>

            </div>
            
            <div className="pt-6 mt-6 border-t border-border/10">
                {mode === 'ai' ? (
                     <button 
                        onClick={handleGenerate}
                        disabled={(!baseIdea && !englishPrompt) || isGenerating}
                        className="w-full py-4 bg-main hover:opacity-90 text-page rounded-xl font-bold text-base shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                        生成预览图
                    </button>
                ) : (
                    <button 
                         // No generate step for manual, acts as save trigger essentially, but we use save button on right
                         disabled={true} 
                         className="w-full py-4 bg-surface text-muted rounded-xl font-medium text-sm border border-border/10 flex items-center justify-center gap-2 cursor-not-allowed"
                     >
                         <Check size={16} />
                         图片已就绪
                     </button>
                )}
               
            </div>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="lg:col-span-7 h-full">
            <div className="glass-panel rounded-2xl h-full p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                 {/* Grid Pattern Background */}
                 <div className="absolute inset-0 z-0 opacity-10" 
                      style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', color: 'rgb(var(--c-text-muted))' }}>
                 </div>

                 {generatedImage ? (
                    <div className="relative z-10 w-full max-h-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl border border-border/10 max-h-[60vh]">
                            <img src={generatedImage} alt="Generated" className="max-w-full h-auto object-contain" />
                        </div>
                        <div className="flex gap-4 w-full max-w-sm">
                            <button onClick={onCancel} className="flex-1 py-3 bg-surface text-muted rounded-xl font-medium hover:bg-elevated hover:text-main transition-colors border border-border/10">丢弃</button>
                            <button 
                                onClick={handleSave} 
                                disabled={mode === 'manual' && !baseIdea} // Require title for manual
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                保存到画廊
                            </button>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center z-10 space-y-4">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto border border-border/10 shadow-inner">
                            {isGenerating ? <Loader2 className="animate-spin text-primary" size={32} /> : <ImageIcon className="text-muted" size={32} />}
                        </div>
                        <p className="text-muted font-medium tracking-wide">
                            {mode === 'ai' ? '预览画布' : '请先上传图片'}
                        </p>
                    </div>
                 )}
            </div>
        </div>
      </div>

       {/* Modal - Minimalist Dialog */}
       {manageMode && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-elevated border border-border/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border/10 flex justify-between items-center">
                 <h3 className="font-semibold text-main text-sm">
                   管理 {manageMode === 'style' ? '风格' : '比例'}
                 </h3>
                 <button onClick={() => setManageMode(null)} className="text-muted hover:text-main"><X size={16} /></button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                 {(manageMode === 'style' ? availableStyles : availableRatios).map((item: any) => {
                    const val = typeof item === 'string' ? item : item.value;
                    const label = typeof item === 'string' ? item : item.label;
                    return (
                       <div key={val} className="flex justify-between items-center px-4 py-3 border-b border-border/5 hover:bg-main/5 group">
                          <span className="text-sm text-main">{label}</span>
                          <button onClick={() => handleDeleteItem(val)} className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                       </div>
                    );
                 })}
              </div>
              <div className="p-4 bg-surface/50 space-y-3">
                 <input 
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder="新值..."
                    className="w-full bg-page border border-border/10 rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-primary"
                 />
                 {manageMode === 'ratio' && (
                     <input 
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        placeholder="显示标签 (如：超宽屏)..."
                        className="w-full bg-page border border-border/10 rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-primary"
                     />
                 )}
                 <button onClick={handleAddItem} className="w-full py-2 bg-primary hover:opacity-90 text-white rounded-lg text-sm font-medium">添加</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CreatePrompt;