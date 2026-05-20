"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLessonRating, submitLessonRating } from "@/store/slices/lessonRatingSlice"; 

export default function LessonRating({ lessonId }: { lessonId: string }) {
  const dispatch = useAppDispatch();
  const { summary, loading, submitting, error } = useAppSelector((state: any) => state.lessonRating);
  
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    setIsMounted(true); 
    if (lessonId) {
      dispatch(fetchLessonRating(lessonId));
    }
  }, [lessonId, dispatch]);

  const handleRate = (ratingValue: number) => {
  if (submitting || (summary?.myRating && summary.myRating > 0)) return;
  
  dispatch(submitLessonRating({ 
    lessonId, 
    payload: { 
      rating: ratingValue, 
      comment: "Lectie evaluata" 
    } 
  }));
};

  if (!isMounted || loading) {
    return (
      <div className="flex items-center gap-2 bg-brand-bg p-4 rounded-xl border border-brand-border text-brand-muted text-sm">
        <Loader2 className="animate-spin" size={16} /> Verificare status evaluare...
      </div>
    );
  }

  const isCurrentLesson = summary?.lessonId === lessonId;
  const myRating = isCurrentLesson ? (summary?.myRating || 0) : 0;
  const hasVoted = myRating > 0;


  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-bg p-4 rounded-xl border border-brand-border">
      <div>
        <h4 className="text-white font-semibold text-sm">
          {hasVoted ? "Ai evaluat această lecție" : "Cum ți s-a părut această lecție?"}
        </h4>
        
        {isCurrentLesson && summary && summary.avgRating > 0 && (
          <p className="text-brand-muted text-xs mt-1">
            Media lecției: {summary.avgRating.toFixed(1)} / 5 ({summary.totalRatings} voturi)
          </p>
        )}

        {error && (
          <p className="text-red-400 text-xs mt-2 font-bold">
            Eroare: {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star: number) => {
          const isFilled = hasVoted ? star <= myRating : star <= hoveredStar;
          
          return (
            <button
              key={star}
              type="button"
              disabled={hasVoted || submitting}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !hasVoted && setHoveredStar(star)}
              onMouseLeave={() => !hasVoted && setHoveredStar(0)}
              className={`p-1 transition-all ${
                hasVoted ? "cursor-default" : "cursor-pointer hover:scale-110"
              } ${submitting ? "opacity-50" : "opacity-100"}`}
            >
              <Star
                size={24}
                className={`transition-colors ${
                  isFilled 
                    ? "fill-amber-400 text-amber-400" 
                    : "fill-transparent text-brand-muted hover:text-amber-200"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}