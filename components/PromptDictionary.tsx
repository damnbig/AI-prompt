import React, { useState } from 'react';
import { Plus, Trash2, Folder, Tag, ChevronRight, Save, X, Check, Copy, Edit2 } from 'lucide-react';
import { ModifierCategory, Modifier } from '../types';

interface PromptDictionaryProps {
  categories: ModifierCategory[];
  setCategories: (cats: ModifierCategory[]) => void;
}

interface ModifierCardProps {
  modifier: Modifier;
  onDelete: () => void;
}

const ModifierCard: React.FC<ModifierCardProps> = ({ modifier, onDelete }) => {
  const [copiedEn, setCopiedEn] = useState(false);
  const [copiedZh, setCopiedZh] = useState(false);

  const handleCopy = (text: string, isEn: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEn) {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 1500);
    } else {
      setCopiedZh(true);
      setTimeout(() => setCopiedZh(false), 1500);
    }
  };

  return (
    <div className="group bg-surface border border-border/10 rounded-xl p-4 hover:bg-elevated transition-all duration-200 hover:shadow-lg relative">
      <button 
          onClick={onDelete}
          className="absolute top-2 right-2 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
          <Trash2 size={12} />
      </button>
      
      {/* Chinese Text */}
      <div 
        onClick={() => handleCopy(modifier.zh, false)}
        className="flex items-center gap-2 mb-3 cursor-pointer select-none"
      >
          <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
          <span className="font-medium text-main group-hover:text-primary transition-colors">{modifier.zh}</span>
          {copiedZh && <Check size={12} className="text-green-500 animate-in fade-in zoom-in" />}
      </div>
      
      {/* English Text - Terminal Style */}
      <div 
        onClick={() => handleCopy(modifier.en, true)}
        className="text-xs font-mono text-muted bg-page/50 p-3 rounded-lg border border-border/10 cursor-pointer hover:border-primary/30 hover:text-main transition-all flex justify-between items-center shadow-inner"
      >
          <span className="truncate mr-2">{modifier.en}</span>
          {copiedEn ? (
            <Check size={12} className="text-green-500 shrink-0" />
          ) : (
            <Copy size={12} className="text-muted opacity-0 group-hover:opacity-100 shrink-0" />
          )}
      </div>
    </div>
  );
};

const PromptDictionary: React.FC<PromptDictionaryProps> = ({ categories, setCategories }) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagEn, setNewTagEn] = useState('');
  const [newTagZh, setNewTagZh] = useState('');

  const selectedCategory = categories.find(c => c.id === selectedCatId);

  const handleAddCategory = () => {
    const id = Date.now().toString();
    const newCat: ModifierCategory = { id, name: 'New Folder', modifiers: [] };
    setCategories([...categories, newCat]);
    setSelectedCatId(id);
    setNewCatName('New Folder');
    setIsEditingCat(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this folder and all prompts inside?')) {
      const newCats = categories.filter(c => c.id !== id);
      setCategories(newCats);
      if (selectedCatId === id) setSelectedCatId(newCats[0]?.id || '');
    }
  };

  const handleSaveCategoryName = () => {
    if (!newCatName.trim()) return;
    setCategories(categories.map(c => c.id === selectedCatId ? { ...c, name: newCatName } : c));
    setIsEditingCat(false);
  };

  const handleAddTag = () => {
    if (!newTagEn.trim() || !newTagZh.trim()) return;
    const newTag: Modifier = { id: Date.now().toString(), en: newTagEn, zh: newTagZh };
    setCategories(categories.map(c => c.id === selectedCatId ? { ...c, modifiers: [...c.modifiers, newTag] } : c));
    setNewTagEn('');
    setNewTagZh('');
    setIsAddingTag(false);
  };

  const handleDeleteTag = (tagId: string) => {
    setCategories(categories.map(c => c.id === selectedCatId ? { ...c, modifiers: c.modifiers.filter(m => m.id !== tagId) } : c));
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] glass-panel rounded-2xl shadow-2xl overflow-hidden flex animate-in fade-in duration-500">
      
      {/* Sidebar: MacOS Finder Style */}
      <div className="w-64 border-r border-border/10 bg-surface/30 flex flex-col backdrop-blur-sm">
        <div className="p-4 flex justify-between items-center opacity-80">
          <span className="text-xs font-semibold text-muted uppercase tracking-widest pl-2">Library</span>
          <button onClick={handleAddCategory} className="text-muted hover:text-main transition-colors p-1"><Plus size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium transition-all ${
                selectedCatId === cat.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted hover:bg-main/5 hover:text-main'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                 <Folder size={14} className={selectedCatId === cat.id ? 'text-white' : 'text-muted'} />
                 <span className="truncate">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-transparent">
        {selectedCategory ? (
          <>
            {/* Toolbar */}
            <div className="h-16 border-b border-border/10 flex justify-between items-center px-8">
              {isEditingCat ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="bg-elevated border-none text-main px-3 py-1 rounded-md outline-none focus:ring-1 focus:ring-primary w-64"
                    autoFocus
                  />
                  <button onClick={handleSaveCategoryName} className="p-1.5 bg-surface text-green-500 rounded border border-border/10"><Save size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                    <h2 className="text-xl font-semibold text-main tracking-tight">{selectedCategory.name}</h2>
                    <button onClick={() => { setNewCatName(selectedCategory.name); setIsEditingCat(true); }} className="text-muted hover:text-main opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14} /></button>
                </div>
              )}
              
              <div className="flex gap-2">
                 <button onClick={() => setIsAddingTag(true)} className="flex items-center gap-2 px-3 py-1.5 bg-main text-page rounded-lg text-xs font-semibold hover:opacity-90 transition-colors shadow-sm">
                    <Plus size={14} /> Add Prompt
                 </button>
                 <button onClick={() => handleDeleteCategory(selectedCategory.id)} className="p-2 text-muted hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-transparent to-black/5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isAddingTag && (
                    <div className="bg-surface border border-primary/50 rounded-xl p-4 shadow-lg animate-in zoom-in-95">
                        <div className="space-y-3">
                            <input 
                                placeholder="Chinese Name..."
                                value={newTagZh}
                                onChange={e => setNewTagZh(e.target.value)}
                                className="w-full bg-page border border-border/10 rounded-lg p-2 text-sm text-main outline-none focus:border-primary"
                                autoFocus
                            />
                            <input 
                                placeholder="English Prompt..."
                                value={newTagEn}
                                onChange={e => setNewTagEn(e.target.value)}
                                className="w-full bg-page border border-border/10 rounded-lg p-2 text-sm text-muted font-mono outline-none focus:border-primary"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                                <button onClick={() => setIsAddingTag(false)} className="text-xs text-muted hover:text-main px-2">Cancel</button>
                                <button onClick={handleAddTag} className="text-xs bg-primary text-white px-3 py-1 rounded hover:opacity-90">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedCategory.modifiers.map(mod => (
                  <ModifierCard 
                    key={mod.id} 
                    modifier={mod} 
                    onDelete={() => handleDeleteTag(mod.id)} 
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
             <div className="text-center">
                 <Folder size={48} className="mx-auto mb-4 opacity-20" />
                 <p className="text-sm font-medium">Select a folder</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptDictionary;
