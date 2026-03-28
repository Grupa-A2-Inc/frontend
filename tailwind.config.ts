import type { Config } from "tailwindcss";

// ── Brand tokens — change here to retheme the entire app ──────────────────
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary warm brown (slightly darker)
        brand: {
          DEFAULT: "#8f6038",
          light:   "#a87a50",
          dark:    "#6b4428",
        },
        // Cream backgrounds (slightly darker)
        cream: {
          DEFAULT: "#eeead8",
          alt:     "#e5dfc9",
          card:    "#f5f1e6",
        },
        // Dark brown
        cocoa: {
          DEFAULT: "#211d18",
          card:    "#2c2620",
          border:  "#40352a",
        },
        // Terracotta accent
        terra: {
          DEFAULT: "#c4845a",
          light:   "#d9a07a",
        },
        // Text shades
        muted:        "#5e4f40",
        subtle:       "#8a7460",
        "on-dark":    "#eeead8",
        "muted-dark": "#b8a58e",
        // Border
        "warm-border": "#c8b898",
      },
      fontFamily: {
        display: ["'Nunito'", "sans-serif"],
        hand:    ["'Caveat'",  "cursive"],
        body:    ["'Nunito'",  "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s ease forwards",
        "float":      "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
