import { GoogleGenAI } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Inicializa el cliente de IA usando la clave de entorno inyectada por Vite.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 5) {
    throw new Error("Configuración incompleta: La clave API_KEY no ha sido detectada o es inválida en Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = getAIClient();
  const { prompt, style, aspectRatio } = config;
  
  const styleText = style && style !== 'ninguna' ? ` con un estilo de arte ${style}` : '';
  const enhancedPrompt = `${prompt}${styleText}. Calidad cinematográfica, ultra detallado, composición profesional, iluminación dramática.`;
  
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
    if (!candidate) throw new Error("No se recibió respuesta del modelo de imagen.");
    
    // El SDK puede devolver la imagen en diferentes partes del contenido
    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error("La generación falló. Es posible que el prompt haya infringido las políticas de seguridad de la IA.");
    }
    
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    throw new Error(error.message || "Error al conectar con el servidor de imágenes.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Realiza una investigación profunda sobre: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: 'Eres un investigador profesional. Estructura tu respuesta en bloques lógicos. Usa "---" para separar secciones. Cada sección debe incluir: Título, Puntos Clave y Fuente citada.',
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Sitio Web Consultado",
        uri: chunk.web?.uri || ""
      })) || [];

    return { 
      text: response.text || "La búsqueda no devolvió texto legible.", 
      sources 
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    throw new Error("No se pudo completar la búsqueda en tiempo real. Verifica los límites de tu API Key.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = getAIClient();
  const { text, instruction } = config;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `TEXTO ORIGINAL:\n"${text}"\n\nINSTRUCCIÓN DE EDICIÓN:\n${instruction}`,
      config: {
        systemInstruction: 'Eres un editor experto. Aplica la instrucción de forma precisa y profesional. Devuelve exclusivamente el texto resultante, sin comentarios ni introducciones.',
        temperature: 0.8
      }
    });

    return response.text || "Error al procesar la edición del texto.";
  } catch (error: any) {
    console.error("Gemini Text Error:", error);
    throw new Error("El motor de lenguaje no pudo procesar tu solicitud.");
  }
};