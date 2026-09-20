import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceSpeechControlsProps {
  onTranscript: (text: string) => void;
  questionText?: string;
  autoRead?: boolean;
}

export default function VoiceSpeechControls({
  onTranscript,
  questionText,
  autoRead = false,
}: VoiceSpeechControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !questionText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto read when new question arrives if enabled
  useEffect(() => {
    if (autoRead && questionText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [questionText, autoRead]);

  // Speech to Text (Mic input)
  const toggleListening = () => {
    if (!speechSupported) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your answer.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            onTranscript(currentTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech error:', e.error);
          setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSpeech}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
          isSpeaking
            ? 'bg-signal/20 text-signal border border-signal/40'
            : 'bg-neutral/5 text-slate-light hover:text-paper border border-neutral/10'
        }`}
        title={isSpeaking ? 'Stop speaking question' : 'Read question out loud'}
      >
        {isSpeaking ? <VolumeX className="h-3.5 w-3.5 text-signal animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
        {isSpeaking ? 'Speaking...' : 'Read Aloud'}
      </button>

      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
          isListening
            ? 'bg-coral/20 text-coral border border-coral/40 animate-pulse'
            : 'bg-neutral/5 text-slate-light hover:text-paper border border-neutral/10'
        }`}
        title={isListening ? 'Stop microphone' : 'Answer with voice'}
      >
        {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        {isListening ? 'Listening...' : 'Voice Input'}
      </button>
    </div>
  );
}
