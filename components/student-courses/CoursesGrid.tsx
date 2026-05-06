import { StudentCourse } from "@/lib/student-courses/types";
import CourseCard from "./CourseCard";

type Props = {
  courses: StudentCourse[];
  loading: boolean;
  emptyMessage: string;
};

export default function CoursesGrid({ courses, loading, emptyMessage }: Props) {
    if (loading) 
        return <p className="text-brand-muted">Loading...</p>;
    if (courses.length === 0) 
        return <p className="text-brand-muted">{emptyMessage}</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}