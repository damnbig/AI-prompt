import React, { useState, useRef } from 'react';
import { Upload, ScanLine, Wand2, Clipboard, Check, Layers, Tag, X, FileJson, Image as ImageIcon, Loader2, Plus, ArrowRight, Folder } from 'lucide-react';
import { reverseImagePrompt, analyzePromptStructure } from '../services/geminiService';
import { PromptAnalysisResult, AnalysisItem, ModifierCategory, Modifier } from '../types';

interface ToolsLabProps {
  categories: ModifierCategory[];
  setCategories: (cats: ModifierCategory[]) => void;
}

// Interactive Result Chip
const ResultChip: React.FC<{ item: AnalysisItem, onAdd: () => void }> = ({ item, onAdd }) => (
  <div className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border/10 hover:border-primary/40 hover:bg-main/5 transition-all shadow-sm">
    <div className="flex flex-col leading-none">
        <span className="text-xs font-semibold text-main mb-0.5">{item.zh}</span>
        <span className="text-[10px] text-muted font-mono">{item.en}</span>
    </div>
    <button 
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        className="ml-1 p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
        title="添加到词典"
    >
        <Plus size={14} />
    </button>
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-3 text-muted">
      <Icon size={14} />
      <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
  </div>
);

const ToolsLab: React.FC<ToolsLabProps> = ({ categories, setCategories }) => {
  const [activeTab, setActiveTab] = useState<'reverse' | 'deconstruct'>('reverse');

  // Reverse State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reversedResult, setReversedResult] = useState<{ en: string; zh: string } | null>(null);
  const [resultLang, setResultLang] = useState<'en' | 'zh'>('zh'); 
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // Analyze State
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);

  // Add to Dictionary Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<AnalysisItem | null>(null);
  const [targetCatId, setTargetCatId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Reverse ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setReversedResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReverse = async () => {
    if (!selectedImage) return;
    setIsReversing(true);
    try {
      const result = await reverseImagePrompt(selectedImage);
      setReversedResult(result);
    } catch (e) {
      alert("分析失败，请检查 API Key。");
    } finally {
      setIsReversing(false);
    }
  };

  const handleCopyPrompt = () => {
      if (!reversedResult) return;
      const textToCopy = reversedResult[resultLang];
      navigator.clipboard.writeText(textToCopy);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // --- Handlers for Analyze ---
  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePromptStructure(rawText);
      setAnalysisResult(result);
    } catch (e) {
      alert("文本分析失败。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Dictionary Adding Logic ---
  const openAddModal = (item: AnalysisItem, sourceCategory: string) => {
    setItemToAdd(item);
    
    // Smart Categorization
    let suggestedCatId = categories[0]?.id;
    
    // Simple heuristics mapping
    const map: Record<string, string> = {
        'style': 'aesthetics',
        'lighting': 'lighting',
        'camera': 'camera',
        'composition': 'composition'
    };

    // Try to find a matching existing category ID by name or partial ID
    const key = map[sourceCategory.toLowerCase()];
    if (key) {
        const found = categories.find(c => c.id.includes(key) || c.id === key);
        if (found) suggestedCatId = found.id;
    }

    setTargetCatId(suggestedCatId);
    setAddModalOpen(true);
  };

  const confirmAddToDictionary = () => {
      if (!itemToAdd || !targetCatId) return;
      
      const newModifier: Modifier = {
          id: Date.now().toString(),
          zh: itemToAdd.zh,
          en: itemToAdd.en
      };

      const newCategories = categories.map(cat => {
          if (cat.id === targetCatId) {
              return {
                  ...cat,
                  modifiers: [...cat.modifiers, newModifier]
              };
          }
          return cat;
      });

      setCategories(newCategories);
      setAddModalOpen(false);
      setItemToAdd(null);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500 relative">
      
      {/* Header & Toggle */}
      <div className="flex flex-col items-center justify-center mb-10 space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-main tracking-tight">灵感实验室</h2>
            <p className="text-muted text-sm">探索高阶提示词工程工具。</p>
        </div>

        {/* iOS Style Segmented Control */}
        <div className="p-1 bg-surface border border-border/10 rounded-xl inline-flex relative shadow-inner">
            <div 
                className={`absolute top-1 bottom-1 w-[140px] rounded-lg bg-elevated shadow-sm transition-all duration-300 ease-out ${activeTab === 'reverse' ? 'left-1' : 'left-[145px]'}`} 
            />
            <button 
                onClick={() => setActiveTab('reverse')}
                className={`relative z-10 w-[140px] py-1.5 text-sm font-medium transition-colors ${activeTab === 'reverse' ? 'text-main' : 'text-muted hover:text-main'}`}
            >
                光影解构 (Reverse)
            </button>
            <button 
                onClick={() => setActiveTab('deconstruct')}
                className={`relative z-10 w-[140px] py-1.5 text-sm font-medium transition-colors ${activeTab === 'deconstruct' ? 'text-main' : 'text-muted hover:text-main'}`}
            >
                Prompt 拆解
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'reverse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full animate-in slide-in-from-left-4 duration-500">
                {/* Upload Zone */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <SectionTitle icon={ImageIcon} title="输入源" />
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${selectedImage ? 'border-primary/50 bg-black/20' : 'border-border/20 hover:border-primary/30 hover:bg-main/5'}`}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                        />
                        
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-contain p-4" />
                        ) : (
                            <div className="text-center space-y-3 p-6">
                                <div className="w-12 h-12 rounded-full bg-surface border border-border/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <Upload className="text-muted group-hover:text-primary" size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-main font-medium text-sm">拖拽图片至此</p>
                                    <p className="text-muted text-xs">或点击上传</p>
                                </div>
                            </div>
                        )}
                        
                        {selectedImage && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setReversedResult(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-md"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={handleReverse}
                        disabled={!selectedImage || isReversing}
                        className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isReversing ? <Loader2 className="animate-spin" size={16} /> : <ScanLine size={16} />}
                        扫描与解析
                    </button>
                </div>

                {/* Output Zone - Cinematic Text View */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <SectionTitle icon={Wand2} title="电影级视觉分析" />
                        {reversedResult && (
                            <div className="flex items-center gap-3">
                                {/* Language Toggle */}
                                <div className="flex bg-surface border border-border/10 rounded-lg p-0.5">
                                    <button 
                                        onClick={() => setResultLang('en')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${resultLang === 'en' ? 'bg-main text-page shadow-sm' : 'text-muted hover:text-main'}`}
                                    >
                                        English
                                    </button>
                                    <button 
                                        onClick={() => setResultLang('zh')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${resultLang === 'zh' ? 'bg-main text-page shadow-sm' : 'text-muted hover:text-main'}`}
                                    >
                                        中文
                                    </button>
                                </div>

                                <button 
                                    onClick={handleCopyPrompt} 
                                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${copiedPrompt ? 'bg-green-500/20 text-green-400' : 'bg-surface hover:bg-main/10 text-main'}`}
                                >
                                    {copiedPrompt ? <Check size={12} /> : <Clipboard size={12} />}
                                    {copiedPrompt ? '已复制' : '复制'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-surface border border-border/10 rounded-xl p-0 overflow-hidden relative">
                        {isReversing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
                                <Loader2 className="animate-spin text-primary" size={24} />
                                <span className="text-xs tracking-widest uppercase animate-pulse">正在构建视觉叙事...</span>
                            </div>
                        ) : reversedResult ? (
                           <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-page/30 animate-in fade-in">
                                <div className={`prose prose-sm prose-invert max-w-none space-y-4 ${resultLang === 'zh' ? 'tracking-wide leading-loose' : ''}`}>
                                    {reversedResult[resultLang].split('\n\n').map((paragraph, index) => {
                                        if (!paragraph.trim()) return null;
                                        return (
                                            <p key={index} className="text-main leading-relaxed font-sans text-sm">
                                                {paragraph.trim()}
                                            </p>
                                        );
                                    })}
                                </div>
                           </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted opacity-40 p-8 text-center">
                                <ScanLine size={32} strokeWidth={1.5} className="mb-2" />
                                <p className="text-xs">上传图片以提取其视觉 DNA</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'deconstruct' && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                 {/* Input Area */}
                 <div className="glass-panel rounded-2xl p-6 shadow-xl">
                    <SectionTitle icon={FileJson} title="原始提示词 / JSON / 文本" />
                    <div className="relative">
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="粘贴任意杂乱的提示词、JSON 或段落..."
                            rows={4}
                            className="w-full bg-surface border border-border/10 rounded-xl p-4 pr-32 text-main placeholder-muted outline-none focus:border-primary/50 transition-all resize-none text-sm font-mono"
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={!rawText || isAnalyzing}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-main text-page rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : <Layers size={12} />}
                            开始拆解
                        </button>
                    </div>
                 </div>

                 {/* Results Grid */}
                 {analysisResult && (
                    <div className="glass-panel rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                        <SectionTitle icon={Tag} title="结构化组件 (点击 + 添加到词典)" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: '主体 (Subject)', data: analysisResult.subject, color: 'border-blue-500/30', key: 'subject' },
                                { title: '风格 (Style)', data: analysisResult.style, color: 'border-purple-500/30', key: 'style' },
                                { title: '媒介 (Medium)', data: analysisResult.medium, color: 'border-pink-500/30', key: 'medium' },
                                { title: '光影 (Lighting)', data: analysisResult.lighting, color: 'border-yellow-500/30', key: 'lighting' },
                                { title: '镜头 (Camera)', data: analysisResult.camera, color: 'border-green-500/30', key: 'camera' },
                                { title: '艺术家 (Artists)', data: analysisResult.artists, color: 'border-orange-500/30', key: 'artists' },
                                { title: '色彩 (Colors)', data: analysisResult.colorPalette, color: 'border-red-500/30', key: 'colorPalette' },
                                { title: '细节 (Details)', data: analysisResult.additionalDetails, color: 'border-gray-500/30', key: 'additionalDetails' },
                            ].map((cat) => (
                                <div key={cat.title} className={`p-4 rounded-xl bg-surface border ${cat.color} flex flex-col gap-2 h-full`}>
                                    <span className="text-xs font-bold text-muted uppercase">{cat.title}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.data && cat.data.length > 0 ? (
                                            cat.data.map((item, i) => (
                                                <ResultChip 
                                                    key={i} 
                                                    item={item} 
                                                    onAdd={() => openAddModal(item, cat.key)}
                                                />
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted/50 italic">无</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
            </div>
        )}
      </div>

      {/* Add To Dictionary Modal */}
      {addModalOpen && itemToAdd && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-elevated border border-border/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-border/10 flex justify-between items-center bg-surface/50">
                     <h3 className="font-semibold text-main text-sm flex items-center gap-2">
                         <Folder size={16} className="text-primary" />
                         添加到魔法词典
                     </h3>
                     <button onClick={() => setAddModalOpen(false)} className="text-muted hover:text-main"><X size={16} /></button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-muted font-bold">关键词 (中文 / English)</label>
                          <div className="p-3 bg-page rounded-lg border border-border/10 flex flex-col">
                              <span className="text-base font-bold text-main">{itemToAdd.zh}</span>
                              <span className="text-xs text-muted font-mono">{itemToAdd.en}</span>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted font-bold">选择分类</label>
                          <select 
                             value={targetCatId}
                             onChange={(e) => setTargetCatId(e.target.value)}
                             className="w-full bg-surface border border-border/10 rounded-xl px-3 py-2.5 text-sm text-main outline-none focus:border-primary"
                          >
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>

                      <button 
                        onClick={confirmAddToDictionary}
                        className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                          <Plus size={16} />
                          确认添加
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ToolsLab;