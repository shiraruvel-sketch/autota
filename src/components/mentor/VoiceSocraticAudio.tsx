import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square,
  Sparkles 
} from 'lucide-react';

interface VoiceSocraticAudioProps {
  textToSpeak: string;
  onVoiceTranscribed?: (transcribedText: string) => void;
}

export const VoiceSocraticAudio: React.FC<VoiceSocraticAudioProps> = ({
  textToSpeak,
  onVoiceTranscribed,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [supportedTTS, setSupportedTTS] = useState<boolean>(false);
  const [supportedSTT, setSupportedSTT] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupportedTTS(true);
    }
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSupportedSTT(true);
    }
  }, []);

  const handleSpeak = () => {
    if (!supportedTTS) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown before speaking
    const cleanText = textToSpeak
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'he-IL';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceInput = () => {
    if (!supportedSTT) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceTranscribed && transcript) {
          onVoiceTranscribed(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Speech Audio Button */}
      {supportedTTS && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 text-white shadow-md animate-pulse'
              : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
          }`}
          title={isPlaying ? 'עצור הקראה' : 'האזן למשוב בקול של מנטור ה-AI'}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>עצור הקראה</span>
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-white animate-bounce rounded-full" />
                <span className="w-1 h-4 bg-white animate-bounce delay-75 rounded-full" />
                <span className="w-1 h-2 bg-white animate-bounce delay-150 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>האזן למשוב (Voice AI)</span>
            </>
          )}
        </button>
      )}

      {/* Voice Input Mic Button */}
      {supportedSTT && onVoiceTranscribed && (
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white animate-ping'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="שאל שאלה קולית בדיבור"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
