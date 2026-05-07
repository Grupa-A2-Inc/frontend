"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  enrollInCourseThunk,
  fetchMyCoursesThunk,
  fetchPublicCoursesThunk,
} from "@/store/slices/studentCoursesSlice";
import CoursesHeader from "./Header";
import CoursesTabs from "./Tabs";
import CoursesSearch from "./SearchBar";
import CoursesGrid from "./CoursesGrid";
import PaginationControls from "./PaginationControls";

import { Tab } from "@/lib/student-courses/types";

const DEFAULT_PAGE_SIZE = 10;

export default function StudentCoursesPage() {
  const dispatch = useAppDispatch();
  
  const {
    myCourses,
    publicCourses,
    myPagination,
    publicPagination,
    isLoadingMy,
    isLoadingPublic,
    enrollingCourseId,
    error,
  } =
    useAppSelector((state) => state.studentCourses);

  const { accessToken } = useAppSelector((state) => state.auth);
  const token =
    accessToken ??
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("my");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchMyCoursesThunk({ token, page: 0, size: pageSize }));
    dispatch(fetchPublicCoursesThunk({ token, page: 0, size: pageSize }));
  }, [token, dispatch, pageSize]);

const currentCourses = activeTab === "my" ? myCourses : publicCourses;
const enrolledCourseIds = new Set(myCourses.map((course) => course.id));

/*
//date mock
const mockCourses = [
  { id: "1", title: "Introduction to Algorithms", description: "Learn sorting and searching", category: "Computer Science", status: "PUBLISHED" as const, visibility: "PUBLIC" as const, createdBy: "1" },
  { id: "2", title: "React & Next.js", description: "Build modern web apps", category: "Web", status: "PUBLISHED" as const, visibility: "PUBLIC" as const, createdBy: "1" },
  { id: "3", title: "Python for Data Science", description: "Pandas and NumPy", category: "Data Science", status: "PUBLISHED" as const, visibility: "PUBLIC" as const, createdBy: "1" },
  { id: "4", title: "UI/UX Design Basics", description: "Figma and wireframing", category: "Design", status: "DRAFT" as const, visibility: "PRIVATE" as const, createdBy: "1" },
];
const currentCourses = mockCourses;
*/

  const isLoading = activeTab === "my" ? isLoadingMy : isLoadingPublic;
  const pagination = activeTab === "my" ? myPagination : publicPagination;

  const categories = [...new Set(currentCourses.map((c) => c.category))];
  const selectedCategory = categories.includes(category) ? category : "ALL";

  const filtered = currentCourses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleEnroll(courseId: string) {
    if (!token) return;
    dispatch(
      enrollInCourseThunk({
        token,
        courseId,
        myPage: myPagination.number,
        publicPage: publicPagination.number,
        size: pageSize,
      })
    );
  }

  function handlePageChange(page: number) {
    if (!token) return;
    if (activeTab === "my") {
      dispatch(fetchMyCoursesThunk({ token, page, size: pageSize }));
      return;
    }
    dispatch(fetchPublicCoursesThunk({ token, page, size: pageSize }));
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setCategory("ALL");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col p-6">
      <CoursesHeader totalCourses={pagination.totalElements} />

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <CoursesTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <CoursesSearch
        search={search}
        onSearchChange={setSearch}
        category={selectedCategory}
        onCategoryChange={setCategory}
        categories={categories}
      />

      <div className="flex-1">
        <CoursesGrid
          courses={filtered}
          loading={isLoading}
          emptyMessage={
            activeTab === "my" ? "You have no courses yet." : "No public courses found."
          }
          variant={activeTab === "my" ? "my" : "discover"}
          enrolledCourseIds={enrolledCourseIds}
          enrollingCourseId={enrollingCourseId}
          onEnroll={handleEnroll}
        />
      </div>

      <PaginationControls
        pagination={pagination}
        loading={isLoading}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
