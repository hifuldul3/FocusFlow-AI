import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X, Sparkles, AlertCircle, Bot, User as UserIcon, Volume2, ShieldAlert } from 'lucide-react';
import { voiceService } from '../services/voice';
import { api } from '../services/api';
import { AIUtteranceResponse, ScheduleResponse } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
  onExtractedTask: (taskData: any) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onScheduleUpdated,
  onExtractedTask
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; action?: string }[]>([
    {
      sender: 'ai',
      text: "Hi Arun! I'm FocusFlow AI. Click the mic button to speak, or select a sample voice prompt below!"
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample voice input presets for 100% demo reliability
  const voicePresets = [
    "I need to finish my DBMS assignment by tomorrow. It will take about two hours.",
    "I only finished half of my Python project.",
    "I'm free only from 8 to 10 tonight.",
    "What should I work on right now?"
  ];

  useEffect(() => {
    if (!isOpen) {
      voiceService.stopListening();
      setIsListening(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartVoice = async () => {
    setTranscript('');
    setErrorMessage(null);
    setIsListening(true);

    await voiceService.startListening({
      onResult: (text, isFinal) => {
        setTranscript(text);
        setTextInput(text); // LIVE CHARACTER-BY-CHARACTER INPUT FIELD POPULATION!
        if (isFinal) {
          setIsListening(false);
          handleSendUtterance(text);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleStopVoice = () => {
    voiceService.stopListening();
    setIsListening(false);
    if (textInput.trim() || transcript.trim()) {
      handleSendUtterance(textInput.trim() || transcript.trim());
    }
  };

  const handleSendUtterance = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const userQuery = text.trim();
    setTextInput('');
    setTranscript('');
    setErrorMessage(null);

    setMessages((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setIsProcessing(true);

    try {
      const res: AIUtteranceResponse = await api.processUtterance(userQuery, messages);
      setIsProcessing(false);

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.conversational_reply }
      ]);

      voiceService.speakText(res.conversational_reply);

      if (res.intent === 'CREATE_TASK' && res.task) {
        onExtractedTask({
          title: res.task.title || 'New Task',
          category: res.task.category || 'Academic',
          deadline: res.task.deadline,
          estimated_duration: res.task.estimated_duration_minutes || 60,
          difficulty: res.task.difficulty || 'Moderate',
          importance: res.task.importance || 'HIGH'
        });
      } else if (res.intent === 'UPDATE_AVAILABILITY') {
        const sched = await api.getSchedule();
        onScheduleUpdated(sched);
      }
    } catch (e) {
      setIsProcessing(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Sorry, I had trouble processing that request. Please try again." }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-2xl overflow-hidden flex flex-col h-[640px] border-emerald-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Talk to FocusFlow AI</h3>
              <p className="text-xs text-zinc-400">Natural Language & Voice Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Permission Alert Box */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                You can use the voice sample buttons below or type your request directly.
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>FocusFlow AI is reasoning...</span>
            </div>
          )}
        </div>

        {/* Voice Listening Wave Indicator */}
        {isListening && (
          <div className="px-6 py-3 bg-emerald-950/50 border-t border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 h-6">
                <span className="w-1 bg-emerald-400 h-full animate-wave" />
                <span className="w-1 bg-emerald-400 h-3 animate-wave delay-100" />
                <span className="w-1 bg-emerald-400 h-5 animate-wave delay-200" />
                <span className="w-1 bg-emerald-400 h-2 animate-wave delay-300" />
              </div>
              <span className="text-xs text-emerald-300 font-medium italic">
                Listening... {textInput || transcript ? `"${textInput || transcript}"` : 'Speak into your microphone...'}
              </span>
            </div>
            <button
              onClick={handleStopVoice}
              className="text-xs bg-emerald-500 text-zinc-950 px-3 py-1 rounded-lg font-bold hover:bg-emerald-400 transition"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Sample Voice Presets Bar */}
        <div className="px-6 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold shrink-0 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-emerald-400" /> Sample Voice Utterances:
          </span>
          {voicePresets.map((vp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTextInput(vp);
                handleSendUtterance(vp);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:text-white whitespace-nowrap text-[11px] transition shrink-0"
            >
              "{vp.length > 35 ? vp.substring(0, 35) + '...' : vp}"
            </button>
          ))}
        </div>

        {/* Text Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
          <button
            onClick={isListening ? handleStopVoice : handleStartVoice}
            className={`p-3 rounded-xl border transition ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title={isListening ? 'Stop listening' : 'Start microphone listening'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendUtterance(textInput)}
            placeholder="Click mic to speak into field or type prompt..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition"
          />

          <button
            onClick={() => handleSendUtterance(textInput)}
            disabled={!textInput.trim() || isProcessing}
            className="p-2.5 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 transition font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
