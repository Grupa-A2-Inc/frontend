"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { generateTestThunk } from "@/store/slices/testDraftSlice";
import { fetchCourseFullView } from "@/lib/courses/api";
import { Chapter } from "@/lib/courses/types";

export default function TestSettingsPanel({ courseId }: { courseId: string }) {
  const dispatch = useAppDispatch();
  const { isGenerating } = useAppSelector((state) => state.testDraft);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  
  const [qCount, setQCount] = useState(5);
  const [selectedNode, setSelectedNode] = useState("ALL"); 

  // Incarcam capitolele reale ale cursului
  useEffect(() => {
    async function loadChapters() {
      try {
        const { chapters } = await fetchCourseFullView(courseId);
        setChapters(chapters);
      } catch (err) {
        console.error("Failed to load chapters for test settings", err);
      } finally {
        setLoadingChapters(false);
      }
    }
    loadChapters();
  }, [courseId]);

  const handleGenerate = () => {
    const payload = {
      courseId,
      questionCount: qCount,
      sourceNodes: selectedNode === "ALL" ? [] : [selectedNode]
    };
    dispatch(generateTestThunk(payload));
  };

  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        
        <div className="flex-1 w-full">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">SOURCE CONTENT</label>
          <select 
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            disabled={loadingChapters || isGenerating}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition disabled:opacity-60"
          >
            <option value="ALL">{loadingChapters ? "Loading..." : "Entire Course"}</option>
            {chapters.map((chap) => (
              <option key={chap.id} value={chap.id}>Chapter: {chap.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-32">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">QUESTIONS</label>
          <input 
            type="number" 
            value={qCount}
            onChange={(e) => setQCount(Number(e.target.value))}
            min={1} max={50} 
            disabled={isGenerating}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition disabled:opacity-60" 
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || loadingChapters} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
          {isGenerating ? "Generating..." : "Generate AI"}
        </button>
      </div>
    </div>
  );
}