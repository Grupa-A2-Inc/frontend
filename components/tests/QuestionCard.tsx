"use client";

import { Trash2, CheckCircle2, Circle } from "lucide-react";
import type { DraftQuestion } from "@/types/domain/tests";

interface QuestionCardProps {
  question: DraftQuestion;
  index: number;
  onUpdateQuestionText: (questionId: string, text: string) => void;
  onUpdateOptionText: (questionId: string, optionId: string, text: string) => void;
  onToggleCorrectOption: (questionId: string, optionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export default function QuestionCard({
  question,
  index,
  onUpdateQuestionText,
  onUpdateOptionText,
  onToggleCorrectOption,
  onDeleteQuestion,
}: QuestionCardProps) {
  return (
    <div id={`q-${question.id}`} className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm hover:border-brand-primary/30 transition-colors">
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <span className="font-bold text-lg">{index + 1}</span>
          </div>
          <h3 className="text-xl font-bold text-brand-text whitespace-nowrap">Question</h3>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onDeleteQuestion(question.id)}
            className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      <textarea 
        value={question.prompt}
        onChange={(e) => onUpdateQuestionText(question.id, e.target.value)}
        placeholder="Write the question prompt here..."
        className="w-full min-h-[80px] bg-brand-bg border border-brand-border rounded-lg p-4 text-brand-text mb-6 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y placeholder:text-brand-muted/50 font-medium" 
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
              onClick={() => onToggleCorrectOption(question.id, opt.id)}
              className={`${opt.isCorrect ? "text-green-500" : "text-brand-muted hover:text-green-400"} transition flex-shrink-0`}
              title="Mark as correct answer"
            >
              {opt.isCorrect ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <input 
              type="text" 
              value={opt.label}
              onChange={(e) => onUpdateOptionText(question.id, opt.id, e.target.value)}
              placeholder="Answer choice..."
              className={`flex-1 bg-brand-bg border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition ${
                opt.isCorrect ? "border-green-500/30 text-green-700 dark:text-green-400 font-medium" : "border-brand-border text-brand-text focus:border-brand-primary"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
