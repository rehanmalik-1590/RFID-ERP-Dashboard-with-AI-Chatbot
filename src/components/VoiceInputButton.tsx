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
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
  language = 'en-US',
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

  const handleStartListening = () => {
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
        // When voice input is finalized
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
          isListening
            ? 'Listening... Click stop when done'
            : 'Click to speak your question'
        }
      >
        <IconButton
          size="small"
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled}
          sx={{
            color: isListening ? '#d32f2f' : '#1976d2',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.7 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {isListening ? <MicIcon /> : <MicIcon />}
        </IconButton>
      </Tooltip>

      {isListening && (
        <>
          <CircularProgress size={24} sx={{ color: '#d32f2f' }} />
          <Tooltip title="Stop listening">
            <IconButton
              size="small"
              onClick={handleAbort}
              sx={{ color: '#d32f2f' }}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      {voiceState.transcript && !isListening && (
        <Tooltip title={`Heard: ${voiceState.transcript}`}>
          <Box
            sx={{
              fontSize: '12px',
              color: '#666',
              maxWidth: '150px',
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