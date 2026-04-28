"use client";

import { Course } from "@/store/slices/coursesSlice";
import CourseRow from "./CoursesRow";

type Props = {
  courses: Course[];
  loading: boolean;
  error: string | null;
  search: string;
  statusFilter: "ALL" | "PUBLISHED" | "DRAFT" | "HIDDEN";
  onEdit: (courseId: string) => void;
  onManage: (courseId: string) => void;
  onRetry: () => void;
};

export default function CoursesList({ courses, loading, error, search, statusFilter, onEdit, onManage, onRetry }: Props) {
    return (
    <div className="bg-brand-card border border-brand-primary/15 rounded-2xl overflow-hidden">
    {/*starea loading*/ 
    loading && (<>{[1, 2, 3].map((i) => (<div key={i} className="h-16 animate-pulse border-b border-brand-primary/10 bg-brand-primary/5" />))}</>)}
    
    {/*apare msj de eroare + retry*/ 
    error && !loading && (
      <div className="px-5 py-10 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={onRetry} className="px-4 py-2 text-xs font-medium border border-brand-primary/20 rounded-lg text-brand-text/70 hover:text-brand-text transition-colors">
          Retry
        </button>
      </div>
    )}

    {/*starea empty*/
    !loading && !error && courses.length === 0 && (
      <div className="px-5 py-16 text-center">
        <p className="text-brand-text/40 text-sm">No courses found.</p>
      </div>
    )}

    {/*lista de cursuri*/
    !loading && !error && courses.length > 0 && courses.map((course) => (
      <CourseRow key={course.id} course={course} onEdit={onEdit} onManage={onManage} />))}
  </div>);
}