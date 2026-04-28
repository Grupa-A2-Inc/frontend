"use client";

type Props = {totalCourses: number; onCreateCourse: () => void;};
export default function CoursesHeader({ totalCourses, onCreateCourse }: Props) {
    return (
    <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-brand-text">My courses</h1>
      <p className="text-brand-text/40 text-sm mt-1">
        {totalCourses} course{totalCourses !== 1 ? "s" : ""}
      </p>
    </div>
    <button
      onClick={onCreateCourse}
      className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors">
      <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>add</span>
      Create course
    </button>
  </div>);
}