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
      title: "1. 结构化你的数据",
      desc: "伟大的提示词库需要健壮的数据结构。不要只存储文本；要存储“模型版本”、“随机种子(Seed)”、“采样器”、“负向提示词”和“宽高比”，以确保图像的可复现性。"
    },
    {
      icon: <Layout className="w-6 h-6 text-purple-400" />,
      title: "2. 视觉优先的体验",
      desc: "用户是为视觉而来的。使用瀑布流布局（Pinterest 风格）优雅地处理各种长宽比的图片。确保“复制提示词”是一个一键操作。"
    },
    {
      icon: <Wand2 className="w-6 h-6 text-pink-400" />,
      title: "3. AI 深度集成 (核心)",
      desc: "不要只做一个静态数据库。集成 LLM（如 Gemini）帮助用户将简单的“想法”扩展为专业的“提示词”。这将使你的应用变成一个生产力工具，而不仅仅是书签管理器。"
    },
    {
      icon: <Share2 className="w-6 h-6 text-green-400" />,
      title: "4. 社区与 Remix",
      desc: "实现“Remix (重混)”功能，让用户可以微调现有的提示词并保存变体。使用重度标签系统来增强发现性。"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-elevated border border-border/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-elevated/95 backdrop-blur border-b border-border/10 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-main flex items-center gap-2">
            <Lightbulb className="text-yellow-400" />
            构建指南
          </h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-muted text-lg">
            关于构建可扩展 AI 提示词仓库的架构建议：
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
            <h4 className="font-semibold text-primary mb-2">后续步骤</h4>
            <ul className="list-disc list-inside text-muted space-y-1">
              <li>实现用户认证 (Supabase/Firebase)。</li>
              <li>连接真实图像生成 API (Midjourney/SD)。</li>
              <li>添加“收藏夹/精选集”功能。</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border-t border-border/10 bg-surface rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-primary hover:opacity-90 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            明白了，开始探索
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;