// VoiceInputButton.tsx - Complete Updated File
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { VoiceState, VoiceConfig } from '../services/chatbotVoiceHandler';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip, CircularProgress, Box, Chip } from '@mui/material';
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
  const [isProcessing, setIsProcessing] = useState(false);
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

    // Cleanup on unmount
    return () => {
      if (autoRestartTimeoutRef.current) {
        clearTimeout(autoRestartTimeoutRef.current);
        autoRestartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Handle auto mode
  useEffect(() => {
    if (autoMode && recognitionRef.current && isSupported) {
      startAutoListening();
    } else if (!autoMode && recognitionRef.current) {
      stopAutoListening();
    }
  }, [autoMode]);

  const startAutoListening = useCallback(() => {
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
        if (finalTranscript.trim() && !isProcessing) {
          setIsProcessing(true);
          setIsListening(true);
          setVoiceState({
            isListening: true,
            transcript: finalTranscript,
            isFinal: true,
            confidence: 100,
          });
          
          setTimeout(() => {
            onTranscript(finalTranscript.trim());
            setIsListening(false);
            setIsProcessing(false);
          }, 300);
        }
      };

      recognitionRef.current.onerror = () => {
        if (autoMode) {
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
  }, [autoMode, isProcessing, language, onTranscript]);

  const stopAutoListening = useCallback(() => {
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
    setIsProcessing(false);
  }, []);

  const handleStartListening = useCallback(() => {
    if (autoMode || isProcessing) return;

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
    setIsProcessing(true);

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
        setIsProcessing(false);
        if (transcript && transcript.trim()) {
          onTranscript(transcript);
        }
      }
    );
  }, [autoMode, isProcessing, isSupported, language, onTranscript]);

  const handleStopListening = useCallback(() => {
    if (recognitionRef.current) {
      stopVoiceListening(recognitionRef.current);
      setIsListening(false);
      setIsProcessing(false);
    }
  }, []);

  const handleAbort = useCallback(() => {
    if (recognitionRef.current) {
      abortVoiceListening(recognitionRef.current);
      setIsListening(false);
      setIsProcessing(false);
      setVoiceState({
        isListening: false,
        transcript: '',
        isFinal: true,
        confidence: 0,
      });
    }
  }, []);

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip
        title={
          autoMode 
            ? 'Auto Voice is ON - Listening continuously'
            : isListening
            ? 'Listening... Click stop when done'
            : isProcessing
            ? 'Processing...'
            : 'Click to speak your question'
        }
      >
        <IconButton
          size="small"
          onClick={autoMode ? undefined : (isListening ? handleStopListening : handleStartListening)}
          disabled={disabled || autoMode || isProcessing}
          sx={{
            color: autoMode ? '#10b981' : (isListening ? '#d32f2f' : (isProcessing ? '#f59e0b' : '#1976d2')),
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
          <CircularProgress 
            size={20} 
            sx={{ 
              color: autoMode ? '#10b981' : '#d32f2f',
              '& .MuiCircularProgress-circle': {
                animationDuration: '800ms',
              }
            }} 
          />
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
            <Chip
              label="● Listening"
              size="small"
              sx={{
                height: 20,
                fontSize: '8px',
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            />
          )}
        </>
      )}

      {voiceState.transcript && !isListening && !autoMode && !isProcessing && (
        <Tooltip title={`Heard: ${voiceState.transcript}`}>
          <Box
            sx={{
              fontSize: '9px',
              color: '#94a3b8',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {voiceState.transcript}
          </Box>
        </Tooltip>
      )}

      {voiceState.error && (
        <Tooltip title={voiceState.error}>
          <Box sx={{ color: '#ef4444', fontSize: '10px' }}>
            ⚠️
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default VoiceInputButton;