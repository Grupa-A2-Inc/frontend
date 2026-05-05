"use client";

import { useAppSelector } from "@/store/hooks";

type Props = {
  selectedClasses: string[];
  onToggle: (classId: string) => void;
};

export default function ClassSelector({ selectedClasses, onToggle }: Props) {
  const { classrooms } = useAppSelector((state) => state.classes);

  if (classrooms.length === 0) {
    return (
      <div className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2">
        <p className="text-xs text-brand-text/40">No classes available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2">
      {classrooms.map((cls) => (
        <label key={cls.id} className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => onToggle(cls.id)}
            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
              selectedClasses.includes(cls.id)
                ? "bg-brand-primary border-brand-primary"
                : "border-brand-primary/30 group-hover:border-brand-primary/60"
            }`}
          >
            {selectedClasses.includes(cls.id) && (
              <span className="material-symbols-rounded text-white" style={{ fontSize: "0.7rem" }}>
                check
              </span>
            )}
          </div>
          <span className="text-sm text-brand-text/70 group-hover:text-brand-text transition-colors truncate">
            {cls.name}
          </span>
        </label>
      ))}
    </div>
  );
}
