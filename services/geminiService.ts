import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Servicio centralizado para interactuar con los modelos de Google Gemini.
 * La instancia se crea en cada llamada para asegurar el uso de la clave de API inyectada.
 */

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { prompt, style, aspectRatio } = config;
  
  const styleInstruction = style && style !== 'ninguna' ? ` con un estilo artístico de tipo ${style}` : '';
  const enhancedPrompt = `${prompt}${styleInstruction}. Calidad fotográfica ultra-detallada, iluminación cinemática, composición profesional.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1'
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No se recibió respuesta de la IA.");
    
    // Iteramos por las partes para encontrar la que contiene los datos de la imagen
    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No se pudo generar la imagen. Intenta con una descripción más detallada o diferente.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error en Imagen Gemini:", error);
    throw new Error(error.message || "Error al conectar con el motor de imágenes.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Investiga a fondo y proporciona datos actuales sobre: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un analista de datos experto. Proporciona información verificada y estructurada. Usa "---" para separar secciones. Cada sección debe tener un título, detalles y mencionar la fuente.',
      },
    });

    // Extraemos las fuentes de grounding de Google Search
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Sitio Web",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "La búsqueda no devolvió resultados legibles.", 
      sources 
    };
  } catch (error: any) {
    console.error("Error en Búsqueda Gemini:", error);
    throw new Error("Fallo en la investigación en tiempo real. Verifica tu conexión.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `TEXTO ORIGINAL:\n${text}\n\nINSTRUCCIÓN DE EDICIÓN:\n${instruction}`,
      config: {
        systemInstruction: 'Eres un editor de textos profesional. Aplica las instrucciones de forma precisa. Devuelve únicamente el texto final corregido/editado, sin comentarios adicionales.',
        temperature: 0.8
      }
    });

    return response.text || "No se pudo procesar el texto.";
  } catch (error: any) {
    console.error("Error en Texto Gemini:", error);
    throw new Error("Error en el motor de procesamiento de lenguaje natural.");
  }
};