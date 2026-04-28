import CourseEditor from "@/components/course-editor/CourseEditor";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;
  return <CourseEditor mode="edit" courseId={courseId} />;
}
