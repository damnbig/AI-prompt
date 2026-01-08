export interface PromptData {
  id: string;
  title: string;
  promptText: string;
  promptTextZh?: string; // Chinese translation
  negativePrompt?: string;
  tags: string[];
  imageUrl: string;
  modelUsed?: string;
  aspectRatio?: string;
  likes: number; // Kept for legacy compatibility, but UI will use bookmark logic
  isBookmarked?: boolean; // New field for collections
  author: string;
  createdAt: number;
}

export interface Category {
  id: string;
  label: string;
  value: string;
}

export interface Modifier {
  id: string;
  zh: string;
  en: string;
}

export interface ModifierCategory {
  id: string;
  name: string;
  modifiers: Modifier[];
}

export type ViewState = 'gallery' | 'create' | 'dictionary' | 'lab' | 'guide';

export interface RatioOption {
  label: string;
  value: string;
}

export interface GenerationConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  stylePreset: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    page: string;      // Main background RGB
    surface: string;   // Cards/Panels RGB
    elevated: string;  // Dropdowns/Modals RGB
    textMain: string;  // H1/Body RGB
    textMuted: string; // Subtitles RGB
    border: string;    // Borders RGB
    accent: string;    // Primary Action RGB
  }
}

// Updated to support Bilingual Analysis
export interface AnalysisItem {
  en: string;
  zh: string;
}

export interface PromptAnalysisResult {
  subject: AnalysisItem[];
  style: AnalysisItem[];
  medium: AnalysisItem[];
  lighting: AnalysisItem[];
  camera: AnalysisItem[];
  artists: AnalysisItem[];
  colorPalette: AnalysisItem[];
  additionalDetails: AnalysisItem[];
}