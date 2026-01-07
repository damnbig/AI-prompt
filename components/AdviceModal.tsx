import React from 'react';
import { X, Lightbulb, Layout, Database, Wand2, Share2 } from 'lucide-react';

interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdviceModal: React.FC<AdviceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Database className="w-6 h-6 text-blue-400" />,
      title: "1. Structure Your Data",
      desc: "Great prompt libraries need robust data structures. Don't just store text; store 'Model Version', 'Seed', 'Sampler', 'Negative Prompt', and 'Aspect Ratio' to ensure reproducibility."
    },
    {
      icon: <Layout className="w-6 h-6 text-purple-400" />,
      title: "2. Visual-First Experience",
      desc: "Users come for the visuals. Use masonry layouts (Pinterest style) to handle diverse aspect ratios elegantly. Ensure 'Copy Prompt' is a single-click action."
    },
    {
      icon: <Wand2 className="w-6 h-6 text-pink-400" />,
      title: "3. AI Integration (The Core)",
      desc: "Don't just be a static database. Integrate LLMs (like Gemini) to help users enhance simple 'ideas' into professional 'prompts'. This turns your app into a productivity tool, not just a bookmark manager."
    },
    {
      icon: <Share2 className="w-6 h-6 text-green-400" />,
      title: "4. Community & Remixing",
      desc: "Implement 'Remix' functionality where users can tweak existing prompts and save variants. Use a heavy Tagging system for discovery."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-elevated border border-border/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-elevated/95 backdrop-blur border-b border-border/10 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-main flex items-center gap-2">
            <Lightbulb className="text-yellow-400" />
            Building Guide
          </h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-muted text-lg">
            Architectural advice for building scalable AI prompt repositories:
          </p>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-surface p-4 rounded-xl border border-border/10 hover:border-border/20 transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-page rounded-lg shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-main text-lg mb-1">{step.title}</h3>
                    <p className="text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <h4 className="font-semibold text-primary mb-2">Next Steps</h4>
            <ul className="list-disc list-inside text-muted space-y-1">
              <li>Implement User Auth (Supabase/Firebase).</li>
              <li>Connect Real Image Gen APIs (Midjourney/SD).</li>
              <li>Add "Collections/Favorites" feature.</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border-t border-border/10 bg-surface rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-primary hover:opacity-90 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            Got it, Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;
