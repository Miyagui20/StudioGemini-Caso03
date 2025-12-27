import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, config } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY no configurada en el servidor' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'generateImage': {
        const { prompt, style, aspectRatio } = config;
        const styleText = style && style !== 'ninguna' ? ` con estilo ${style}` : '';
        const enhancedPrompt = `${prompt}${styleText}. Alta resolución, 8k, detalles intrincados, iluminación profesional.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: enhancedPrompt }] },
          config: { imageConfig: { aspectRatio: aspectRatio || '1:1' } }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!imagePart) throw new Error("No se pudo generar la imagen o fue bloqueada por filtros.");

        return res.status(200).json({ 
          data: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` 
        });
      }

      case 'performSearch': {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Investigación profunda: ${config.query}`,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: 'Analista experto. Separa por "---". Incluye Título, Puntos y Fuente.',
          },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.filter(chunk => chunk.web)
          .map(chunk => ({
            title: chunk.web?.title || "Referencia",
            uri: chunk.web?.uri || ""
          })) || [];

        return res.status(200).json({ text: response.text, sources });
      }

      case 'editContent': {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `INSTRUCCIÓN: ${config.instruction}\n\nTEXTO:\n"${config.text}"`,
          config: {
            systemInstruction: 'Editor profesional. Devuelve solo el texto final.',
            temperature: 0.7
          }
        });

        return res.status(200).json({ text: response.text });
      }

      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }
  } catch (error) {
    console.error("Serverless Error:", error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}