'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/index';
import { fetchStudentProgress } from '@/store/slices/analyticsSlice';

interface DashboardProps {
  studentId: string;
}

export const StudentProgressDashboard = ({ studentId }: DashboardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { coursesProgress, isLoading, error } = useSelector((state: RootState) => state.analytics);

useEffect(() => {
  if (studentId) {
    console.log("DEBUG: Trimit ID-ul către server:", studentId);
    dispatch(fetchStudentProgress(studentId));
  } else {
    console.warn("DEBUG: studentId este gol sau undefined!");
  }
}, [dispatch, studentId]);

  if (isLoading) return <p className="text-brand-muted p-4 italic">Loading analytics...</p>;
  if (error) return <p className="text-red-400 p-4">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6 space-y-4">
        <h2 className="text-brand-text font-semibold text-base">Course Progress</h2>
        
        {coursesProgress.length === 0 ? (
          <p className="text-brand-muted text-sm">No courses enrolled.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {coursesProgress.map((course) => (
              <div key={course.unrollmentId} className="bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-brand-text truncate">{course.courseTitle}</h3>
                  <p className="text-[10px] text-brand-muted uppercase tracking-widest font-semibold">{course.courseCategory}</p>
                </div>
                <div className="w-full bg-brand-primary/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#7c6fcd] to-[#22d3ee] h-full transition-all duration-700" 
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-brand-muted italic">Progress</span>
                  <span className="text-brand-text font-bold">{course.progressPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};