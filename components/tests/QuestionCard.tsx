"use client";

import { Trash2, CheckCircle2, Circle, CircleHelp } from "lucide-react";

interface Option {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  prompt: string;
  options: Option[];
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onChangePrompt: (qId: string, newText: string) => void;
  onChangeOption: (qId: string, optId: string, newText: string) => void;
  onMarkCorrect: (qId: string, optId: string) => void;
  onDelete: (qId: string) => void;
}

export default function QuestionCard({
  question,
  index,
  onChangePrompt,
  onChangeOption,
  onMarkCorrect,
  onDelete
}: QuestionCardProps) {
  
  return (
    <div id={`q-${question.id}`} className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm hover:border-brand-primary/30 transition-colors">
     <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <CircleHelp size={30} />
          </div>
          
          <h3 className="text-xl font-bold text-brand-text whitespace-nowrap">Question {index + 1}</h3>
        </div>

        <button 
          onClick={() => onDelete(question.id)}
          className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <textarea 
        value={question.prompt}
        onChange={(e) => onChangePrompt(question.id, e.target.value)}
        placeholder="Write question here..."
className="w-full min-h-[80px] bg-brand-bg border border-brand-border rounded-lg p-3 text-brand-text mb-5 focus:border-brand-primary outline-none resize-y placeholder:text-brand-muted" 
      />

      <div className="space-y-3">
        {question.options.map((opt) => (
          <div 
            key={opt.id} 
            className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
              opt.isCorrect ? "border-green-500/50 bg-green-500/5" : "border-transparent"
            }`}
          >
            <button 
              onClick={() => onMarkCorrect(question.id, opt.id)}
              className={`${opt.isCorrect ? "text-green-500" : "text-brand-muted hover:text-green-400"} transition`}
              title="Mark as correct answer"
            >
              {opt.isCorrect ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
            <input 
              type="text" 
              value={opt.label}
              onChange={(e) => onChangeOption(question.id, opt.id, e.target.value)}
              placeholder="Answer choice..."
              className={`flex-1 bg-brand-bg border rounded-lg px-4 py-2 text-sm focus:outline-none transition ${
                opt.isCorrect ? "border-green-500/30 text-green-50" : "border-brand-border text-brand-text focus:border-brand-primary"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}