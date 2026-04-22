"use client";

import { useAppSelector } from "@/store/hooks";

type Props = {
  selectedClasses: string[];
  onToggle: (classId: string) => void;
};

export default function ClassSelector({ selectedClasses, onToggle }: Props) {
  // Luam clasele din classesSlice care deja exista in store
  const { courses } = useAppSelector((state) => state.classes);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-brand-text/60">
          Assign to Classes
          <span className="text-brand-text/30 font-normal ml-1">(optional)</span>
        </label>
        <div className="bg-brand-mid border border-brand-primary/20 rounded-xl p-3">
          <p className="text-xs text-brand-text/40">No classes available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-brand-text/60">
        Assign to Classes
        <span className="text-brand-text/30 font-normal ml-1">(optional)</span>
      </label>
      <div className="flex flex-col gap-2 bg-brand-mid border border-brand-primary/20 rounded-xl p-3">
        {courses.map((cls) => (
          <label key={cls.id} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onToggle(cls.id)}
              className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                selectedClasses.includes(cls.id)
                  ? "bg-brand-primary border-brand-primary"
                  : "border-brand-primary/30 group-hover:border-brand-primary/60"
              }`}
            >
              {selectedClasses.includes(cls.id) && (
                <span className="material-symbols-rounded text-white" style={{ fontSize: "0.75rem" }}>
                  check
                </span>
              )}
            </div>
            <span className="text-sm text-brand-text/70 group-hover:text-brand-text transition-colors">
              {cls.title}
            </span>
          </label>
        ))}
      </div>
      {selectedClasses.length > 0 && (
        <p className="text-xs text-brand-primary">
          {selectedClasses.length} class{selectedClasses.length !== 1 ? "es" : ""} selected
        </p>
      )}
    </div>
  );
}