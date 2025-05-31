
import React, { useEffect, useRef } from 'react';
import { StoryItem, MessageSource } from '../types';
import { RetryIcon, LoadingSpinnerIcon } from '../constants';

interface AIStoryDisplayProps {
  storyItems: StoryItem[];
  onRetryImage: (itemId: string, prompt: string) => Promise<void>;
  isRetryingImageId: string | null;
}

const AIStoryDisplay: React.FC<AIStoryDisplayProps> = ({ storyItems, onRetryImage, isRetryingImageId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiMessages = storyItems.filter(item => item.source === MessageSource.AI_NARRATIVE || item.source === MessageSource.AI_IMAGE);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-6 bg-gray-800 rounded-lg shadow-inner space-y-4 custom-scrollbar">
      {aiMessages.length === 0 && (
        <p className="text-gray-400 italic text-center py-10">The AI's story will appear here...</p>
      )}
      {aiMessages.map((item) => (
        <div key={item.id} className="p-1">
          {item.source === MessageSource.AI_NARRATIVE && item.text && (
            <div className="bg-gray-700 p-4 rounded-lg shadow">
              <p className="text-fuchsia-300 font-semibold mb-1">AI Storyteller:</p>
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>{item.text}</p>
              <p className="text-xs text-gray-400 mt-2 text-right">
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
          {item.source === MessageSource.AI_IMAGE && item.imageUrl && (
            <div className="my-4 p-3 bg-gray-700 rounded-lg shadow flex flex-col items-center">
              <img 
                src={item.imageUrl} 
                alt={item.imageRetryPrompt || "AI Generated Image"} 
                className="max-w-full md:max-w-md lg:max-w-lg rounded-md mb-2 border-2 border-fuchsia-500 shadow-lg"
              />
              <button
                onClick={() => item.imageRetryPrompt && onRetryImage(item.id, item.imageRetryPrompt)}
                disabled={!!isRetryingImageId}
                className="mt-2 px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm rounded-md flex items-center gap-1 transition-colors disabled:bg-gray-500"
              >
                {isRetryingImageId === item.id ? (
                  <>
                    {LoadingSpinnerIcon} Retrying...
                  </>
                ) : (
                  <>
                    {RetryIcon} Retry Image
                  </>
                )}
              </button>
               {item.imageRetryPrompt && <p className="text-xs text-gray-400 mt-1 italic text-center">Prompt: "{item.imageRetryPrompt.substring(0,100)}{item.imageRetryPrompt.length > 100 ? '...' : ''}"</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AIStoryDisplay;
