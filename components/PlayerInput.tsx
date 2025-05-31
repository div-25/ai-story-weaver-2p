
import React, { useState } from 'react';
import { PlayerIdentity } from '../types';
import { PaperPlaneIcon } from '../constants';

interface PlayerInputProps {
  playerIdentity: PlayerIdentity;
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  isActive: boolean; // To visually indicate whose turn it might be or highlight
}

const PlayerInput: React.FC<PlayerInputProps> = ({ playerIdentity, onSubmit, disabled, isActive }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Create a synthetic event if handleSubmit expects one and uses its properties directly
      // For this specific handleSubmit, it only uses e.preventDefault(),
      // so passing the original event after its default has been prevented is fine.
      // If it needed a more form-like event, one might need to be constructed or the form submitted programmatically.
      handleSubmit(e as unknown as React.FormEvent); // Cast as FormEvent for handleSubmit
    }
  };

  const borderColor = playerIdentity === PlayerIdentity.A ? 'border-blue-500' : 'border-green-500';
  const activeGlow = isActive ? (playerIdentity === PlayerIdentity.A ? 'ring-2 ring-blue-400' : 'ring-2 ring-green-400') : '';

  return (
    <div className={`p-4 bg-gray-800 rounded-lg shadow-md ${activeGlow}`}>
      <h3 className={`text-lg font-semibold mb-2 ${playerIdentity === PlayerIdentity.A ? 'text-blue-400' : 'text-green-400'}`}>
        {playerIdentity}
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown} // Added event handler here
          placeholder={`Enter story prompt as ${playerIdentity}...`}
          className={`flex-grow p-2 bg-gray-700 border ${borderColor} rounded-md focus:ring-2 ${playerIdentity === PlayerIdentity.A ? 'focus:ring-blue-500' : 'focus:ring-green-500'} focus:border-transparent outline-none resize-none text-gray-100 placeholder-gray-400`}
          rows={3}
          disabled={disabled}
          aria-label={`${playerIdentity} prompt input`}
        />
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className={`px-4 py-2 rounded-md flex items-center justify-center transition-colors
            ${disabled || !prompt.trim()
              ? 'bg-gray-600 cursor-not-allowed'
              : (playerIdentity === PlayerIdentity.A
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700')
            } text-white`}
          aria-label={`Submit ${playerIdentity} prompt`}
        >
          {PaperPlaneIcon}
        </button>
      </form>
    </div>
  );
};

export default PlayerInput;
