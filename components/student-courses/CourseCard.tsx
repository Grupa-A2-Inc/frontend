"use client";

import { StudentCourse } from "@/lib/student-courses/types";
import { useRouter } from "next/navigation";

//generez la final fiecare imagine
const CATEGORY_IMAGE: Record<string, string> = {
  "Computer Science": "💻",
  "Web": "🌐",
  "Databases": "🗄️",
  "Mobile": "📱",
  "Design": "🎨",
  "Data Science": "📊",
};

type Props = {
  course: StudentCourse;
};

export default function CourseCard({ course }: Props) {
  const router = useRouter();
  const image = CATEGORY_IMAGE[course.category] ?? "📚";

  return (
    <div
      onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
      className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden cursor-pointer hover:border-brand-primary/50 transition-all duration-200 hover:shadow-md flex flex-col"
    >
      <div className="w-full h-36 bg-brand-mid flex items-center justify-center text-5xl">
        {image}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs font-medium text-brand-muted">
          {course.category}
        </span>

        <h3 className="text-brand-text font-medium text-sm leading-snug line-clamp-2">
          {course.title}
        </h3>

        <p className="text-brand-muted text-xs line-clamp-2 flex-1">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-brand-border mt-auto">
          <span className="text-xs text-brand-muted">
            {course.status === "PUBLISHED" ? "Published" : "Draft"}
          </span>
          <span className="text-brand-primary text-xs font-medium">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}