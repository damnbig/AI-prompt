import React, { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle, Grid, Book, Command, Palette, Check, FlaskConical } from 'lucide-react';
import PromptCard from './components/PromptCard';
import CreatePrompt from './components/CreatePrompt';
import PromptDictionary from './components/PromptDictionary';
import ToolsLab from './components/ToolsLab';
import AdviceModal from './components/AdviceModal';
import { PromptData, ViewState, ModifierCategory, RatioOption, Theme } from './types';
import { INITIAL_PROMPTS, CATEGORIES, INITIAL_MODIFIERS, DEFAULT_STYLES, DEFAULT_RATIOS, THEMES } from './constants';

function App() {
  const [view, setView] = useState<ViewState>('gallery');
  const [prompts, setPrompts] = useState<PromptData[]>(INITIAL_PROMPTS);
  const [modifierCategories, setModifierCategories] = useState<ModifierCategory[]>(INITIAL_MODIFIERS);
  
  // Customization State
  const [availableStyles, setAvailableStyles] = useState<string[]>(DEFAULT_STYLES);
  const [availableRatios, setAvailableRatios] = useState<RatioOption[]>(DEFAULT_RATIOS);

  // Theme State - Default to Pro Dark
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  useEffect(() => {
     if (!process.env.API_KEY) {
         setApiKeyError(true);
     }
  }, []);

  const handleSavePrompt = (newPrompt: PromptData) => {
    setPrompts([newPrompt, ...prompts]);
    setView('gallery');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.promptTextZh && p.promptTextZh.includes(searchQuery)) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.tags.includes(selectedCategory);
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
    // Inject CSS Variables for global usage
    <div 
      className="min-h-screen relative overflow-hidden bg-page text-main font-sans selection:bg-primary/30 transition-colors duration-700 ease-in-out"
      style={themeStyles}
    >
      
      {/* Background Ambience - Dynamic Color */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] animate-spotlight" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px] animate-spotlight" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar - Glass Effect */}
      <nav className="sticky top-0 z-50 w-full glass-nav transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('gallery')}>
              <div className="w-8 h-8 bg-surface rounded-lg border border-border/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Command size={18} className="text-main" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-main/90">
                PromptVerse
              </span>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-main/5 p-1 rounded-xl border border-border/5">
                <NavItem active={view === 'gallery' || view === 'create'} onClick={() => setView('gallery')} icon={Grid} label="Gallery" />
                <NavItem active={view === 'dictionary'} onClick={() => setView('dictionary')} icon={Book} label="Dictionary" />
                <NavItem active={view === 'lab'} onClick={() => setView('lab')} icon={FlaskConical} label="Lab" />
                <NavItem active={false} onClick={() => setIsAdviceOpen(true)} icon={HelpCircle} label="Guide" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
               
               {/* Theme Switcher */}
               <div className="relative">
                  <button 
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className={`w-8 h-8 rounded-full border border-border/10 flex items-center justify-center transition-all duration-300 ${isThemeOpen ? 'bg-main/10 text-main scale-110' : 'text-muted hover:text-main'}`}
                    title="Change Appearance"
                  >
                    <Palette size={16} />
                  </button>
                  
                  {isThemeOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)} />
                      <div className="absolute top-full right-0 mt-3 p-2 glass-panel rounded-2xl flex flex-col gap-1 min-w-[160px] animate-in fade-in zoom-in-95 z-50 shadow-2xl">
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-widest px-3 py-1 mb-1">Theme</span>
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

               {apiKeyError && (
                 <span className="text-red-400 text-[10px] font-medium px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20 tracking-wide uppercase">
                   Missing Key
                 </span>
               )}
              
              <button
                onClick={() => setView(view === 'create' ? 'gallery' : 'create')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  view === 'create' 
                    ? 'bg-surface border-border/10 text-muted hover:bg-elevated'
                    : 'bg-main text-page border-transparent hover:opacity-90 shadow-[0_0_15px_rgba(var(--c-accent),0.2)]'
                }`}
              >
                {view === 'create' ? (
                  <>Cancel</>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>New</span>
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
            {/* Minimalist Hero */}
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-8">
              <h1 className="text-5xl font-semibold text-main tracking-tighter pb-2">
                Designed for Imagination.
              </h1>
              <p className="text-muted text-lg font-light tracking-wide leading-relaxed">
                A curated collection of AI prompts. Refined, organized, and ready for creation.
              </p>
            </div>

            {/* Search Bar & Filters - Floating Pill Design */}
            <div className="sticky top-20 z-40 mx-auto max-w-4xl">
              <div className="glass-panel rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl shadow-black/5">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-main transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-main placeholder-muted focus:ring-0 focus:bg-main/5 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="flex gap-1 overflow-x-auto no-scrollbar md:border-l border-border/10 md:pl-2">
                  {CATEGORIES.map(cat => (
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
              </div>
            </div>

            {/* Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-2">
              {filteredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} data={prompt} onCopy={handleCopy} />
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-muted">
                <div className="w-16 h-16 rounded-full bg-surface border border-border/10 flex items-center justify-center mb-4">
                    <Search size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">No results found</p>
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
           <ToolsLab />
        )}
      </main>

      <AdviceModal isOpen={isAdviceOpen} onClose={() => setIsAdviceOpen(false)} />
    </div>
  );
}

export default App;
