import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptComplete, onTranscriptUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Browser Speech Recognition setup
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        // Call live update callback if provided
        onTranscriptUpdate?.(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      onTranscriptComplete(transcript);
    } else {
      setTranscript('');
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`rounded-full p-3 transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        <svg 
          className="w-6 h-6 text-white"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isListening ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15 12H9"
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V4"
            />
          )}
        </svg>
      </button>
      
      {isListening && (
        <div 
          className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg min-w-48 max-w-64 z-10"
          role="status"
          aria-live="polite"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recording...</div>
          <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
            {transcript || 'Speak now...'}
          </p>
          <div className="absolute bottom-[-8px] right-4 w-4 h-4 bg-white dark:bg-gray-700 border-r border-b border-gray-200 dark:border-gray-600 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;