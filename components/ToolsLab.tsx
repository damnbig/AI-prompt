import React, { useState, useRef } from 'react';
import { Upload, ScanLine, Wand2, Clipboard, Check, Layers, Tag, X, FileJson, Image as ImageIcon, Loader2 } from 'lucide-react';
import { reverseImagePrompt, analyzePromptStructure } from '../services/geminiService';
import { PromptAnalysisResult } from '../types';

const ResultChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-main/5 text-main border border-border/10">
    {label}
  </span>
);

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-3 text-muted">
      <Icon size={14} />
      <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
  </div>
);

const ToolsLab = () => {
  const [activeTab, setActiveTab] = useState<'reverse' | 'deconstruct'>('reverse');

  // Reverse State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reversedPrompt, setReversedPrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  // Analyze State
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Reverse ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setReversedPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReverse = async () => {
    if (!selectedImage) return;
    setIsReversing(true);
    try {
      const result = await reverseImagePrompt(selectedImage);
      setReversedPrompt(result);
    } catch (e) {
      alert("Failed to analyze image. Check API Key.");
    } finally {
      setIsReversing(false);
    }
  };

  const handleCopyPrompt = () => {
      if (!reversedPrompt) return;
      navigator.clipboard.writeText(reversedPrompt);
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
      alert("Failed to analyze text.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      
      {/* Header & Toggle */}
      <div className="flex flex-col items-center justify-center mb-10 space-y-6">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-main tracking-tight">Pro Lab</h2>
            <p className="text-muted text-sm">Experimental tools for advanced prompt engineering.</p>
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
                Reverse Image
            </button>
            <button 
                onClick={() => setActiveTab('deconstruct')}
                className={`relative z-10 w-[140px] py-1.5 text-sm font-medium transition-colors ${activeTab === 'deconstruct' ? 'text-main' : 'text-muted hover:text-main'}`}
            >
                Deconstruct
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'reverse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full animate-in slide-in-from-left-4 duration-500">
                {/* Upload Zone */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                    <SectionTitle icon={ImageIcon} title="Input Source" />
                    
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
                                    <p className="text-main font-medium text-sm">Drop an image here</p>
                                    <p className="text-muted text-xs">or click to browse</p>
                                </div>
                            </div>
                        )}
                        
                        {selectedImage && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setReversedPrompt(''); }}
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
                        Scan & Describe
                    </button>
                </div>

                {/* Output Zone - Cinematic Text View */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <SectionTitle icon={Wand2} title="Cinematic Analysis" />
                        {reversedPrompt && (
                            <button 
                                onClick={handleCopyPrompt} 
                                className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${copiedPrompt ? 'bg-green-500/20 text-green-400' : 'bg-surface hover:bg-main/10 text-main'}`}
                            >
                                {copiedPrompt ? <Check size={12} /> : <Clipboard size={12} />}
                                {copiedPrompt ? 'Copied' : 'Copy Text'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-surface border border-border/10 rounded-xl p-0 overflow-hidden relative">
                        {isReversing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
                                <Loader2 className="animate-spin text-primary" size={24} />
                                <span className="text-xs tracking-widest uppercase animate-pulse">Deconstructing Narrative...</span>
                            </div>
                        ) : reversedPrompt ? (
                           <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-page/30">
                                <div className="prose prose-sm prose-invert max-w-none space-y-4">
                                    {reversedPrompt.split('\n\n').map((paragraph, index) => (
                                        <p key={index} className="text-main leading-relaxed font-sans text-sm">
                                            {paragraph.trim()}
                                        </p>
                                    ))}
                                </div>
                           </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted opacity-40 p-8 text-center">
                                <ScanLine size={32} strokeWidth={1.5} className="mb-2" />
                                <p className="text-xs">Upload an image to extract its narrative DNA</p>
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
                    <SectionTitle icon={FileJson} title="Raw Prompt / JSON / Text" />
                    <div className="relative">
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste any messy prompt, JSON, or paragraph here..."
                            rows={4}
                            className="w-full bg-surface border border-border/10 rounded-xl p-4 pr-32 text-main placeholder-muted outline-none focus:border-primary/50 transition-all resize-none text-sm font-mono"
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={!rawText || isAnalyzing}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-main text-page rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : <Layers size={12} />}
                            Deconstruct
                        </button>
                    </div>
                 </div>

                 {/* Results Grid */}
                 {analysisResult && (
                    <div className="glass-panel rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                        <SectionTitle icon={Tag} title="Structured Components" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'Subject', data: analysisResult.subject, color: 'border-blue-500/30' },
                                { title: 'Style', data: analysisResult.style, color: 'border-purple-500/30' },
                                { title: 'Medium', data: analysisResult.medium, color: 'border-pink-500/30' },
                                { title: 'Lighting', data: analysisResult.lighting, color: 'border-yellow-500/30' },
                                { title: 'Camera', data: analysisResult.camera, color: 'border-green-500/30' },
                                { title: 'Artists', data: analysisResult.artists, color: 'border-orange-500/30' },
                                { title: 'Colors', data: analysisResult.colorPalette, color: 'border-red-500/30' },
                                { title: 'Details', data: analysisResult.additionalDetails, color: 'border-gray-500/30' },
                            ].map((cat) => (
                                <div key={cat.title} className={`p-4 rounded-xl bg-surface border ${cat.color} flex flex-col gap-2 h-full`}>
                                    <span className="text-xs font-bold text-muted uppercase">{cat.title}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.data && cat.data.length > 0 ? (
                                            cat.data.map((item, i) => <ResultChip key={i} label={item} />)
                                        ) : (
                                            <span className="text-xs text-muted/50 italic">None</span>
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
    </div>
  );
};

export default ToolsLab;
