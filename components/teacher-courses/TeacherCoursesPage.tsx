"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCourses, Course, CourseStatus } from "@/store/slices/coursesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CoursesHeader from "./CoursesHeader";
import CoursesFilters from "./CoursesFilters";
import CoursesList from "./CoursesList";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "HIDDEN";

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((state) => state.courses);
  const { accessToken } = useAppSelector((state) => state.auth);
  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  //date mock
  const mockCourses = [
  { id: "1", title: "Introduction to Algorithms", description: "Sorting and searching", category: "Computer Science", status: "PUBLISHED" as CourseStatus, visibility: "PUBLIC", createdBy: "me" },
  { id: "2", title: "Web Development Basics", description: "HTML, CSS, JS", category: "Web", status: "DRAFT" as CourseStatus, visibility: "PUBLIC", createdBy: "me" },
  { id: "3", title: "Database Systems", description: "SQL and normalization", category: "Databases", status: "HIDDEN" as CourseStatus, visibility: "PRIVATE", createdBy: "me" },
];

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCourses(token));
  }, [token, dispatch]);

  const filtered = mockCourses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // astept pana vad cum o numit ceilalti fisierele
  function handleEdit(courseId: string) {
    //router.push(`/dashboard/teacher/${courseId}/edit`);
  }

  function handleManage(courseId: string) {
    //router.push(`/dashboard/teacher/${courseId}`);
  }

  function handleCreateCourse() {
    //router.push(`/dashboard/teacher/create`);
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
      {/* <CoursesList
        courses={filtered}
        loading={loading}
        //error={error} 
        error = {null} //pt mock, sterg cand avem date de la backend si o las pe cealalta
        search={search}
        statusFilter={statusFilter}
        onEdit={handleEdit}
        onManage={handleManage}
        onRetry={() => dispatch(fetchCourses(token))}
      /> */}
    </div>
  );
}