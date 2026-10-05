import React, { useState } from 'react';
import { Bot, User, Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { voiceService } from '../services/voice';
import { api } from '../services/api';
import { ScheduleResponse } from '../types';

interface AIAssistantPageProps {
  onScheduleUpdated: (schedule: ScheduleResponse) => void;
  onExtractedTask: (taskData: any) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  onScheduleUpdated,
  onExtractedTask
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: "Hello Arun! I'm your FocusFlow AI Assistant. Ask me what to do today, add new assignments, or tell me if your plans change!"
    }
  ]);

  const quickPrompts = [
    'What should I work on now?',
    'Add a Python assignment due Friday.',
    "I'm free only from 8 to 10 tonight.",
    'Show me my overdue tasks.'
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const query = text.trim();
    setInput('');

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setIsProcessing(true);

    try {
      const res = await api.processUtterance(query, messages);
      setIsProcessing(false);

      setMessages((prev) => [...prev, { sender: 'ai', text: res.conversational_reply }]);

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
        { sender: 'ai', text: "I'm having trouble processing that request right now." }
      ]);
    }
  };

  const toggleVoice = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      if (input.trim()) handleSend(input);
    } else {
      setIsListening(true);
      await voiceService.startListening({
        onResult: (text, isFinal) => {
          setInput(text); // LIVE CHARACTER-BY-CHARACTER INPUT FIELD POPULATION!
          if (isFinal) {
            setIsListening(false);
            handleSend(text);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Assistant Chat</h1>
        <p className="text-xs text-zinc-400">Conversational schedule management and guidance</p>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 whitespace-nowrap hover:border-emerald-500/40 hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-card p-6 overflow-y-auto space-y-4 border-zinc-800">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm max-w-[80%] leading-relaxed ${
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
            <span>FocusFlow AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleVoice}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Click mic to speak into input or type your prompt..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition"
        />

        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isProcessing}
          className="p-3 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 font-bold transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
