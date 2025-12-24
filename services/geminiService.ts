
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleSuffix = config.style !== 'ninguna' ? ` al estilo ${config.style}` : '';
  const fullPrompt = `${config.prompt}${styleSuffix}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio
        }
      }
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

    if (!imageUrl) throw new Error("No se pudo generar la imagen.");
    return imageUrl;
  } catch (error: any) {
    throw new Error(error.message || "Error al generar imagen.");
  }
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Eres un investigador profesional. Tu tarea es proporcionar información actual y verificada. Sin incluir información relacionada a la violencia, sexual y/u ofensiva.

Si encuentras varias noticias, artículos o hallazgos, DEBES seguir este formato estrictamente para CADA UNO:

1. Título representativo del hallazgo (sin la palabra "Título:").
2. Una línea en blanco.
3. Información clave detallada usando exclusivamente una lista de puntos (viñetas con guiones "-", sin la palabra "Descripción:").
4. Una línea en blanco.
5. Nombre y link de la fuente (sin la palabra "Fuente:").
6. Separa cada artículo o hallazgo diferente con la línea: ---

REGLAS CRÍTICAS:
- PROHIBIDO usar las etiquetas "Título:", "Descripción:", "Fuente:", "Información:" o similares.
- No incluyas contenido relacionado a violencia, sexual, y/o ofensivo.
- Ve directo al grano sin introducciones como "Aquí tienes lo que encontré".
- Asegúrate de que cada artículo tenga el mismo formato visual.`,
      },
    });

    const text = response.text || "No se encontró información.";
    const sources: { title: string; uri: string }[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || "Fuente externa",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error: any) {
    throw new Error(error.message || "Error en la búsqueda.");
  }
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Edita el texto: "${config.text}". Instrucciones: ${config.instruction}. Devuelve solo el resultado final.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "No se generó respuesta.";
};
