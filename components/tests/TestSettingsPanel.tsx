"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { generateTestThunk } from "@/store/slices/testDraftSlice";

export default function TestSettingsPanel({ courseId }: { courseId: string }) {
  const dispatch = useAppDispatch();
  const { isGenerating } = useAppSelector((state) => state.testDraft);
  
  const [qCount, setQCount] = useState(5);
  const [selectedNodes] = useState(["chapter-1"]); 

  const handleGenerate = () => {
    dispatch(generateTestThunk({ courseId, questionCount: qCount }));
  };

  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-xl shadow-sm">
     
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        
        <div className="flex-1 w-full">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">CONTENTS</label>
          <select className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition">
            <option>All chapters</option>
            <option>Chapter 1: Introduction</option>
          </select>
        </div>

        <div className="w-full sm:w-32">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">Questions</label>
          <input 
            type="number" 
            value={qCount}
            onChange={(e) => setQCount(Number(e.target.value))}
            min={1} max={50} 
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition" 
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
          {isGenerating ? "AI is thinking..." : "Generate"}
        </button>
      </div>
    </div>
  );
}