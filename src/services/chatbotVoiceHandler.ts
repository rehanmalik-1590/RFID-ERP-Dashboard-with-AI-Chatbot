// chatbotVoiceHandler.ts - Complete Updated File with Fixed Speech
export interface VoiceState {
  isListening: boolean;
  transcript: string;
  isFinal: boolean;
  confidence: number;
  error?: string;
}

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface AutoVoiceMode {
  enabled: boolean;
  isListening: boolean;
  recognition: any;
}

let isSpeechSynthesisSupported = false;
let speechRestartTimeout: ReturnType<typeof setTimeout> | null = null;

// ===== VOICE RECOGNITION SETUP =====
export const initVoiceRecognition = () => {
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

  let finalTranscript = '';

  recognition.continuous = config.continuous;
  recognition.interimResults = config.interimResults;
  recognition.maxAlternatives = config.maxAlternatives;
  recognition.language = config.language;

  try {
    recognition.start();
  } catch (e) {
    console.log('Recognition start error:', e);
  }

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
      case 'not-allowed':
        errorMessage = '🚫 Microphone access denied. Please allow microphone access.';
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
    try {
      recognition.stop();
    } catch (e) {
      console.log('Stop error:', e);
    }
  }
};

// ===== ABORT LISTENING =====
export const abortVoiceListening = (recognition: any) => {
  if (recognition) {
    try {
      recognition.abort();
    } catch (e) {
      console.log('Abort error:', e);
    }
  }
};

// ===== TEXT TO SPEECH - FIXED =====
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isSpeaking = false;
let speechQueue: string[] = [];
let isSpeechPaused = false;

export const speakText = (text: string, language: string = 'en-US') => {
  if (!window.speechSynthesis) {
    console.log('Speech synthesis not supported');
    return;
  }

  // Clean text
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/[📊📋👥🏢💡🔊💬📈📉📏👤🏆⭐⚠️✅❌🔴🟡🟢💡🔧🎯🏭🏬🎯📝👥⚡🔍🎯📋📊🏆📈📉📏]/g, '')
    .trim();

  if (!cleanText) return;

  // Add to queue
  speechQueue.push(cleanText);
  processSpeechQueue(language);
};

const processSpeechQueue = (language: string = 'en-US') => {
  if (isSpeaking || speechQueue.length === 0 || isSpeechPaused) return;

  isSpeaking = true;
  const text = speechQueue.shift()!;

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      isSpeaking = true;
    };

    utterance.onend = () => {
      isSpeaking = false;
      // Process next in queue
      setTimeout(() => {
        processSpeechQueue(language);
      }, 100);
    };

    utterance.onerror = (event) => {
      console.log('Speech error:', event);
      isSpeaking = false;
      // Try next in queue after error
      setTimeout(() => {
        processSpeechQueue(language);
      }, 200);
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech error:', error);
    isSpeaking = false;
    // Try next in queue
    setTimeout(() => {
      processSpeechQueue(language);
    }, 200);
  }
};

// ===== STOP SPEECH - FIXED =====
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      speechQueue = [];
      currentUtterance = null;
      isSpeechPaused = false;
    } catch (error) {
      console.error('Stop speech error:', error);
    }
  }
};

// ===== PAUSE SPEECH =====
export const pauseSpeech = () => {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.pause();
      isSpeechPaused = true;
    } catch (error) {
      console.error('Pause speech error:', error);
    }
  }
};

// ===== RESUME SPEECH =====
export const resumeSpeech = () => {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.resume();
      isSpeechPaused = false;
      processSpeechQueue();
    } catch (error) {
      console.error('Resume speech error:', error);
    }
  }
};

// ===== CHECK SUPPORT =====
export const checkVoiceSupport = (): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  browser: string;
} => {
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  const speechSynthesis = !!window.speechSynthesis;

  let browser = 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';

  return {
    speechRecognition: !!SpeechRecognition,
    speechSynthesis,
    browser,
  };
};

// ===== AUTO VOICE MODE =====
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
        // Restart after processing - FIXED: proper delay
        if (speechRestartTimeout) {
          clearTimeout(speechRestartTimeout);
        }
        speechRestartTimeout = setTimeout(() => {
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
  if (!recognition) return;
  
  try {
    // Stop current listening
    stopVoiceListening(recognition);
    
    // Start new listening
    setTimeout(() => {
      startVoiceListening(
        recognition,
        config,
        (state) => {
          onStateChange(state);
        },
        (transcript) => {
          if (transcript && transcript.trim()) {
            onTranscript(transcript);
            // Schedule restart
            if (speechRestartTimeout) {
              clearTimeout(speechRestartTimeout);
            }
            speechRestartTimeout = setTimeout(() => {
              restartAutoListening(recognition, config, onTranscript, onStateChange);
            }, 500);
          }
        }
      );
    }, 300);
  } catch (e) {
    console.log('Auto voice restart error:', e);
    // Retry after delay
    if (speechRestartTimeout) {
      clearTimeout(speechRestartTimeout);
    }
    speechRestartTimeout = setTimeout(() => {
      restartAutoListening(recognition, config, onTranscript, onStateChange);
    }, 1000);
  }
};

export const stopAutoListening = (recognition: any) => {
  if (speechRestartTimeout) {
    clearTimeout(speechRestartTimeout);
    speechRestartTimeout = null;
  }
  
  if (recognition) {
    try {
      recognition.abort();
    } catch (e) {
      console.log('Error stopping auto voice:', e);
    }
  }
};

// ===== FORMAT VOICE STATE =====
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

// ===== TYPE DECLARATIONS =====
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}