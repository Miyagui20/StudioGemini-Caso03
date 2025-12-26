
import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Función de utilidad para realizar llamadas a nuestra API interna.
 */
const callApi = async (action: string, config: any) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, config })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error en la petición a la IA');
  }

  return response.json();
};

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const data = await callApi('image', config);
  return data.result;
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  const data = await callApi('search', { query });
  return {
    text: data.text,
    sources: data.sources
  };
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const data = await callApi('text', config);
  return data.result;
};
