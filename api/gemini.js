
import { GoogleGenAI } from "@google/genai";

const SEARCH_SYSTEM_INSTRUCTION = `Eres un investigador profesional. Proporciona hallazgos estructurados: Título, Puntos clave y Fuente. Separa bloques con "---".`;

const TEXT_EDIT_SYSTEM_INSTRUCTION = `Eres un editor experto. Transforma el texto según las instrucciones. Devuelve SOLO el texto editado, sin comentarios ni saludos.`;

export default async function handler(req, res) {
  // Configuración de CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, config } = req.body;
  
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'La API_KEY no está configurada en el servidor.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    switch (action) {
      case 'image': {
        const { prompt, style, aspectRatio } = config;
        const styleText = style && style !== 'ninguna' ? ` en estilo artístico ${style}.` : '';
        const fullPrompt = `${prompt}${styleText} Alta calidad, detalle cinematográfico, 4k.`;
        
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
          throw new Error("Contenido bloqueado por filtros de seguridad.");
        }

        const imagePart = candidate.content?.parts?.find(p => p.inlineData);
        if (!imagePart) throw new Error("No se generó la imagen.");
        
        return res.status(200).json({ 
          result: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` 
        });
      }

      case 'text': {
        const { text, instruction } = config;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: `INSTRUCCIÓN: ${instruction}\n\nTEXTO: "${text}"` }] }],
          config: {
            systemInstruction: TEXT_EDIT_SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });
        return res.status(200).json({ result: response.text });
      }

      case 'search': {
        const { query } = config;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: query }] }],
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: SEARCH_SYSTEM_INSTRUCTION,
          },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web.title || "Fuente",
            uri: chunk.web.uri
          })) || [];

        return res.status(200).json({ 
          text: response.text, 
          sources 
        });
      }

      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
