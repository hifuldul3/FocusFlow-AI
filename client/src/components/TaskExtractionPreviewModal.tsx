import React, { useState } from 'react';
import { X, Check, Clock, Calendar, AlertTriangle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { ScheduleResponse } from '../types';

interface TaskExtractionPreviewModalProps {
  taskData: {
    title?: string;
    category?: 'Academic' | 'Project' | 'Personal' | 'Work';
    deadline?: string;
    estimated_duration?: number;
    difficulty?: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
    importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  } | null;
  onClose: () => void;
  onTaskCreated: (schedule: ScheduleResponse) => void;
}

export const TaskExtractionPreviewModal: React.FC<TaskExtractionPreviewModalProps> = ({
  taskData,
  onClose,
  onTaskCreated
}) => {
  if (!taskData) return null;

  const [title, setTitle] = useState(taskData.title || 'DBMS Assignment');
  const [category, setCategory] = useState<'Academic' | 'Project' | 'Personal' | 'Work'>(taskData.category || 'Academic');
  const [deadline, setDeadline] = useState(
    taskData.deadline ? taskData.deadline.substring(0, 16) : new Date(Date.now() + 24 * 3600 * 1000).toISOString().substring(0, 16)
  );
  const [estimatedDuration, setEstimatedDuration] = useState(taskData.estimated_duration || 120);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult'>(taskData.difficulty || 'Moderate');
  const [importance, setImportance] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(taskData.importance || 'HIGH');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.createTask({
        title,
        category,
        deadline: new Date(deadline).toISOString(),
        estimated_duration: Number(estimatedDuration),
        difficulty,
        importance,
        remaining_duration: Number(estimatedDuration)
      });
      setIsSaving(false);
      onTaskCreated(res.schedule);
      onClose();
    } catch (e) {
      setIsSaving(false);
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg p-6 border-emerald-500/40 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">AI Extracted Task Preview</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          FocusFlow AI extracted these details from your natural language input. Please verify or edit before adding to your schedule:
        </p>

        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Academic">Academic</option>
                <option value="Project">Project</option>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Est. Duration (mins)</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Target Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Importance</label>
              <select
                value={importance}
                onChange={(e: any) => setImportance(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Difficult">Difficult</option>
                <option value="Very Difficult">Very Difficult</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Calculate Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
