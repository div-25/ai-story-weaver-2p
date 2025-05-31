
import React from 'react';

export const MAX_PLAYER_TURNS_EACH = 25;
export const TOTAL_MAX_TURNS = MAX_PLAYER_TURNS_EACH * 2;
export const IMAGE_GENERATION_INTERVAL = 3; // Player turns (e.g., after every 5 total player turns, if no tag)
export const MAX_IMAGE_PROMPT_LENGTH = 800; // Max characters for the image generation prompt

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const AI_IMAGE_PROMPT_TAG = '[IMAGE_WORTHY_SCENE]';

export const SYSTEM_INSTRUCTION = `You are a master storyteller. Players will provide alternating inputs as 'Player A' and 'Player B'. Your role is to weave these inputs into a single, cohesive, and engaging narrative. Expand on their ideas with vivid descriptions, character reactions, and plot developments.
If a scene you describe is particularly vivid and an image would enhance it, include the exact tag ${AI_IMAGE_PROMPT_TAG} in your narrative text. Do not add any other commentary around this tag.
The story will conclude after ${TOTAL_MAX_TURNS} total player turns. On the ${TOTAL_MAX_TURNS}th turn, provide a satisfying concluding paragraph.
Your responses should be one or two paragraphs long, but can be longer or shorter if the prompt necessitates. Maintain a consistent tone and style suitable for an unfolding story.
Do not directly refer to the players. Maintain the illusion of an ongoing story as if reading from a book.`;

export const PaperPlaneIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M3.105 3.105a.5.5 0 01.707-.707l14.142 3.536a.5.5 0 010 .823L14.354 9.96a.5.5 0 01-.22.48l-5.25 3.03a.5.5 0 01-.74-.577l1.036-3.522a.5.5 0 00-.33-.586L3.105 6.105a.5.5 0 010-1zM4.192 4.192l.94 3.223L9.5 9.5l-4.368-1.092L4.192 4.192z" />
  </svg>
);

export const RetryIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const LoadingSpinnerIcon = (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
