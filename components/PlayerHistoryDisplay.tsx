
import React, { useEffect, useRef } from 'react';
import { StoryItem, MessageSource, PlayerIdentity } from '../types';

interface PlayerHistoryDisplayProps {
  storyItems: StoryItem[];
  playerIdentity: PlayerIdentity;
}

const PlayerHistoryDisplay: React.FC<PlayerHistoryDisplayProps> = ({ storyItems, playerIdentity }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const relevantSource = playerIdentity === PlayerIdentity.A ? MessageSource.PLAYER_A_INPUT : MessageSource.PLAYER_B_INPUT;
  const playerMessages = storyItems.filter(item => item.source === relevantSource);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [playerMessages]);

  const bubbleColor = playerIdentity === PlayerIdentity.A ? 'bg-blue-700' : 'bg-green-700';
  const textColor = playerIdentity === PlayerIdentity.A ? 'text-blue-100' : 'text-green-100';
  const borderColor = playerIdentity === PlayerIdentity.A ? 'border-blue-500' : 'border-green-500';


  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 bg-gray-850 rounded-lg border border-gray-700 space-y-3 flex-grow custom-scrollbar">
      <h4 className={`text-md font-semibold mb-2 sticky top-0 bg-gray-850 py-1 ${playerIdentity === PlayerIdentity.A ? 'text-blue-400' : 'text-green-400'}`}>{playerIdentity}'s Prompts</h4>
      {playerMessages.length === 0 && (
        <p className="text-gray-400 italic">No prompts from {playerIdentity} yet.</p>
      )}
      {playerMessages.map((item) => (
        <div key={item.id} className={`p-3 rounded-lg shadow ${bubbleColor} ${textColor}`}>
          <p className="whitespace-pre-wrap">{item.text}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(item.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PlayerHistoryDisplay;
