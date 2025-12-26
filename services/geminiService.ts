
import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Inicialización del SDK de Google GenAI.
 * La clave se obtiene de process.env.API_KEY inyectada por Vite.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const { prompt, style, aspectRatio } = config;
  const styleText = style && style !== 'ninguna' ? ` en estilo artístico ${style}.` : '';
  const fullPrompt = `${prompt}${styleText} Alta calidad, detalle cinematográfico, 4k.`;
  
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
      throw new Error("La generación de imagen fue bloqueada por filtros de seguridad.");
    }

    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("El modelo no devolvió datos de imagen válidos.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error en generateImage:", error);
    throw new Error(error.message || "Error al conectar con el servicio de imágenes.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un investigador profesional. Proporciona hallazgos estructurados: Título, Lista de puntos clave y Fuente. Separa cada hallazgo con la línea: ---',
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Referencia Web",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "No se encontraron resultados.", 
      sources 
    };
  } catch (error: any) {
    console.error("Error en performSearch:", error);
    throw new Error("Error al realizar la investigación en tiempo real.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `INSTRUCCIÓN: ${instruction}\n\nTEXTO ORIGINAL: "${text}"`,
      config: {
        systemInstruction: 'Eres un editor experto. Tu tarea es transformar el texto siguiendo las instrucciones. Devuelve UNICAMENTE el texto transformado.',
        temperature: 0.7
      }
    });

    return response.text || "Error al procesar el texto.";
  } catch (error: any) {
    console.error("Error en editContent:", error);
    throw new Error("Error al procesar el texto con IA.");
  }
};
