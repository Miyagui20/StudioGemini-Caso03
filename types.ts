
export enum WorkflowType {
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  TEXT_EDITING = 'TEXT_EDITING',
  SEARCH_GROUNDING = 'SEARCH_GROUNDING'
}

export type ImageStyle = 'Anime' | 'Ghibli' | 'Realista' | 'Oleo' | 'ninguna';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export interface ImageGenConfig {
  prompt: string;
  style: ImageStyle;
  aspectRatio: AspectRatio;
}

/**
 * Interface for text editing workflow configuration.
 * Includes the original text and instructions for the model.
 */
export interface TextEditConfig {
  text: string;
  instruction: string;
}

export interface SearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export interface AppState {
  workflow: WorkflowType;
  isLoading: boolean;
  error: string | null;
  result: string | null | SearchResult;
}
