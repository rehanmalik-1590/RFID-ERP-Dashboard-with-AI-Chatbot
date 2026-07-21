// ....VoiceInputButton.tsx file .......................
import React, { useState, useRef, useEffect } from 'react';
import type { VoiceState, VoiceConfig } from '../services/chatbotVoiceHandler';
import {
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip, CircularProgress, Box } from '@mui/material';
import {
  initVoiceRecognition,
  startVoiceListening,
  stopVoiceListening,
  abortVoiceListening,
  checkVoiceSupport,
} from '../services/chatbotVoiceHandler';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  language?: string;
  autoMode?: boolean;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
  language = 'en-US',
  autoMode = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isFinal: false,
    confidence: 0,
  });
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const autoRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize voice recognition on mount
  useEffect(() => {
    const support = checkVoiceSupport();
    setIsSupported(support.speechRecognition);

    if (support.speechRecognition) {
      const init = initVoiceRecognition();
      if (init.supported) {
        recognitionRef.current = init.recognition;
      }
    }
  }, []);

  // Handle auto mode
  useEffect(() => {
    if (autoMode && recognitionRef.current && isSupported) {
      startAutoListening();
    } else if (!autoMode && recognitionRef.current) {
      stopAutoListening();
    }
  }, [autoMode]);

  const startAutoListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.language = language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          setIsListening(true);
          setVoiceState({
            isListening: true,
            transcript: finalTranscript,
            isFinal: true,
            confidence: 100,
          });
          
          // Process the transcript
          setTimeout(() => {
            onTranscript(finalTranscript.trim());
            setIsListening(false);
          }, 300);
        }
      };

      recognitionRef.current.onerror = () => {
        if (autoMode) {
          // Restart after error
          if (autoRestartTimeoutRef.current) {
            clearTimeout(autoRestartTimeoutRef.current);
          }
          autoRestartTimeoutRef.current = setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        if (autoMode) {
          // Restart after end
          if (autoRestartTimeoutRef.current) {
            clearTimeout(autoRestartTimeoutRef.current);
          }
          autoRestartTimeoutRef.current = setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }, 500);
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.log('Auto voice start error:', e);
    }
  };

  const stopAutoListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.continuous = false;
      } catch (e) {}
    }
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
      autoRestartTimeoutRef.current = null;
    }
    setIsListening(false);
  };

  const handleStartListening = () => {
    if (autoMode) return; // Don't allow manual when auto mode is on

    if (!recognitionRef.current || !isSupported) {
      setVoiceState({
        isListening: false,
        transcript: '',
        isFinal: true,
        confidence: 0,
        error: '❌ Voice not supported. Try Chrome, Firefox, Safari, or Edge.',
      });
      return;
    }

    setIsListening(true);

    const config: VoiceConfig = {
      language,
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    };

    startVoiceListening(
      recognitionRef.current,
      config,
      (state) => {
        setVoiceState(state);
      },
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          onTranscript(transcript);
        }
      }
    );
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      stopVoiceListening(recognitionRef.current);
      setIsListening(false);
    }
  };

  const handleAbort = () => {
    if (recognitionRef.current) {
      abortVoiceListening(recognitionRef.current);
      setIsListening(false);
      setVoiceState({
        isListening: false,
        transcript: '',
        isFinal: true,
        confidence: 0,
      });
    }
  };

  if (!isSupported) {
    return (
      <Tooltip title="Voice input not supported in your browser">
        <span>
          <IconButton disabled size="small" sx={{ color: '#999' }}>
            <MicIcon />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip
        title={
          autoMode 
            ? 'Auto Voice is ON - Listening continuously'
            : isListening
            ? 'Listening... Click stop when done'
            : 'Click to speak your question'
        }
      >
        <IconButton
          size="small"
          onClick={autoMode ? undefined : (isListening ? handleStopListening : handleStartListening)}
          disabled={disabled || autoMode}
          sx={{
            color: autoMode ? '#10b981' : (isListening ? '#d32f2f' : '#1976d2'),
            animation: (isListening || autoMode) ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        >
          <MicIcon />
        </IconButton>
      </Tooltip>

      {(isListening || autoMode) && (
        <>
          <CircularProgress size={24} sx={{ color: autoMode ? '#10b981' : '#d32f2f' }} />
          {!autoMode && (
            <Tooltip title="Stop listening">
              <IconButton
                size="small"
                onClick={handleAbort}
                sx={{ color: '#d32f2f' }}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          )}
          {autoMode && (
            <Box sx={{ fontSize: '10px', color: '#10b981' }}>
              ● Listening
            </Box>
          )}
        </>
      )}

      {voiceState.transcript && !isListening && !autoMode && (
        <Tooltip title={`Heard: ${voiceState.transcript}`}>
          <Box
            sx={{
              fontSize: '10px',
              color: '#666',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {voiceState.transcript}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default VoiceInputButton;