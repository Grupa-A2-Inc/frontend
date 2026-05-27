"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { StudentCourse } from "@/lib/student-courses/types";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import CertificateDownloadAction from "./CertificateDownloadAction";

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
  variant?: "my" | "discover";
  isEnrolled?: boolean;
  isEnrolling?: boolean;
  onEnroll?: (courseId: string) => void;
  token?: string;
};

function getCourseStatusLabel(course: StudentCourse, isEnrolled: boolean) {
  if (isEnrolled) return "Enrolled";
  if (course.status === "PUBLISHED") return "Published";
  return "Draft";
}

function isOpenActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

export default function CourseCard({
  course,
  variant = "my",
  isEnrolled = false,
  isEnrolling = false,
  onEnroll,
  token = "",
}: Props) {
  const router = useRouter();
  const image = CATEGORY_IMAGE[course.category] ?? "📚";
  const canOpenCourse = variant === "my" || isEnrolled;

  function handleOpen() {
    if (canOpenCourse) {
      router.push(`/dashboard/student/courses/${course.id}`);
    }
  }

  function handleOpenKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isOpenActivationKey(event.key)) {
      event.preventDefault();
      handleOpen();
    }
  }

  function handleEnroll(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!isEnrolled && !isEnrolling) {
      onEnroll?.(course.id);
    }
  }

  const statusLabel = getCourseStatusLabel(course, isEnrolled);
  const enrollLabel = isEnrolling ? "Enrolling" : statusLabel;

  return (
    <div
      onClick={handleOpen}
      onKeyDown={handleOpenKeyDown}
      className={`bg-brand-card border border-brand-border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col ${
        canOpenCourse
          ? "cursor-pointer hover:border-brand-primary/50"
          : "cursor-default"
      }`}
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

        {typeof course.progressPercent === "number" && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs text-brand-muted mb-1">
              <span>Progress</span>
              <span>{Math.round(course.progressPercent)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-brand-mid overflow-hidden">
              <div
                className="h-full bg-brand-primary"
                style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }}
              />
            </div>
          </div>
        )}

        {variant === "my" && (course.progressPercent ?? 0) >= 100 && course.enrollmentId && (
          <CertificateDownloadAction
            token={token}
            courseId={course.id}
            courseTitle={course.title}
            enrollment={course}
            compact
            preventParentNavigation
          />
        )}

        <div className="flex items-center justify-between pt-2 border-t border-brand-border mt-auto">
          <span className="text-xs text-brand-muted">
            {statusLabel}
          </span>
          {variant === "discover" ? (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolled || isEnrolling}
              className="inline-flex items-center gap-1.5 text-brand-primary text-xs font-medium disabled:text-brand-muted disabled:cursor-not-allowed"
            >
              {isEnrolling ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isEnrolled ? (
                <CheckCircle2 size={13} />
              ) : (
                <PlusCircle size={13} />
              )}
              {isEnrolled ? "Enrolled" : enrollLabel}
            </button>
          ) : (
            <span className="text-brand-primary text-xs font-medium">
              View →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
