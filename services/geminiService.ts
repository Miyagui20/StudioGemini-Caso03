
import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Inicialización centralizada de Google GenAI.
 * La constante process.env.API_KEY es inyectada por Vite.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const { prompt, style, aspectRatio } = config;
  const styleText = style && style !== 'ninguna' ? ` en estilo artístico ${style}.` : '';
  const fullPrompt = `${prompt}${styleText} Alta calidad, detalle cinematográfico, 4k, iluminación profesional.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1'
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY') {
      throw new Error("Contenido bloqueado por filtros de seguridad. Intenta con una descripción diferente.");
    }

    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No se pudo obtener la imagen generada.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error en Imagen:", error);
    throw new Error(error.message || "Error al conectar con el servicio de generación de imágenes.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un investigador profesional. Proporciona hallazgos estructurados: Título, Puntos clave (con viñetas) y Fuente. Separa bloques de información distintos con "---".',
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Referencia Web",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "No se encontraron resultados relevantes.", 
      sources 
    };
  } catch (error: any) {
    console.error("Error en Búsqueda:", error);
    throw new Error("No se pudo completar la investigación en tiempo real.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `INSTRUCCIÓN: ${instruction}\n\nTEXTO: "${text}"`,
      config: {
        systemInstruction: 'Eres un editor experto. Transforma el texto según las instrucciones. Devuelve ÚNICAMENTE el texto editado, sin explicaciones ni saludos.',
        temperature: 0.7
      }
    });

    return response.text || "No se generó respuesta del modelo.";
  } catch (error: any) {
    console.error("Error en Texto:", error);
    throw new Error("Error al procesar el texto con inteligencia artificial.");
  }
};
