"use client";

export default function ContentTree({ courseId }: { courseId: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-4">
      <h2 className="font-bold text-brand-text">Content Tree</h2>
      <p className="text-brand-muted">Content for course: {courseId}</p>
    </div>
  );
}