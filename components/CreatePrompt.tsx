import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Sparkles, Loader2, Save, Settings, Plus, X, Trash2, ChevronRight } from 'lucide-react';
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
  const [baseIdea, setBaseIdea] = useState('');
  const [style, setStyle] = useState(availableStyles[0] || 'Photorealistic');
  
  const [englishPrompt, setEnglishPrompt] = useState('');
  const [chinesePrompt, setChinesePrompt] = useState('');
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>(availableRatios[0]?.value || '1:1');

  // Management Modal State
  const [manageMode, setManageMode] = useState<'style' | 'ratio' | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');

  const handleEnhance = async () => {
    if (!baseIdea) return;
    setIsEnhancing(true);
    try {
      const result = await enhancePrompt(baseIdea, style);
      setEnglishPrompt(result.englishPrompt);
      setChinesePrompt(result.chineseTranslation);
    } catch (e) {
      alert("Enhancement failed. Check API Key.");
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
      alert("Generation failed. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedImage) return;
    const newPrompt: PromptData = {
      id: Date.now().toString(),
      title: baseIdea || "Untitled Creation",
      promptText: englishPrompt || baseIdea,
      promptTextZh: chinesePrompt || baseIdea,
      imageUrl: generatedImage,
      tags: [style.toLowerCase(), 'generated'],
      likes: 0,
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
            <div className="flex items-center gap-3 mb-6 border-b border-border/10 pb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-semibold text-main">Studio</h2>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               {/* Core Input */}
               <InputField 
                 label="Core Concept" 
                 value={baseIdea} 
                 onChange={(e: any) => setBaseIdea(e.target.value)} 
                 placeholder="Describe your imagination..." 
               />

               {/* Selectors */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Style</label>
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
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Ratio</label>
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

               {/* AI Action */}
               <button 
                  onClick={handleEnhance}
                  disabled={!baseIdea || isEnhancing}
                  className="w-full py-3 bg-surface hover:bg-elevated text-main rounded-xl text-sm font-medium transition-all border border-border/10 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
               >
                  {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                  Enhance & Translate
               </button>

                {/* Output Fields */}
                {(englishPrompt || isEnhancing) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                           <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Enhanced Prompt
                           </label>
                           <div className="bg-elevated border border-primary/20 rounded-xl p-4 text-sm text-main font-mono leading-relaxed shadow-inner">
                              {englishPrompt || "AI is thinking..."}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-semibold text-muted uppercase tracking-wider">Translation</label>
                           <div className="bg-surface border border-border/10 rounded-xl p-4 text-sm text-muted shadow-inner">
                              {chinesePrompt || "Translating..."}
                           </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-border/10">
                <button 
                onClick={handleGenerate}
                disabled={(!baseIdea && !englishPrompt) || isGenerating}
                className="w-full py-4 bg-main hover:opacity-90 text-page rounded-xl font-bold text-base shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                Generate Preview
                </button>
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
                            <button onClick={onCancel} className="flex-1 py-3 bg-surface text-muted rounded-xl font-medium hover:bg-elevated hover:text-main transition-colors border border-border/10">Discard</button>
                            <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors shadow-lg shadow-primary/20">Save</button>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center z-10 space-y-4">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto border border-border/10 shadow-inner">
                            {isGenerating ? <Loader2 className="animate-spin text-primary" size={32} /> : <ImageIcon className="text-muted" size={32} />}
                        </div>
                        <p className="text-muted font-medium tracking-wide">Preview Canvas</p>
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
                   Manage {manageMode === 'style' ? 'Styles' : 'Ratios'}
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
                    placeholder="New value..."
                    className="w-full bg-page border border-border/10 rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-primary"
                 />
                 {manageMode === 'ratio' && (
                     <input 
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        placeholder="Label (e.g. Ultrawide)..."
                        className="w-full bg-page border border-border/10 rounded-lg px-3 py-2 text-sm text-main outline-none focus:border-primary"
                     />
                 )}
                 <button onClick={handleAddItem} className="w-full py-2 bg-primary hover:opacity-90 text-white rounded-lg text-sm font-medium">Add Item</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CreatePrompt;
