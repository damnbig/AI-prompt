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
  likes: number;
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

export interface PromptAnalysisResult {
  subject: string[];
  style: string[];
  medium: string[];
  lighting: string[];
  camera: string[];
  artists: string[];
  colorPalette: string[];
  additionalDetails: string[];
}
