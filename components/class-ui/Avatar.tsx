export default function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  // Am corectat n pentru a extrage doar prima literă a fiecărui nume
  const initials = name
    .split(" ")
    .map((n) => n)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Folosim variabilele tale globale.
  // Pentru gradient, pornim de la culoarea solidă și mergem spre o versiune ușor transparentă (0.7)
  const colors = [
    "from-[rgb(var(--primary))] to-[rgba(var(--primary),0.7)]",
    "from-[rgb(var(--accent))] to-[rgba(var(--accent),0.7)]",
    "from-[rgb(var(--success-text))] to-[rgba(var(--success-text),0.7)]",
    "from-[rgb(var(--warning-text))] to-[rgba(var(--warning-text),0.7)]",
    "from-[rgb(var(--error-text))] to-[rgba(var(--error-text),0.7)]",
  ];

  const color = colors[initials.charCodeAt(0) % colors.length];
  const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  
  return (
    <div 
      className={`${cls} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}
    >
      {initials}
    </div>
  );
}