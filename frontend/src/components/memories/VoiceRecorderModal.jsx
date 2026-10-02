import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Sparkles, Square, Play, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useNotify } from '../../context/NotificationContext';

export const VoiceRecorderModal = ({ isOpen, onClose, onExtracted }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);
  const { showToast } = useNotify();

  useEffect(() => {
    if (!isOpen) {
      handleStop();
      setTranscript('');
      setTimer(0);
    }
  }, [isOpen]);

  const handleStart = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech Recognition is not supported by your browser. You can type directly in AI Extract.', 'error');
      // Fallback sample for simulation
      setTranscript("Rahul told me yesterday that he loves dark chocolate and wants to visit Japan.");
      setIsRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let fullText = '';
        for (let i = 0; i < event.results.length; i++) {
          fullText += event.results[i][0].transcript + ' ';
        }
        setTranscript(fullText.trim());
      };

      recognition.onerror = (err) => {
        console.error('Speech recognition error:', err);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast('Could not access microphone', 'error');
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRecording(false);
  };

  const handleProcessTranscript = () => {
    if (!transcript.trim()) {
      showToast('Please record a voice note first', 'error');
      return;
    }
    handleStop();
    onExtracted?.(transcript);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice Memory Capture"
      subtitle="Speak naturally about a conversation, plan, or gift idea. We will transcribe and extract it with Gemma AI."
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
        {/* Animated Microphone Orb */}
        <div className="relative">
          {isRecording && (
            <>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-rose-500 blur-xl"
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-brand-500 blur-lg"
              />
            </>
          )}

          <button
            onClick={isRecording ? handleStop : handleStart}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
              isRecording
                ? 'bg-rose-500 shadow-glow-rose scale-105'
                : 'bg-gradient-to-tr from-brand-600 to-indigo-600 hover:scale-105 shadow-glow'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-9 h-9" />}
          </button>
        </div>

        <div>
          <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100">
            {formatSeconds(timer)}
          </span>
          <p className="text-xs text-slate-400 mt-1">
            {isRecording ? 'Listening... Tap square to pause' : 'Tap microphone to start recording'}
          </p>
        </div>

        {/* Live Transcription Box */}
        <div className="w-full text-left p-4 rounded-2xl glass-card min-h-24 max-h-40 overflow-y-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Live Transcript:
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200">
            {transcript || (
              <span className="italic text-slate-400 dark:text-slate-500">
                Transcribed voice notes will appear here in real-time...
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="glow"
            onClick={handleProcessTranscript}
            disabled={!transcript.trim()}
            icon={Sparkles}
          >
            Extract Memory with Gemma
          </Button>
        </div>
      </div>
    </Modal>
  );
};
