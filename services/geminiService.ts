import { GoogleGenAI, Type } from "@google/genai";
import { PromptAnalysisResult } from "../types";

const STORAGE_KEY = 'gemini_api_key';

export const getStoredApiKey = (): string | null => {
  // Priority: 1. Environment Variable (Build time) 2. Local Storage (Runtime)
  return process.env.API_KEY || localStorage.getItem(STORAGE_KEY) || null;
};

export const setStoredApiKey = (key: string) => {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const getAiClient = () => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Return type is now an object with en and zh prompt
export const enhancePrompt = async (baseIdea: string, style: string): Promise<{ englishPrompt: string; chineseTranslation: string }> => {
  try {
    const ai = getAiClient();
    const systemInstruction = `You are an expert AI Art Prompt Engineer and Translator. 
    Your goal is to take a basic idea (which might be in Chinese or English) and a style, and expand it into a high-quality, descriptive prompt suitable for top-tier image generation models.
    
    You MUST output a valid JSON object with exactly two fields:
    1. "englishPrompt": The enhanced prompt in English. Focus on visual descriptors, lighting, texture, composition.
    2. "chineseTranslation": A high-quality Chinese translation of the enhanced prompt.
    
    Do NOT output markdown blocks (like \`\`\`json). Output RAW JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Base Idea: ${baseIdea}\nTarget Style: ${style}\n\nEnhance this prompt and provide translation:`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    try {
        const json = JSON.parse(text);
        return {
            englishPrompt: json.englishPrompt || baseIdea,
            chineseTranslation: json.chineseTranslation || "Translation unavailable"
        };
    } catch (e) {
        console.error("Failed to parse JSON response", e);
        return { englishPrompt: text, chineseTranslation: "Parsing Error" };
    }

  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
};

export const generatePreviewImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Gemini Image Model only supports specific aspect ratios.
    // If user provided a custom one (e.g., 21:9), we default to 16:9 or 1:1 to avoid API error.
    const VALID_RATIOS = ["1:1", "3:4", "4:3", "16:9", "9:16"];
    const safeAspectRatio = VALID_RATIOS.includes(aspectRatio) ? aspectRatio : "1:1";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: safeAspectRatio as any,
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data received from Gemini.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Reverses an image to a cinematic narrative prompt description in both EN and ZH.
 */
export const reverseImagePrompt = async (base64Image: string): Promise<{ en: string; zh: string }> => {
  try {
    const ai = getAiClient();
    // Clean base64 string if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const systemInstruction = `
    # Role
    You are a "Visual Narrative Architect". Your task is to analyze an image and rewrite it into a highly detailed, cinematic, and technically precise description in both English and Chinese.
    
    # Output Format
    You MUST return a VALID JSON object with exactly two keys:
    {
      "en": "The English narrative...",
      "zh": "The Chinese narrative..."
    }
    DO NOT use Markdown code blocks. Output RAW JSON only.

    # Style Guide
    - **Format:** Plain text paragraphs within the JSON string. Use double line breaks (\\n\\n) to separate paragraphs.
    - **English (en):** Photorealistic, narrative-driven, observational, and technically precise. Use rich adjectives.
    - **Chinese (zh):** Professional translation suitable for high-end art direction (专业摄影与艺术指导风格). Use precise photography terminology (e.g., use '浅景深' for shallow depth of field, '视线引导' for leading lines, '破框' for breaking the frame). It should read like a film script or professional photography critique, NOT a machine translation.

    # Narrative Structure (Must be followed for BOTH languages)
    1. **Overall Composition & Narrative:** Describe the macro structure (e.g., triptych, collage, portrait) and the overall mood or story flow (e.g., "three consecutive moments").
    2. **Core Style & Environment:** Detail the photography style (e.g., photorealistic, cinematic), lighting (e.g., hard daylight), contrast, and setting.
    3. **Subject Details:** Describe clothing, accessories, makeup, and styling in depth.
    4. **Sectional/Panel Deep Dive:** If it's a multi-panel image, describe EACH panel individually (Top/Middle/Bottom). Focus on poses, gaze direction, and CRITICALLY, "Out-of-Bounds" elements (objects breaking frames).
    5. **Technical & Negative Constraints:** State aspect ratio and what the style is explicitly NOT (e.g., "avoiding illustration").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image and generate the dual-language cinematic narrative."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return {
            en: text,
            zh: "解析返回格式错误，请重试。"
        };
    }
    
    return {
      en: json.en || "Analysis failed.",
      zh: json.zh || "解析失败。"
    };

  } catch (error) {
    console.error("Error reversing image:", error);
    throw error;
  }
};

/**
 * Deconstructs a messy text prompt into structured bilingual categories.
 */
export const analyzePromptStructure = async (rawText: string): Promise<PromptAnalysisResult> => {
  try {
    const ai = getAiClient();
    
    // Define the Item Schema first
    const itemSchema = {
      type: Type.OBJECT,
      properties: {
        en: { type: Type.STRING, description: "The keyword/phrase in English" },
        zh: { type: Type.STRING, description: "The accurate Chinese translation" }
      },
      required: ["en", "zh"]
    };

    const schema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.ARRAY, items: itemSchema, description: "Main subjects" },
        style: { type: Type.ARRAY, items: itemSchema, description: "Artistic styles" },
        medium: { type: Type.ARRAY, items: itemSchema, description: "Art medium" },
        lighting: { type: Type.ARRAY, items: itemSchema, description: "Lighting conditions" },
        camera: { type: Type.ARRAY, items: itemSchema, description: "Camera settings" },
        artists: { type: Type.ARRAY, items: itemSchema, description: "Artists referenced" },
        colorPalette: { type: Type.ARRAY, items: itemSchema, description: "Main colors" },
        additionalDetails: { type: Type.ARRAY, items: itemSchema, description: "Other descriptors" },
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following AI art prompt. Break it down into structured components. 
      For each extracted keyword or phrase, you MUST provide BOTH the English original (en) and a professional Chinese translation (zh).
      Input Prompt: "${rawText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    throw error;
  }
};
