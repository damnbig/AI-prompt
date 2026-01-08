import React, { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle, Grid, Book, Command, Palette, Check, FlaskConical, Key, Settings, Trash2, X, Tag } from 'lucide-react';
import PromptCard from './components/PromptCard';
import CreatePrompt from './components/CreatePrompt';
import PromptDictionary from './components/PromptDictionary';
import ToolsLab from './components/ToolsLab';
import AdviceModal from './components/AdviceModal';
import ApiKeyModal from './components/ApiKeyModal';
import ImageDetailModal from './components/ImageDetailModal';
import { PromptData, ViewState, ModifierCategory, RatioOption, Theme, Category } from './types';
import { INITIAL_PROMPTS, CATEGORIES as DEFAULT_CATEGORIES, INITIAL_MODIFIERS, DEFAULT_STYLES, DEFAULT_RATIOS, THEMES } from './constants';
import { getStoredApiKey } from './services/geminiService';

function App() {
  const [view, setView] = useState<ViewState>('gallery');
  const [prompts, setPrompts] = useState<PromptData[]>(INITIAL_PROMPTS);
  const [modifierCategories, setModifierCategories] = useState<ModifierCategory[]>(INITIAL_MODIFIERS);
  
  // Customization State
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [availableStyles, setAvailableStyles] = useState<string[]>(DEFAULT_STYLES);
  const [availableRatios, setAvailableRatios] = useState<RatioOption[]>(DEFAULT_RATIOS);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal States
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [forceKeyModal, setForceKeyModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  
  // Category Manager Modal State
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');

  useEffect(() => {
     // Check for API Key on mount
     const key = getStoredApiKey();
     if (!key) {
         setForceKeyModal(true);
         setIsKeyModalOpen(true);
     }
  }, []);

  // --- CRUD Operations ---

  const handleSavePrompt = (newPrompt: PromptData) => {
    setPrompts([newPrompt, ...prompts]);
    setView('gallery');
  };

  const handleUpdatePrompt = (updatedPrompt: PromptData) => {
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      setSelectedPrompt(updatedPrompt); // Update the modal view to reflect changes immediately
  };

  const handleDeletePrompt = (id: string) => {
      // Logic moved to component or simplified here. 
      // The component will handle the "Are you sure" UI, here we just execute.
      const newPrompts = prompts.filter(p => p.id !== id);
      setPrompts(newPrompts);
      setSelectedPrompt(null); // Close modal immediately
  };

  const handleToggleBookmark = (id: string) => {
      setPrompts(prompts.map(p => 
          p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p
      ));
      
      if (selectedPrompt && selectedPrompt.id === id) {
          setSelectedPrompt(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
      }
  };

  const handleAddCategory = () => {
      if (!newCategoryName.trim()) return;
      // Auto-generate value if empty
      const val = newCategoryValue.trim() || newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
      
      const newCat: Category = {
          id: val,
          label: newCategoryName.trim(),
          value: val
      };
      
      setCategories([...categories, newCat]);
      setNewCategoryName('');
      setNewCategoryValue('');
  };

  const handleDeleteCategory = (id: string) => {
      // Prevent deleting 'all' or 'favorites'
      if (id === 'all' || id === 'favorites') return;
      
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCategory === id) setSelectedCategory('all');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.promptTextZh && p.promptTextZh.includes(searchQuery)) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'favorites' 
            ? p.isBookmarked 
            : p.tags.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Nav Item Component
  const NavItem = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-main/10 text-main shadow-sm' 
          : 'text-muted hover:text-main hover:bg-main/5'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  // CSS Variable Style Object
  const themeStyles = {
    '--c-page': currentTheme.colors.page,
    '--c-surface': currentTheme.colors.surface,
    '--c-elevated': currentTheme.colors.elevated,
    '--c-text-main': currentTheme.colors.textMain,
    '--c-text-muted': currentTheme.colors.textMuted,
    '--c-border': currentTheme.colors.border,
    '--c-accent': currentTheme.colors.accent,
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-page text-main font-sans selection:bg-primary/30 transition-colors duration-700 ease-in-out"
      style={themeStyles}
    >
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] animate-spotlight" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px] animate-spotlight" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full glass-nav transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('gallery')}>
              <div className="w-8 h-8 bg-surface rounded-lg border border-border/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Command size={18} className="text-main" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-main/90">
                PromptVerse
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-main/5 p-1 rounded-xl border border-border/5">
                <NavItem active={view === 'gallery' || view === 'create'} onClick={() => setView('gallery')} icon={Grid} label="灵感画廊" />
                <NavItem active={view === 'dictionary'} onClick={() => setView('dictionary')} icon={Book} label="魔法词典" />
                <NavItem active={view === 'lab'} onClick={() => setView('lab')} icon={FlaskConical} label="实验室" />
                <NavItem active={false} onClick={() => setIsAdviceOpen(true)} icon={HelpCircle} label="指南" />
            </div>

            <div className="flex items-center gap-4">
               <button 
                    onClick={() => { setForceKeyModal(false); setIsKeyModalOpen(true); }}
                    className="w-8 h-8 rounded-full border border-border/10 flex items-center justify-center text-muted hover:text-primary transition-colors hover:bg-main/5"
                    title="配置 API Key"
                >
                    <Key size={16} />
               </button>
               
               <div className="relative">
                  <button 
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className={`w-8 h-8 rounded-full border border-border/10 flex items-center justify-center transition-all duration-300 ${isThemeOpen ? 'bg-main/10 text-main scale-110' : 'text-muted hover:text-main'}`}
                    title="切换主题"
                  >
                    <Palette size={16} />
                  </button>
                  
                  {isThemeOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 p-2 glass-panel rounded-2xl flex flex-col gap-1 min-w-[160px] animate-in fade-in zoom-in-95 z-50 shadow-2xl">
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-widest px-3 py-1 mb-1">主题 (Theme)</span>
                          {THEMES.map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => { setCurrentTheme(theme); setIsThemeOpen(false); }}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-main/5 transition-colors group"
                            >
                               <div 
                                 className="w-4 h-4 rounded-full border border-border/20 shadow-sm transition-transform group-hover:scale-110" 
                                 style={{ backgroundColor: `rgb(${theme.colors.page})` }}
                               />
                               <span className={`text-sm ${currentTheme.id === theme.id ? 'text-main font-medium' : 'text-muted'}`}>
                                 {theme.name}
                               </span>
                               {currentTheme.id === theme.id && <Check size={14} className="ml-auto text-primary" />}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
               </div>
              
              <button
                onClick={() => setView(view === 'create' ? 'gallery' : 'create')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  view === 'create' 
                    ? 'bg-surface border-border/10 text-muted hover:bg-elevated'
                    : 'bg-main text-page border-transparent hover:opacity-90 shadow-[0_0_15px_rgba(var(--c-accent),0.2)]'
                }`}
              >
                {view === 'create' ? (
                  <>取消</>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>新建</span>
                  </>
                )}
              </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {view === 'gallery' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero */}
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-8">
              <h1 className="text-5xl font-semibold text-main tracking-tighter pb-2">
                为想象力而生。
              </h1>
              <p className="text-muted text-lg font-light tracking-wide leading-relaxed">
                精选 AI 提示词库。经过打磨、分类，随时准备点燃你的创作火花。
              </p>
            </div>

            {/* Search Bar & Filters */}
            <div className="sticky top-20 z-40 mx-auto max-w-5xl">
              <div className="glass-panel rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/5">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-main transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="搜索提示词、标签或创意..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-main placeholder-muted focus:ring-0 focus:bg-main/5 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="flex items-center gap-2 md:border-l border-border/10 md:pl-2">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[500px]">
                        {categories.map(cat => (
                            <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                                selectedCategory === cat.id
                                ? 'bg-main text-page shadow-sm'
                                : 'text-muted hover:bg-main/5 hover:text-main'
                            }`}
                            >
                            {cat.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="w-px h-6 bg-border/10 mx-1"></div>

                    <button 
                        onClick={() => setIsCatManagerOpen(true)}
                        className="p-2 text-muted hover:text-main hover:bg-main/5 rounded-lg transition-colors"
                        title="管理分类"
                    >
                        <Settings size={16} />
                    </button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-2">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                    key={prompt.id} 
                    data={prompt} 
                    onCopy={handleCopy} 
                    onToggleBookmark={handleToggleBookmark}
                    onClick={() => setSelectedPrompt(prompt)}
                />
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-muted">
                <div className="w-16 h-16 rounded-full bg-surface border border-border/10 flex items-center justify-center mb-4">
                    <Search size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">未找到相关结果</p>
                {selectedCategory === 'favorites' && <p className="text-xs text-muted mt-2">点击卡片右下角的书签图标即可收藏。</p>}
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <CreatePrompt 
            onSave={handleSavePrompt} 
            onCancel={() => setView('gallery')}
            availableStyles={availableStyles}
            setAvailableStyles={setAvailableStyles}
            availableRatios={availableRatios}
            setAvailableRatios={setAvailableRatios}
          />
        )}

        {view === 'dictionary' && (
            <PromptDictionary 
                categories={modifierCategories}
                setCategories={setModifierCategories}
            />
        )}
        
        {view === 'lab' && (
           <ToolsLab categories={modifierCategories} setCategories={setModifierCategories} />
        )}
      </main>

      {/* Category Manager Modal */}
      {isCatManagerOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-elevated border border-border/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-border/10 flex justify-between items-center bg-surface/50">
                      <h3 className="font-semibold text-main text-sm flex items-center gap-2">
                          <Tag size={16} className="text-primary" />
                          管理筛选分类
                      </h3>
                      <button onClick={() => setIsCatManagerOpen(false)} className="text-muted hover:text-main"><X size={18} /></button>
                  </div>
                  
                  <div className="p-0 max-h-[400px] overflow-y-auto">
                      {categories.map((cat) => (
                          <div key={cat.id} className="flex justify-between items-center px-6 py-4 border-b border-border/5 hover:bg-main/5 group transition-colors">
                              <div>
                                  <div className="text-sm font-medium text-main">{cat.label}</div>
                                  <div className="text-xs text-muted font-mono">{cat.value}</div>
                              </div>
                              
                              {/* Protect default categories */}
                              {!['all', 'favorites'].includes(cat.id) && (
                                  <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-2 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-surface border border-border/10 rounded-lg"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="p-4 bg-surface/50 space-y-3 border-t border-border/10">
                      <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted">新增分类名称</label>
                          <input 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="例如：极简主义..."
                              className="w-full bg-page border border-border/10 rounded-xl px-4 py-2.5 text-sm text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                      </div>
                      <div className="space-y-1">
                           <label className="text-[10px] uppercase font-bold text-muted">Value / Tag (可选，自动生成)</label>
                           <input 
                              value={newCategoryValue}
                              onChange={(e) => setNewCategoryValue(e.target.value)}
                              placeholder="例如：minimalist"
                              className="w-full bg-page border border-border/10 rounded-xl px-4 py-2.5 text-sm text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                          />
                      </div>
                      <button 
                          onClick={handleAddCategory} 
                          disabled={!newCategoryName.trim()}
                          className="w-full py-3 bg-primary hover:opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                      >
                          添加分类
                      </button>
                  </div>
              </div>
          </div>
      )}

      <AdviceModal isOpen={isAdviceOpen} onClose={() => setIsAdviceOpen(false)} />
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} forceOpen={forceKeyModal} />

      {/* Image Detail Lightbox with Edit Capability */}
      <ImageDetailModal 
        data={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onToggleBookmark={handleToggleBookmark}
        onDelete={handleDeletePrompt}
        onUpdate={handleUpdatePrompt}
      />
    </div>
  );
}

export default App;