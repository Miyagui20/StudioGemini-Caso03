
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Función centralizada para realizar peticiones a nuestra API Route.
 */
const callGeminiApi = async (action: string, config: any) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, config }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el servidor devolvió un error JSON, lo lanzamos con su mensaje
      throw new Error(data.error || `Error del servidor: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`Error en servicio Gemini (${action}):`, error);
    // Propagar el mensaje de error para que la UI lo muestre
    throw new Error(error.message || 'No se pudo establecer conexión con el servicio de IA.');
  }
};

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const data = await callGeminiApi('image', config);
  return data.result;
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const data = await callGeminiApi('search', { query });
  return {
    text: data.text,
    sources: data.sources
  };
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const data = await callGeminiApi('text', config);
  return data.result;
};
