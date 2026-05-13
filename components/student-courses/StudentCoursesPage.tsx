"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useEnrollInCourseMutation,
  useGetEnrolledCoursesQuery,
  useGetPublicCoursesQuery,
} from "@/store/api/coursesApi";
import CoursesHeader from "./Header";
import CoursesTabs from "./Tabs";
import CoursesSearch from "./SearchBar";
import CoursesGrid from "./CoursesGrid";
import PaginationControls from "./PaginationControls";

import type { CoursePaginationMeta } from "@/types/domain/courses";

const DEFAULT_PAGE_SIZE = 10;
type Tab = "my" | "discover";

const EMPTY_PAGINATION: CoursePaginationMeta = {
  totalPages: 0,
  totalElements: 0,
  numberOfElements: 0,
  size: DEFAULT_PAGE_SIZE,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

function getPaginationMeta(
  page: { content: unknown[] } & CoursePaginationMeta | undefined,
): CoursePaginationMeta {
  if (!page) return EMPTY_PAGINATION;

  return {
    totalPages: page.totalPages,
    totalElements: page.totalElements,
    numberOfElements: page.numberOfElements,
    size: page.size,
    number: page.number,
    first: page.first,
    last: page.last,
    empty: page.empty,
  };
}

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [myPage, setMyPage] = useState(0);
  const [publicPage, setPublicPage] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const {
    data: myCoursesPage,
    isLoading: isLoadingMy,
    error: myCoursesError,
  } = useGetEnrolledCoursesQuery({ page: myPage, size: pageSize });
  const {
    data: publicCoursesPage,
    isLoading: isLoadingPublic,
    error: publicCoursesError,
  } = useGetPublicCoursesQuery({ page: publicPage, size: pageSize });
  const [enrollInCourse, { error: enrollError }] = useEnrollInCourseMutation();

  const myCourses = myCoursesPage?.content ?? [];
  const publicCourses = publicCoursesPage?.content ?? [];
  const myPagination = getPaginationMeta(myCoursesPage);
  const publicPagination = getPaginationMeta(publicCoursesPage);
  const error = myCoursesError || publicCoursesError || enrollError
    ? getApiErrorMessage(myCoursesError ?? publicCoursesError ?? enrollError)
    : "";

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

  async function handleEnroll(courseId: string) {
    setEnrollingCourseId(courseId);
    try {
      await enrollInCourse(courseId).unwrap();
    } finally {
      setEnrollingCourseId(null);
    }
  }

  function handlePageChange(page: number) {
    if (activeTab === "my") {
      setMyPage(page);
      return;
    }
    setPublicPage(page);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setCategory("ALL");
    setMyPage(0);
    setPublicPage(0);
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
