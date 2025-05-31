import { useState, useEffect, useCallback } from "react";
import { PlayerIdentity, StoryItem, MessageSource } from "./types";
import {
  TOTAL_MAX_TURNS,
  IMAGE_GENERATION_INTERVAL,
  AI_IMAGE_PROMPT_TAG,
  LoadingSpinnerIcon,
  MAX_IMAGE_PROMPT_LENGTH,
} from "./constants";
import {
  initGeminiService,
  generateStorySegment,
  generateImage,
} from "./services/geminiService";
import PlayerInput from "./components/PlayerInput";
import PlayerHistoryDisplay from "./components/PlayerHistoryDisplay";
import AIStoryDisplay from "./components/AIStoryDisplay";

const App: React.FC = () => {
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [playerATurnCount, setPlayerATurnCount] = useState(0);
  const [playerBTurnCount, setPlayerBTurnCount] = useState(0);
  const [lastImageAtTotalTurn, setLastImageAtTotalTurn] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRetryingImageId, setIsRetryingImageId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInitialized, setApiKeyInitialized] = useState(false);
  const [activePlayer, setActivePlayer] = useState<PlayerIdentity>(
    PlayerIdentity.A
  );
  const [imageGenerationEnabled, setImageGenerationEnabled] = useState(false);

  useEffect(() => {
    const envApiKey = process.env.API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
      const success = initGeminiService(envApiKey);
      setApiKeyInitialized(success);
      if (!success) {
        setError(
          "Failed to initialize AI Service. Check console for details. Ensure API key is valid and correctly configured."
        );
      }
    } else {
      setError(
        "Gemini API Key not found. Please ensure `process.env.API_KEY` is set in your environment (e.g., in index.html for this demo)."
      );
      setApiKeyInitialized(false);
    }
  }, []);

  const totalPlayerTurns = playerATurnCount + playerBTurnCount;
  const isGameOver = totalPlayerTurns >= TOTAL_MAX_TURNS;

  const addStoryItem = useCallback(
    (item: Omit<StoryItem, "id" | "timestamp">) => {
      setStoryItems((prev: StoryItem[]) => [
        ...prev,
        { ...item, id: self.crypto.randomUUID(), timestamp: Date.now() },
      ]);
    },
    []
  );

  const handlePlayerSubmit = useCallback(
    async (player: PlayerIdentity, prompt: string) => {
      if (isGameOver || isGenerating || !apiKeyInitialized) return;

      setIsGenerating(true);
      setError(null);
      addStoryItem({
        source:
          player === PlayerIdentity.A
            ? MessageSource.PLAYER_A_INPUT
            : MessageSource.PLAYER_B_INPUT,
        text: prompt,
        playerIdentity: player,
      });

      const updatedPlayerATurnCount =
        player === PlayerIdentity.A ? playerATurnCount + 1 : playerATurnCount;
      const updatedPlayerBTurnCount =
        player === PlayerIdentity.B ? playerBTurnCount + 1 : playerBTurnCount;

      if (player === PlayerIdentity.A) {
        setPlayerATurnCount(updatedPlayerATurnCount);
      } else {
        setPlayerBTurnCount(updatedPlayerBTurnCount);
      }

      const currentTotalPlayerTurnsAfterThisInput =
        updatedPlayerATurnCount + updatedPlayerBTurnCount;
      const isFinalAPITurn =
        currentTotalPlayerTurnsAfterThisInput >= TOTAL_MAX_TURNS;

      const aiResponse = await generateStorySegment(
        player,
        prompt,
        isFinalAPITurn
      );

      if (typeof aiResponse === "string") {
        let narrativeTextFromAI = aiResponse;

        const isFirstEverPlayerTurn =
          currentTotalPlayerTurnsAfterThisInput === 1;
        const shouldGenerateImageByTag =
          narrativeTextFromAI.includes(AI_IMAGE_PROMPT_TAG);

        if (shouldGenerateImageByTag) {
          narrativeTextFromAI = narrativeTextFromAI
            .replace(AI_IMAGE_PROMPT_TAG, "")
            .trim();
        }

        let imageGenPromptForAI: string | null = null;
        const shouldGenerateImageByInterval =
          currentTotalPlayerTurnsAfterThisInput - lastImageAtTotalTurn >=
            IMAGE_GENERATION_INTERVAL &&
          currentTotalPlayerTurnsAfterThisInput > 0;

        const shouldGenerateAnImageNow =
          imageGenerationEnabled &&
          (isFirstEverPlayerTurn ||
            shouldGenerateImageByTag ||
            shouldGenerateImageByInterval) &&
          !isFinalAPITurn;

        if (shouldGenerateAnImageNow) {
          const focusScene = narrativeTextFromAI.substring(0, 350);

          const contextItems = storyItems
            .slice(-5)
            .map((item: StoryItem) => {
              let prefix = "";
              if (
                item.source === MessageSource.PLAYER_A_INPUT &&
                item.playerIdentity === PlayerIdentity.A
              )
                prefix = "Player A prompted: ";
              else if (
                item.source === MessageSource.PLAYER_B_INPUT &&
                item.playerIdentity === PlayerIdentity.B
              )
                prefix = "Player B prompted: ";
              else if (item.source === MessageSource.AI_NARRATIVE)
                prefix = "Previously, the AI narrated: ";
              else return null;
              return (
                prefix +
                (item.text || "").substring(0, 100) +
                ((item.text || "").length > 100 ? "..." : "")
              );
            })
            .filter(Boolean)
            .join("\n");

          const contextSummary = contextItems.substring(0, 400);

          imageGenPromptForAI = `Illustrate this pivotal scene from an ongoing story: "${focusScene}"
This scene occurs after the following recent story developments:
${contextSummary}
Desired artistic style: cinematic, vivid, detailed, slightly painterly. Ensure the image is safe for all audiences.`;

          if (imageGenPromptForAI.length > MAX_IMAGE_PROMPT_LENGTH) {
            const ellipsis = "...";
            // Prioritize focus scene and style instruction, truncate context more aggressively if needed
            const styleInstruction =
              "\nDesired artistic style: cinematic, vivid, detailed, slightly painterly. Ensure the image is safe for all audiences.";
            const focusScenePart = `Illustrate this pivotal scene from an ongoing story: "${focusScene}"\nThis scene occurs after the following recent story developments:\n`;

            let availableLength =
              MAX_IMAGE_PROMPT_LENGTH -
              ellipsis.length -
              styleInstruction.length -
              focusScenePart.length;

            if (availableLength < 0) {
              // Not enough space for even minimal context
              // Try to fit just focus and style
              availableLength =
                MAX_IMAGE_PROMPT_LENGTH -
                ellipsis.length -
                styleInstruction.length -
                `Illustrate this pivotal scene from an ongoing story: ""`
                  .length;
              const truncatedFocusScene = focusScene.substring(
                0,
                availableLength
              );
              imageGenPromptForAI = `Illustrate this pivotal scene from an ongoing story: "${truncatedFocusScene}"${ellipsis}${styleInstruction}`;
            } else {
              const truncatedContext = contextSummary.substring(
                0,
                availableLength
              );
              imageGenPromptForAI =
                focusScenePart +
                truncatedContext +
                (contextSummary.length > availableLength ? ellipsis : "") +
                styleInstruction;
            }

            // Final check if the constructed prompt is still too long (e.g. if focusScene itself was huge)
            if (imageGenPromptForAI.length > MAX_IMAGE_PROMPT_LENGTH) {
              imageGenPromptForAI =
                imageGenPromptForAI.substring(
                  0,
                  MAX_IMAGE_PROMPT_LENGTH - ellipsis.length
                ) + ellipsis;
            }
          }
        }

        addStoryItem({
          source: MessageSource.AI_NARRATIVE,
          text: narrativeTextFromAI,
        });

        if (shouldGenerateAnImageNow && imageGenPromptForAI) {
          const imageResult = await generateImage(imageGenPromptForAI);
          if (typeof imageResult === "string") {
            addStoryItem({
              source: MessageSource.AI_IMAGE,
              imageUrl: imageResult,
              imageRetryPrompt: imageGenPromptForAI,
            });
            setLastImageAtTotalTurn(currentTotalPlayerTurnsAfterThisInput);
          } else {
            setError(`Image generation failed: ${imageResult.message}`);
            console.warn("Failed image prompt:", imageGenPromptForAI);
          }
        }
        setActivePlayer(
          player === PlayerIdentity.A ? PlayerIdentity.B : PlayerIdentity.A
        );
      } else {
        setError(`AI story generation failed: ${aiResponse.message}`);
      }
      setIsGenerating(false);
    },
    [
      isGameOver,
      isGenerating,
      apiKeyInitialized,
      playerATurnCount,
      playerBTurnCount,
      lastImageAtTotalTurn,
      storyItems,
      addStoryItem,
      imageGenerationEnabled,
    ]
  );

  const handleRetryImage = useCallback(
    async (itemId: string, imagePromptToRetry: string) => {
      if (!apiKeyInitialized || isRetryingImageId || !imagePromptToRetry) {
        if (!imagePromptToRetry)
          console.warn("Retry image called with no prompt for item:", itemId);
        return;
      }

      setIsRetryingImageId(itemId);
      setError(null);
      const imageResult = await generateImage(imagePromptToRetry);
      if (typeof imageResult === "string") {
        setStoryItems((prev: StoryItem[]) =>
          prev.map((item: StoryItem) =>
            item.id === itemId
              ? {
                  ...item,
                  imageUrl: imageResult,
                  imageRetryPrompt: imagePromptToRetry,
                }
              : item
          )
        );
      } else {
        setError(`Image retry failed: ${imageResult.message}`);
        console.warn("Failed image retry prompt:", imagePromptToRetry);
      }
      setIsRetryingImageId(null);
    },
    [apiKeyInitialized, isRetryingImageId]
  );

  if (!apiKeyInitialized && !apiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          API Key Configuration Needed
        </h1>
        <p className="text-lg mb-2 text-center">
          Gemini API Key is not configured.
        </p>
        <p className="text-sm text-gray-400 text-center">
          Please ensure `process.env.API_KEY` is set with your valid Gemini API
          key in your environment (e.g., in `index.html` for this demo).
        </p>
        {error && (
          <p
            className="mt-4 p-3 bg-red-700 text-red-100 rounded-md"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 p-4 gap-4">
      <header className="text-center py-2">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-600 to-green-400">
          2 Player AI Story Weaver
        </h1>
        <p className="text-sm text-gray-400">
          Turns: {playerATurnCount} (Player A) + {playerBTurnCount} (Player B) ={" "}
          {totalPlayerTurns} / {TOTAL_MAX_TURNS}
        </p>
        <div className="flex justify-center items-center mt-2 space-x-2">
          <label className="text-sm text-gray-400 cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={imageGenerationEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setImageGenerationEnabled(e.target.checked)
              }
              className="form-checkbox h-4 w-4 text-fuchsia-500 rounded border-gray-600 bg-gray-700 focus:ring-fuchsia-500"
            />
            <span className="ml-2">
              Enable Image Generation (requires billed API quota)
            </span>
          </label>
        </div>
        {apiKeyInitialized && !isGameOver && (
          <p
            className="text-md font-semibold mt-1"
            style={{
              color:
                activePlayer === PlayerIdentity.A
                  ? "#60A5FA" /* blue-400 */
                  : "#4ADE80" /* green-400 */,
            }}
            aria-live="polite"
          >
            Current Turn: {activePlayer}
          </p>
        )}
      </header>

      {error && (
        <div
          className="p-3 bg-red-700 text-red-100 rounded-md mb-2 text-center"
          role="alert"
          aria-atomic="true"
        >
          Error: {error}
        </div>
      )}

      {isGameOver && (
        <div
          className="p-4 bg-yellow-500 text-gray-900 rounded-md text-center font-semibold text-lg"
          role="status"
        >
          The End! The story has concluded after {TOTAL_MAX_TURNS} turns.
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Player A (Left Side) */}
        <div className="w-1/4 flex flex-col gap-4">
          <PlayerInput
            playerIdentity={PlayerIdentity.A}
            onSubmit={(prompt: string) =>
              handlePlayerSubmit(PlayerIdentity.A, prompt)
            }
            disabled={
              isGenerating ||
              isGameOver ||
              !apiKeyInitialized ||
              activePlayer !== PlayerIdentity.A
            }
            isActive={
              activePlayer === PlayerIdentity.A &&
              !isGameOver &&
              apiKeyInitialized
            }
          />
          <div className="flex-grow min-h-0">
            <PlayerHistoryDisplay
              storyItems={storyItems}
              playerIdentity={PlayerIdentity.A}
            />
          </div>
        </div>

        {/* AI Story Display (Center) */}
        <div className="w-1/2 flex-grow min-h-0">
          <AIStoryDisplay
            storyItems={storyItems}
            onRetryImage={handleRetryImage}
            isRetryingImageId={isRetryingImageId}
          />
        </div>

        {/* Player B (Right Side) */}
        <div className="w-1/4 flex flex-col gap-4">
          <PlayerInput
            playerIdentity={PlayerIdentity.B}
            onSubmit={(prompt: string) =>
              handlePlayerSubmit(PlayerIdentity.B, prompt)
            }
            disabled={
              isGenerating ||
              isGameOver ||
              !apiKeyInitialized ||
              activePlayer !== PlayerIdentity.B
            }
            isActive={
              activePlayer === PlayerIdentity.B &&
              !isGameOver &&
              apiKeyInitialized
            }
          />
          <div className="flex-grow min-h-0">
            <PlayerHistoryDisplay
              storyItems={storyItems}
              playerIdentity={PlayerIdentity.B}
            />
          </div>
        </div>
      </div>
      {isGenerating && (
        <div
          className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-lg shadow-xl flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          {LoadingSpinnerIcon} AI is thinking...
        </div>
      )}
    </div>
  );
};

export default App;
