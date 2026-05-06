type Props = {
  totalCourses: number;
};

export default function Header({ totalCourses }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-brand-text">Courses</h1>
      <p className="text-brand-muted text-sm mt-1">
        {totalCourses} {totalCourses === 1 ? "course" : "courses"} available
      </p>
    </div>
  );
}