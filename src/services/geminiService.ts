import { GoogleGenAI } from "@google/genai";

export async function generateToyImage(base64Image: string, mimeType: string) {
  // Use selected API key if available, otherwise fallback to system key
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: 'Transform this character into a high-quality 3D plushie toy. The toy should be soft, fluffy, and look like a real physical product on a clean white background. Maintain the colors and key features of the character.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in the response.");
  } catch (error) {
    console.error("Error generating toy image:", error);
    throw error;
  }
}
