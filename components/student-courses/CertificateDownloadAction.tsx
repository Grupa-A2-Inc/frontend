"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { AlertCircle, Download, Loader2, Lock } from "lucide-react";
import type { CourseVisibility } from "@/lib/courses/types";
import type { StudentCourse } from "@/lib/student-courses/types";
import {
  downloadCertificatePdf,
  fetchCertificateCourseVisibility,
  findEnrollmentForCourse,
} from "@/lib/student-courses/certificates";

export type CertificateActionStatus =
  | "checking"
  | "available"
  | "private"
  | "incomplete"
  | "downloading"
  | "error";

type Props = {
  token: string;
  courseId: string;
  courseTitle: string;
  enrollment?: StudentCourse;
  visibility?: CourseVisibility;
  compact?: boolean;
  preventParentNavigation?: boolean;
};

function certificateFileName(courseTitle: string): string {
  const safeTitle = courseTitle
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `AdaptiveTutor-${safeTitle || "course"}-certificate.pdf`;
}

function startBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function CertificateDownloadAction({
  token,
  courseId,
  courseTitle,
  enrollment,
  visibility,
  compact = false,
  preventParentNavigation = false,
}: Props) {
  const [resolvedEnrollment, setResolvedEnrollment] = useState<StudentCourse | null>(
    enrollment ?? null
  );
  const [status, setStatus] = useState<CertificateActionStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function checkAvailability() {
      setStatus("checking");
      setMessage(null);

      if (!token) {
        setStatus("error");
        setMessage("Sign in again to download your certificate.");
        return;
      }

      try {
        const currentEnrollment =
          enrollment ?? (await findEnrollmentForCourse(token, courseId));

        if (ignore) return;
        setResolvedEnrollment(currentEnrollment);

        if (!currentEnrollment?.completedAt || !currentEnrollment.enrollmentId) {
          setStatus("incomplete");
          return;
        }

        const courseVisibility =
          visibility ?? (await fetchCertificateCourseVisibility(token, courseId));

        if (ignore) return;
        setStatus(courseVisibility === "PUBLIC" ? "available" : "private");
      } catch (error) {
        if (ignore) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not check certificate availability."
        );
      }
    }

    void checkAvailability();

    return () => {
      ignore = true;
    };
  }, [courseId, enrollment, reloadKey, token, visibility]);

  function stopParent(event: MouseEvent<HTMLElement>) {
    if (preventParentNavigation) {
      event.stopPropagation();
    }
  }

  async function handleDownload(event: MouseEvent<HTMLButtonElement>) {
    stopParent(event);
    if (!resolvedEnrollment?.enrollmentId || status === "downloading") return;

    setStatus("downloading");
    setMessage(null);

    try {
      const certificate = await downloadCertificatePdf(token, resolvedEnrollment.enrollmentId);
      startBrowserDownload(certificate, certificateFileName(courseTitle));
      setStatus("available");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not download certificate."
      );
    }
  }

  const buttonClasses = compact
    ? "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-primary/30 px-2.5 py-2 text-xs font-medium transition-colors"
    : "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors";

  if (status === "checking") {
    return (
      <div
        className={`${buttonClasses} border-brand-border text-brand-muted`}
        onClick={stopParent}
        role="status"
      >
        <Loader2 size={compact ? 13 : 16} className="animate-spin" />
        Checking certificate...
      </div>
    );
  }

  if (status === "private") {
    return (
      <button
        type="button"
        disabled
        onClick={stopParent}
        className={`${buttonClasses} cursor-not-allowed border-brand-border text-brand-muted`}
      >
        <Lock size={compact ? 13 : 16} />
        Certificate unavailable for private courses
      </button>
    );
  }

  if (status === "incomplete") {
    return (
      <div
        className={`${buttonClasses} border-brand-border text-brand-muted`}
        onClick={stopParent}
      >
        <Lock size={compact ? 13 : 16} />
        Complete this course to unlock your certificate
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2" onClick={stopParent}>
        <p className="flex items-center gap-1.5 text-xs text-red-500" role="alert">
          <AlertCircle size={13} />
          {message}
        </p>
        <button
          type="button"
          onClick={(event) => {
            stopParent(event);
            setReloadKey((value) => value + 1);
          }}
          className={`${buttonClasses} border-brand-border text-brand-primary hover:border-brand-primary/50`}
        >
          Retry certificate
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={status === "downloading"}
      className={`${buttonClasses} border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 disabled:cursor-wait disabled:text-brand-muted`}
    >
      {status === "downloading" ? (
        <Loader2 size={compact ? 13 : 16} className="animate-spin" />
      ) : (
        <Download size={compact ? 13 : 16} />
      )}
      {status === "downloading" ? "Downloading certificate..." : "Download certificate"}
    </button>
  );
}
