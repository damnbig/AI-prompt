import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ChevronRight, Lock, Eye, EyeOff, Server, X } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceOpen?: boolean; // If true, cannot close without a key
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, forceOpen = false }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      if (stored) setKey(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!key.trim()) return;
    
    setIsValidating(true);
    // Simulate validation delay for effect
    setTimeout(() => {
        setStoredApiKey(key.trim());
        setIsValidating(false);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 800);
    }, 600);
  };

  const handleClear = () => {
      setStoredApiKey('');
      setKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic Backdrop */}
      <div 
        className="absolute inset-0 bg-page/80 backdrop-blur-md transition-opacity duration-500"
        onClick={!forceOpen ? onClose : undefined}
      />

      <div className="relative w-full max-w-md bg-elevated border border-border/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Graphic */}
        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px', color: 'rgb(var(--c-accent))' }}></div>
            <div className="w-16 h-16 rounded-2xl bg-surface/50 border border-border/10 backdrop-blur-xl flex items-center justify-center shadow-glow relative z-10">
                <Key className="text-primary" size={32} />
            </div>
            {!forceOpen && (
                <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-main transition-colors">
                    <X size={20} />
                </button>
            )}
        </div>

        <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-main">Authenticate Neural Engine</h2>
                <p className="text-sm text-muted">
                    To enable AI generation features on your private server, please provide a valid Google Gemini API Key.
                </p>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                        <Lock size={16} />
                    </div>
                    <input 
                        type={showKey ? "text" : "password"}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-surface border border-border/10 rounded-xl py-3.5 pl-11 pr-12 text-main placeholder-muted/50 outline-none focus:border-primary/50 transition-all font-mono text-sm shadow-inner"
                    />
                    <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                    >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted bg-surface/50 p-3 rounded-lg border border-border/5">
                    <ShieldCheck size={12} className="text-green-500" />
                    <span>Key is stored securely in your browser's LocalStorage.</span>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                {key && (
                    <button 
                        onClick={handleClear}
                        className="px-4 py-3 rounded-xl text-xs font-medium text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Clear
                    </button>
                )}
                <button 
                    onClick={handleSave}
                    disabled={!key || isValidating || isSaved}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isSaved 
                        ? 'bg-green-500 text-white shadow-green-500/20' 
                        : 'bg-primary text-white hover:opacity-90 shadow-primary/20'
                    }`}
                >
                    {isValidating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isSaved ? (
                        <>
                            <ShieldCheck size={16} />
                            Verified
                        </>
                    ) : (
                        <>
                            Connect
                            <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
            
            <div className="text-center">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-muted hover:text-primary hover:underline transition-colors flex items-center justify-center gap-1">
                    <Server size={10} />
                    Get a Gemini API Key
                 </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
