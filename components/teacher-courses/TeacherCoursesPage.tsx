"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetMyCoursesQuery } from "@/store/api/coursesApi";
import CoursesHeader from "./CoursesHeader";
import CoursesFilters from "./CoursesFilters";
import CoursesList from "./CoursesList";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "HIDDEN";

export default function TeacherCoursesPage() {
  const { data: courses = [], isLoading, error, refetch } = useGetMyCoursesQuery();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleEdit(courseId: string) {
    router.push(`/dashboard/teacher/courses/${courseId}/edit`);
  }

  function handleManage(courseId: string) {
    router.push(`/dashboard/teacher/courses/${courseId}`);
  }

  function handleCreateCourse() {
    router.push("/dashboard/teacher/courses/new");
  }

  return (
    <div>
      <CoursesHeader
        totalCourses={courses.length}
        onCreateCourse={handleCreateCourse}
      />
      <CoursesFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
      />
      <CoursesList
        courses={filtered}
        loading={isLoading}
        error={error ? getApiErrorMessage(error) : null}
        onEdit={handleEdit}
        onManage={handleManage}
        onRetry={() => refetch()}
      />
    </div>
  );
}
