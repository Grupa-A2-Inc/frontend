import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
    brand: {
      bg: "rgba(var(--bg), <alpha-value>)",
      mid: "rgba(var(--bg-mid), <alpha-value>)",
      card: "rgba(var(--bg-card), <alpha-value>)",
      primary: "rgba(var(--primary), <alpha-value>)",
      accent: "rgba(var(--accent), <alpha-value>)",
      text: "rgba(var(--text-primary), <alpha-value>)",
      muted: "rgba(var(--text-secondary), <alpha-value>)",
      border: "rgba(var(--border), <alpha-value>)",
    },
  },
      fontFamily: {
        display: ["Nunito", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;