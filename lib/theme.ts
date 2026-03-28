// ── Brand color tokens ─────────────────────────────────────────────────────
// Change these values to retheme the entire app.
export const COLORS = {
  // Backgrounds
  bg:          "#f6f3e7", // cream — main light background
  bgAlt:       "#ede9d8", // slightly deeper cream — alternating sections
  bgDark:      "#29241f", // dark brown — dark sections
  bgCard:      "#fdfbf3", // near-white card surface
  bgCardDark:  "#342e28", // card surface on dark sections

  // Primary palette
  primary:      "#a27246", // warm brown
  primaryLight: "#c49268", // lighter brown
  primaryDark:  "#7d5432", // deeper brown
  primaryFaint: "rgba(162,114,70,0.12)",

  // Accent
  accent:      "#d4956a", // warm terracotta
  accentLight: "#e8b592",

  // Text
  text:             "#29241f", // dark brown
  textMuted:        "#6b5c4c", // medium brown
  textLight:        "#9a8570", // light brown
  textOnDark:       "#f6f3e7", // cream on dark
  textMutedOnDark:  "#c4b49e",

  // Borders / dividers
  border:     "#d4c4a8",
  borderDark: "#4a3f34",
} as const;

export const FONTS = {
  display: "'Nunito', sans-serif",
  body:    "'Nunito', sans-serif",
  hand:    "'Caveat', cursive",
} as const;
