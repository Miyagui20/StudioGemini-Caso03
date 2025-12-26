
import { GoogleGenAI } from "@google/genai";

const SEARCH_SYSTEM_INSTRUCTION = `Eres un investigador profesional. Tu tarea es proporcionar información actual y verificada.
Proporciona hallazgos estructurados: Título, Lista de puntos clave y Fuente.
Separa cada hallazgo con la línea: ---
No incluyas introducciones ni conclusiones. Solo los datos técnicos y fácticos.`;

const TEXT_EDIT_SYSTEM_INSTRUCTION = `Eres un editor de estilo experto. Tu única tarea es transformar el texto del usuario siguiendo sus instrucciones exactas. 
Devuelve UNICAMENTE el texto transformado. No expliques qué hiciste, no saludes, ni añadas comentarios. Si el texto original es corto, mantén la brevedad.`;

export default async function handler(req, res) {
  // Configuración de CORS para permitir peticiones desde el frontend
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Responder rápido a peticiones OPTIONS (CORS Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { action, config } = req.body;
  
  // Validar API KEY en el entorno
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'Error de configuración: API_KEY no encontrada en el servidor.' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    switch (action) {
      case 'image': {
        const { prompt, style, aspectRatio } = config;
        const styleText = style && style !== 'ninguna' ? ` en estilo ${style}.` : '';
        const fullPrompt = `${prompt}${styleText} Alta calidad, detalle cinematográfico.`;
        
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
          throw new Error("La generación de imagen fue bloqueada por filtros de seguridad o no pudo completarse.");
        }

        const imagePart = candidate.content?.parts?.find(p => p.inlineData);
        if (!imagePart) {
          throw new Error("El modelo no devolvió datos de imagen válidos.");
        }
        
        return res.status(200).json({ 
          result: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}` 
        });
      }

      case 'text': {
        const { text, instruction } = config;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: `INSTRUCCIÓN: ${instruction}\n\nTEXTO A EDITAR: "${text}"` }] }],
          config: {
            systemInstruction: TEXT_EDIT_SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });

        if (!response.text) {
          throw new Error("El modelo de lenguaje no generó ninguna respuesta.");
        }

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
          ?.filter(chunk => chunk.web?.uri)
          .map(chunk => ({
            title: chunk.web.title || "Fuente externa",
            uri: chunk.web.uri
          })) || [];

        return res.status(200).json({ 
          text: response.text || "No se encontraron resultados relevantes.", 
          sources 
        });
      }

      default:
        return res.status(400).json({ error: 'Acción no soportada.' });
    }
  } catch (error) {
    console.error('Error en Gemini API Handler:', error);
    return res.status(500).json({ 
      error: error.message || 'Error inesperado procesando la solicitud con IA.' 
    });
  }
}
