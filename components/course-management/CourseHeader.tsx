"use client";

export default function CourseHeader({ courseId }: { courseId: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-4">
      <h2 className="font-bold text-brand-text">Course Header</h2>
      <p className="text-brand-muted">Course ID: {courseId}</p>
    </div>
  );
}