import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
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
 * Reverses an image to a cinematic narrative prompt description.
 */
export const reverseImagePrompt = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAiClient();
    // Clean base64 string if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const systemInstruction = `
    # Role
    You are a "Visual Narrative Architect". Your task is to analyze an image and rewrite it into a highly detailed, cinematic, and technically precise description. 
    
    # Output Format & Style
    - **Format:** Plain text paragraphs ONLY. No JSON, no bullet points, no markdown lists.
    - **Style:** Photorealistic, narrative-driven, observational, and technically precise. Use rich adjectives.
    - **Structure:** You must strictly follow this 5-part narrative structure:

    1. **Overall Composition & Narrative:** Describe the macro structure (e.g., triptych, collage, portrait) and the overall mood or story flow.
    2. **Core Style & Environment:** Detail the medium (e.g., Kodak Portra 400), lighting (e.g., hard natural daylight), contrast, and setting.
    3. **Subject Details:** Describe clothing, accessories, makeup, and styling in depth.
    4. **Sectional/Panel Deep Dive:** If it's a multi-panel image, describe EACH panel individually (Top/Middle/Bottom or Left/Right). Focus on poses, gaze direction, and CRITICALLY, focus on "Out-of-Bounds" elements (objects breaking frames).
    5. **Technical & Negative Constraints:** State aspect ratio and what the style is explicitly NOT (e.g., "avoiding illustration").

    # Few-Shot Training Data (Emulate this writing style EXACTLY)
    
    [Input: An image of a woman in three panels]
    [Output]:
    A real-life woman is presented in a vertical triptych collage composition, depicting three consecutive moments (a calm stance, a direct confrontation, and a startled reaction). Each panel deliberately uses left–right offset positioning to create a coherent visual narrative flow.

    The image is shot in a photorealistic, cinematic live-action style, high resolution with subtle natural grain, true contrast, hard natural daylight, a clear blue sky, and deep depth of field consistent with real lens behavior. The scene takes place in an open outdoor environment.

    The subject wears a cowboy hat, a short-sleeve button-up shirt, and a brownish-red long skirt. Her makeup is retro-inspired, with distinct red lipstick and clearly defined eye makeup.

    Top panel:
    The subject is positioned toward the right, leaving open sky on the left. She stands with arms crossed, looking toward the lower-left with a surprised expression.

    Middle panel:
    The subject is positioned toward the left, aiming a firearm with the barrel angled toward the lower-right. Her expression is focused and sharp, and the shot is taken from a slightly top-down angle. In this panel, both the subject and the weapon intentionally break through the top and bottom panel borders, overlapping the frame lines to create a clear layered effect. The middle panel serves as the primary visual focal point.

    Bottom panel:
    The subject is positioned in the lower-right corner, leaving more negative space on the left. She raises both hands defensively, her eyes naturally widened in surprise, looking toward the upper-left. The subject intentionally breaks the panel frame and overlaps the border lines, forming a distinct layered composition.

    The image maintains a 2:3 aspect ratio and a photorealistic live-action style, explicitly avoiding illustration or comic aesthetics.
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
            text: "Analyze this image and generate the cinematic narrative description following the protocol."
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        // Removed responseMimeType to allow free-form text
      }
    });

    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Error reversing image:", error);
    throw error;
  }
};

/**
 * Deconstructs a messy text prompt into structured categories.
 */
export const analyzePromptStructure = async (rawText: string): Promise<any> => {
  try {
    const ai = getAiClient();
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main subjects of the image" },
        style: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Artistic styles (e.g., Cyberpunk, Oil Painting)" },
        medium: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Art medium (e.g., Digital Illustration, Photo)" },
        lighting: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lighting conditions" },
        camera: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Camera settings, angles, or lenses" },
        artists: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Artists referenced" },
        colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Main colors" },
        additionalDetails: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other descriptors" },
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following AI art prompt. Break it down into structured components. 
      If the input is messy or unstructured, extract the key concepts into the appropriate categories.
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
