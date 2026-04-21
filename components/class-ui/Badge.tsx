export default function Badge({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
      isActive 
        ? "bg-[rgb(var(--success-bg))] text-[rgb(var(--success-text))] border-[rgb(var(--success-border))]"
        : "bg-[rgb(var(--error-bg))] text-[rgb(var(--error-text))] border-[rgb(var(--error-border))]"
    }`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}