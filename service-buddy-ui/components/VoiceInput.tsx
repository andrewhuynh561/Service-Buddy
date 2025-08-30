import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptComplete }) => {
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
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleListening}
        className={`rounded-full p-3 transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600' 
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
          className="p-4 rounded-lg bg-gray-100 w-full max-w-sm"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm">{transcript || 'Listening...'}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;