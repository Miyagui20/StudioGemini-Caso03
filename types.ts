
export enum WorkflowType {
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  TEXT_EDITING = 'TEXT_EDITING'
}

export type ImageStyle = 'Anime' | 'Ghibli' | 'Realista' | 'Oleo' | 'ninguna';

export interface ImageGenConfig {
  prompt: string;
  style: ImageStyle;
}

export interface TextEditConfig {
  text: string;
  instruction: string;
}

export interface AppState {
  workflow: WorkflowType;
  isLoading: boolean;
  error: string | null;
  result: string | null;
}
