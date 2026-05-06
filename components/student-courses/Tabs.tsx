import { Tab } from "@/lib/student-courses/types";

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

//afisez tab urile My Courses si Discover
export default function CoursesTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-1 bg-brand-mid p-1 rounded-xl w-fit mb-6">
      <button
        onClick={() => onTabChange("my")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === "my" ? "bg-brand-card text-brand-text shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>
        My Courses
      </button>
      <button
        onClick={() => onTabChange("discover")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === "discover" ? "bg-brand-card text-brand-text shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>
        Discover
      </button>
    </div>
  );
}