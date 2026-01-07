import { Category, PromptData, ModifierCategory, RatioOption, Theme } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', label: '全部', value: 'all' },
  { id: 'photorealistic', label: '真实感', value: 'photorealistic' },
  { id: 'anime', label: '动漫 & 漫画', value: 'anime' },
  { id: 'cyberpunk', label: '赛博朋克', value: 'cyberpunk' },
  { id: 'fantasy', label: '奇幻艺术', value: 'fantasy' },
  { id: '3d', label: '3D 渲染', value: '3d' },
  { id: 'abstract', label: '抽象派', value: 'abstract' },
];

export const DEFAULT_STYLES: string[] = [
  "Photorealistic",
  "Anime",
  "Cyberpunk",
  "Oil Painting",
  "3D Render",
  "Vector Art",
  "Watercolor",
  "Sketch"
];

export const DEFAULT_RATIOS: RatioOption[] = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Portrait (9:16)", value: "9:16" },
  { label: "Portrait (3:4)", value: "3:4" },
  { label: "Landscape (4:3)", value: "4:3" }
];

export const INITIAL_MODIFIERS: ModifierCategory[] = [
  {
    id: 'aesthetics',
    name: '🎨 美学风格 (Aesthetics)',
    modifiers: [
      { id: '1', zh: '赛博朋克', en: 'Cyberpunk' },
      { id: '2', zh: '蒸汽朋克', en: 'Steampunk' },
      { id: '3', zh: '极简主义', en: 'Minimalist' },
      { id: '4', zh: '像素艺术', en: 'Pixel Art' },
      { id: '5', zh: '浮世绘', en: 'Ukiyo-e' },
      { id: '6', zh: '吉卜力风格', en: 'Studio Ghibli Style' }
    ]
  },
  {
    id: 'lighting',
    name: '💡 灯光与氛围 (Lighting)',
    modifiers: [
      { id: '1', zh: '电影光效', en: 'Cinematic Lighting' },
      { id: '2', zh: '体积光/丁达尔效应', en: 'Volumetric Lighting' },
      { id: '3', zh: '生物发光', en: 'Bioluminescent' },
      { id: '4', zh: '黄金时刻', en: 'Golden Hour' },
      { id: '5', zh: '赛博霓虹', en: 'Neon Lights' }
    ]
  },
  {
    id: 'camera',
    name: '📷 相机与镜头 (Camera)',
    modifiers: [
      { id: '1', zh: '广角镜头', en: 'Wide Angle' },
      { id: '2', zh: '微距摄影', en: 'Macro Photography' },
      { id: '3', zh: '鱼眼镜头', en: 'Fisheye Lens' },
      { id: '4', zh: '景深/背景虚化', en: 'Depth of Field' },
      { id: '5', zh: '航拍视角', en: 'Aerial View' }
    ]
  },
  {
    id: 'composition',
    name: '📐 构图 (Composition)',
    modifiers: [
      { id: '1', zh: '对称构图', en: 'Symmetrical' },
      { id: '2', zh: '极简构图', en: 'Minimalist Composition' },
      { id: '3', zh: '引导线', en: 'Leading Lines' },
      { id: '4', zh: '中心构图', en: 'Centered' }
    ]
  }
];

// Semantic Color Palettes (RGB values)
export const THEMES: Theme[] = [
  { 
    id: 'pro-dark', 
    name: 'Pro Dark', 
    colors: {
      page: '0 0 0',          // Pure Black
      surface: '24 24 27',    // Zinc 900
      elevated: '39 39 42',   // Zinc 800
      textMain: '255 255 255',
      textMuted: '161 161 170',
      border: '255 255 255',  // White (handled with opacity)
      accent: '10 132 255'    // iOS Blue
    }
  },
  { 
    id: 'snow-white', 
    name: 'Snow White', 
    colors: {
      page: '245 245 247',    // Apple Off-White
      surface: '255 255 255', // Pure White
      elevated: '255 255 255',
      textMain: '29 29 31',   // Almost Black
      textMuted: '134 134 139',
      border: '0 0 0',        // Black (handled with opacity)
      accent: '0 122 255'     // Classic Blue
    }
  },
  { 
    id: 'titanium', 
    name: 'Natural', 
    colors: {
      page: '142 142 147',    // Warm Grey Base
      surface: '66 66 69',    // Darker Metallic
      elevated: '99 99 102',  // Lighter Metallic
      textMain: '242 242 247',
      textMuted: '209 209 214',
      border: '229 229 234',
      accent: '255 214 10'    // Warm Gold/Yellow
    }
  }
];

export const INITIAL_PROMPTS: PromptData[] = [
  {
    id: '1',
    title: '霓虹赛博武士',
    promptText: 'A futuristic samurai standing in a rainy cyberpunk city, neon lights reflecting off wet pavement, detailed armor with glowing circuitry, cinematic lighting, 8k resolution, unreal engine 5 render, highly detailed, sharp focus.',
    promptTextZh: '一位未来的武士站在多雨的赛博朋克城市中，霓虹灯在湿润的路面上反射，精细的盔甲带有发光的电路，电影级照明，8k分辨率，虚幻引擎5渲染，高度细节，清晰对焦。',
    tags: ['cyberpunk', 'scifi', 'character', 'neon'],
    imageUrl: 'https://picsum.photos/seed/cyberpunk/800/800',
    likes: 124,
    author: 'NeoArtist',
    createdAt: Date.now()
  },
  {
    id: '2',
    title: '空灵森林之灵',
    promptText: 'A mystical forest spirit made of glowing light and leaves, deep ancient forest background, bioluminescent plants, magical atmosphere, soft ethereal glow, intricate details, fantasy art style, masterpiece.',
    promptTextZh: '由发光的光芒和树叶组成的神秘森林之灵，深邃的古老森林背景，生物发光植物，魔法氛围，柔和的空灵光芒，错综复杂的细节，奇幻艺术风格，杰作。',
    tags: ['fantasy', 'nature', 'magic', 'ethereal'],
    imageUrl: 'https://picsum.photos/seed/forest/800/1200',
    likes: 89,
    author: 'NatureLover',
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    title: '复古等轴测房间',
    promptText: 'Isometric view of a cozy retro gamer room, 90s aesthetic, crt tv, game consoles, messy but cozy, warm lighting, lo-fi vibe, voxel art style, 3d render, blender.',
    promptTextZh: '舒适的复古游戏玩家房间的等轴测视图，90年代美学，CRT电视，游戏机，凌乱但舒适，温暖的灯光，低保真氛围，体素艺术风格，3D渲染，Blender。',
    tags: ['3d', 'isometric', 'retro', 'interior'],
    imageUrl: 'https://picsum.photos/seed/room/1200/800',
    likes: 256,
    author: 'VoxelMaster',
    createdAt: Date.now() - 200000
  }
];
