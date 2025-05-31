
import { GoogleGenAI, Chat } from "@google/genai";
import { PlayerIdentity, AIServiceError } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, SYSTEM_INSTRUCTION, TOTAL_MAX_TURNS } from '../constants';

let ai: GoogleGenAI;
let chat: Chat;

export const initGeminiService = (apiKey: string): boolean => {
  if (!apiKey) {
    console.error("Gemini API key is missing!");
    return false;
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    chat = ai.chats.create({
      model: GEMINI_TEXT_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini Service:", error);
    return false;
  }
};

export const generateStorySegment = async (
  playerIdentity: PlayerIdentity,
  promptText: string,
  isFinalTurn: boolean
): Promise<string | AIServiceError> => {
  if (!chat) {
    return { message: "Gemini service not initialized or chat session failed." };
  }

  let messageContent = `${playerIdentity}: ${promptText}`;
  if (isFinalTurn) {
    messageContent += `\n\n[SYSTEM NOTE: This is the final turn of the story (${TOTAL_MAX_TURNS} total player turns). Please provide a satisfying concluding paragraph based on the entire story so far.]`;
  }

  try {
    const response = await chat.sendMessage({ message: messageContent });
    return response.text;
  } catch (error) {
    console.error("Error generating story segment:", error);
    return { message: `Failed to generate story segment: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const generateImage = async (fullImagePrompt: string): Promise<string | AIServiceError> => {
  if (!ai) {
     return { message: "Gemini service not initialized." };
  }
  try {
    // The fullImagePrompt is now constructed in App.tsx and passed here
    const response = await ai.models.generateImages({
      model: GEMINI_IMAGE_MODEL,
      prompt: fullImagePrompt, // Use the provided full prompt directly
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    return { message: "Image generation returned no images or image data was missing." };
  } catch (error) {
    console.error("Error generating image:", error);
    return { message: `Failed to generate image: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// Helper to extract base64 data for direct use in <img> src
export const getBase64ImageFromBytes = (bytes: string): string => {
  return `data:image/jpeg;base64,${bytes}`;
};
