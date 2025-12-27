import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Servicio de IA optimizado para producción.
 * Se inicializa el cliente dentro de cada función para garantizar el uso de la clave de entorno.
 */

const initAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY no detectada. Asegúrate de configurar la variable de entorno 'API_KEY' en Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = initAI();
  const { prompt, style, aspectRatio } = config;
  
  const stylePrompt = style && style !== 'ninguna' ? ` al estilo ${style}` : '';
  const finalPrompt = `${prompt}${stylePrompt}. Alta resolución, 8k, detalles intrincados, iluminación profesional.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1'
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No hubo respuesta del modelo de imagen.");
    
    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No se pudo obtener la imagen. Es posible que el contenido haya sido bloqueado por filtros de seguridad.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error en Imagen:", error);
    throw new Error(error.message || "Error al generar la imagen.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const ai = initAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona un reporte detallado y actual sobre: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un analista experto. Divide tu respuesta en bloques usando "---" como separador. Cada bloque debe tener Título, Puntos clave y Fuente.',
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Referencia Web",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "La búsqueda no arrojó resultados.", 
      sources 
    };
  } catch (error: any) {
    console.error("Error en Búsqueda:", error);
    throw new Error("No se pudo completar la investigación. Revisa que Google Search esté habilitado para tu API Key.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = initAI();
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `INSTRUCCIÓN: ${instruction}\n\nTEXTO:\n"${text}"`,
      config: {
        systemInstruction: 'Eres un editor profesional. Aplica la instrucción al texto. Devuelve SOLO el texto editado final.',
        temperature: 0.7
      }
    });

    return response.text || "No se pudo editar el texto.";
  } catch (error: any) {
    console.error("Error en Texto:", error);
    throw new Error("Error al procesar el texto con IA.");
  }
};