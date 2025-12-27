import { ImageGenConfig, TextEditConfig, SearchResult } from "../types";

/**
 * Llama al endpoint serverless de Vercel en lugar del SDK directo.
 */
async function callApi(action: string, config: any) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, config }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Error en la comunicación con el servidor');
  }
  return result;
}

export const generateImage = async (config: ImageGenConfig): Promise<string> => {
  const result = await callApi('generateImage', config);
  return result.data;
};

export const performSearch = async (query: string): Promise<SearchResult> => {
  return await callApi('performSearch', { query });
};

export const editContent = async (config: TextEditConfig): Promise<string> => {
  const result = await callApi('editContent', config);
  return result.text;
};