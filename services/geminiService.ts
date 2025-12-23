
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageGenConfig, TextEditConfig } from "../types";

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Construir el prompt con el estilo seleccionado
  const styleSuffix = config.style !== 'ninguna' ? ` al estilo ${config.style}` : '';
  const fullPrompt = `${config.prompt}${styleSuffix}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      // gemini-2.5-flash-image usa configuración básica por defecto
    });

    let imageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No se pudo generar la imagen. Intenta con un prompt diferente.");
    }

    return imageUrl;
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error.message || "Error al conectar con el servicio de imágenes.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Edita el siguiente texto siguiendo estrictamente estas instrucciones: ${config.instruction}.
    
    TEXTO ORIGINAL:
    "${config.text}"
    
    Por favor, devuelve solo el texto editado final sin explicaciones adicionales.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    }
  });

  return response.text || "No se generó respuesta.";
};
