import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Servicio de comunicación con Google Gemini.
 * Se instancia el cliente dentro de cada método para garantizar que se utilice 
 * la API KEY inyectada por Vite/Vercel en cada petición.
 */

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY no configurada. Por favor, añádela en las variables de entorno de Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = getClient();
  const { prompt, style, aspectRatio } = config;
  
  const styleText = style && style !== 'ninguna' ? ` con estilo ${style}` : '';
  const finalPrompt = `${prompt}${styleText}. Obra maestra, ultra detallado, iluminación profesional, alta resolución.`;
  
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
    if (!candidate) throw new Error("La IA no devolvió ningún resultado.");

    // Buscamos la parte que contiene los datos de la imagen (inlineData)
    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No se pudo generar la imagen. El contenido podría haber sido filtrado por seguridad.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Error en Imagen:", error);
    throw new Error(error.message || "Error al conectar con el servidor de imágenes de Gemini.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona información actualizada y detallada sobre: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un investigador de élite. Estructura tu respuesta en bloques lógicos. Usa "---" para separar cada bloque. Cada bloque debe tener: Título, Datos clave (lista) y Fuente.',
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Enlace de interés",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "No se encontraron datos relevantes para esta consulta.", 
      sources 
    };
  } catch (error: any) {
    console.error("Error en Búsqueda:", error);
    throw new Error("Error en la investigación en tiempo real. Verifica que tu API KEY tenga habilitado Google Search.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = getClient();
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `INSTRUCCIÓN: ${instruction}\n\nTEXTO A EDITAR:\n"${text}"`,
      config: {
        systemInstruction: 'Eres un editor profesional. Tu objetivo es mejorar el texto según la instrucción dada. Devuelve ÚNICAMENTE el texto editado, sin notas, ni saludos ni explicaciones.',
        temperature: 0.7
      }
    });

    return response.text || "No se pudo procesar la edición del texto.";
  } catch (error: any) {
    console.error("Error en Edición:", error);
    throw new Error("El motor de texto no pudo completar la solicitud.");
  }
};