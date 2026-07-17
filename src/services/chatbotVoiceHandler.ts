// ChatBot Voice Handler
// Uses Web Speech API (100% Free, No Cost)
// Works on Desktop & Mobile
// ......................chatbotVoiceHandler.ts file .............................
export interface VoiceState {
  isListening: boolean;
  transcript: string;
  isFinal: boolean;
  confidence: number;
  error?: string;
}

export interface VoiceConfig {
  language: string; // 'en-US', 'ur-PK', etc.
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface AutoVoiceMode {
  enabled: boolean;
  isListening: boolean;
  recognition: any;
}

// ===== VOICE RECOGNITION SETUP =====
export const initVoiceRecognition = () => {
  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      supported: false,
      message: '❌ Voice not supported in your browser. Try Chrome, Firefox, Safari, or Edge.',
    };
  }

  return {
    supported: true,
    recognition: new SpeechRecognition(),
  };
};

// ===== START LISTENING =====
export const startVoiceListening = (
  recognition: any,
  config: VoiceConfig,
  onResult: (state: VoiceState) => void,
  onFinal: (transcript: string) => void
) => {
  if (!recognition) return;

  // Reset transcript
  let finalTranscript = '';

  // Setup speech recognition
  recognition.continuous = config.continuous;
  recognition.interimResults = config.interimResults;
  recognition.maxAlternatives = config.maxAlternatives;
  recognition.language = config.language;

  // Start listening
  recognition.start();

  // On result
  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let confidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      confidence = event.results[i][0].confidence;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    const isFinal = event.results[event.results.length - 1].isFinal;

    onResult({
      isListening: true,
      transcript: finalTranscript || interimTranscript,
      isFinal,
      confidence: Math.round(confidence * 100),
    });

    if (isFinal && finalTranscript.trim()) {
      onFinal(finalTranscript.trim());
    }
  };

  // On error
  recognition.onerror = (event: any) => {
    let errorMessage = '';

    switch (event.error) {
      case 'no-speech':
        errorMessage = '🔇 No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = '🎤 Microphone not found. Check permissions.';
        break;
      case 'network':
        errorMessage = '🌐 Network error. Check internet connection.';
        break;
      case 'aborted':
        errorMessage = '⏹️ Recording stopped.';
        break;
      case 'service-not-available':
        errorMessage = '⚠️ Speech service unavailable.';
        break;
      default:
        errorMessage = `Error: ${event.error}`;
    }

    onResult({
      isListening: false,
      transcript: '',
      isFinal: true,
      confidence: 0,
      error: errorMessage,
    });
  };

  // On end
  recognition.onend = () => {
    onResult({
      isListening: false,
      transcript: finalTranscript,
      isFinal: true,
      confidence: 100,
    });
  };
};

// ===== STOP LISTENING =====
export const stopVoiceListening = (recognition: any) => {
  if (recognition) {
    recognition.stop();
  }
};

// ===== ABORT LISTENING =====
export const abortVoiceListening = (recognition: any) => {
  if (recognition) {
    recognition.abort();
  }
};

// ===== TEXT TO SPEECH (Optional: Read response aloud) =====
export const speakText = (text: string, language: string = 'en-US') => {
  if (!window.speechSynthesis) {
    console.log('Speech synthesis not supported');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

// ===== STOP SPEECH =====
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

// ===== FORMAT VOICE STATE FOR UI =====
export const formatVoiceState = (state: VoiceState): string => {
  if (state.error) {
    return `${state.error}`;
  }

  if (state.isListening) {
    return `🎤 Listening... (${state.confidence}% confident)`;
  }

  if (state.isFinal && state.transcript) {
    return `✅ Heard: "${state.transcript}"`;
  }

  return '🎤 Click mic to speak...';
};

// ===== UTILITY: Detect browser support =====
export const checkVoiceSupport = (): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  browser: string;
} => {
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  const speechSynthesis = !!window.speechSynthesis;

  let browser = 'Unknown';
  if (navigator.userAgent.includes('Chrome')) browser = 'Chrome';
  else if (navigator.userAgent.includes('Firefox')) browser = 'Firefox';
  else if (navigator.userAgent.includes('Safari')) browser = 'Safari';
  else if (navigator.userAgent.includes('Edge')) browser = 'Edge';
  else if (navigator.userAgent.includes('Opera')) browser = 'Opera';

  return {
    speechRecognition: !!SpeechRecognition,
    speechSynthesis,
    browser,
  };
};

// ===== AUTO VOICE MODE (No Clicking) =====
export const startAutoListening = (
  onTranscript: (text: string) => void,
  onStateChange: (state: VoiceState) => void,
  language: string = 'en-US'
): AutoVoiceMode => {
  const init = initVoiceRecognition();

  if (!init.supported) {
    return {
      enabled: false,
      isListening: false,
      recognition: null,
    };
  }

  const recognition = init.recognition;

  const config: VoiceConfig = {
    language,
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
  };

  startVoiceListening(
    recognition,
    config,
    (state) => {
      onStateChange(state);
    },
    (transcript) => {
      if (transcript && transcript.trim()) {
        onTranscript(transcript);
        setTimeout(() => {
          restartAutoListening(recognition, config, onTranscript, onStateChange);
        }, 500);
      }
    }
  );

  return {
    enabled: true,
    isListening: true,
    recognition,
  };
};

export const restartAutoListening = (
  recognition: any,
  config: VoiceConfig,
  onTranscript: (text: string) => void,
  onStateChange: (state: VoiceState) => void
) => {
  if (recognition) {
    try {
      startVoiceListening(
        recognition,
        config,
        (state) => {
          onStateChange(state);
        },
        (transcript) => {
          if (transcript && transcript.trim()) {
            onTranscript(transcript);
            setTimeout(() => {
              restartAutoListening(
                recognition,
                config,
                onTranscript,
                onStateChange
              );
            }, 500);
          }
        }
      );
    } catch (e) {
      console.log('Auto voice restart error:', e);
    }
  }
};

export const stopAutoListening = (recognition: any) => {
  if (recognition) {
    try {
      recognition.abort();
    } catch (e) {
      console.log('Error stopping auto voice:', e);
    }
  }
};

// ===== TYPE DECLARATIONS =====
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}