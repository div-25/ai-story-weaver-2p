
export enum PlayerIdentity {
  A = 'Player A',
  B = 'Player B',
}

export enum MessageSource {
  PLAYER_A_INPUT = 'Player A Input',
  PLAYER_B_INPUT = 'Player B Input',
  AI_NARRATIVE = 'AI Narrative',
  AI_IMAGE = 'AI Image',
}

export interface StoryItem {
  id: string;
  source: MessageSource;
  text?: string; // Player prompt or AI narrative
  imageUrl?: string; // Base64 data URL for AI generated image
  imageRetryPrompt?: string; // The prompt used to generate this specific image, for retry
  timestamp: number;
  playerIdentity?: PlayerIdentity; // Indicates which player made the input
}

export interface AIServiceError {
  message: string;
}
