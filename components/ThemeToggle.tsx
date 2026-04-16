"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition font-semiboldbold"
    >
      {theme === "dark" ? "🌞 Switch Theme" : "🌙 Switch Theme"}
    </button>
  );
}