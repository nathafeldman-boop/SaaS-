import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette de marque PrediStart : bleu néon (issu du logo).
        pitch: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#57a8ff",
          500: "#2b8cff",
          600: "#166fe6",
          700: "#1358bb",
          800: "#164a94",
          900: "#173f74",
          950: "#0b1f3f",
        },
        night: {
          50: "#f4f6fb",
          100: "#e8ecf6",
          200: "#ccd6eb",
          300: "#9fb2d9",
          400: "#6b89c2",
          500: "#486aac",
          600: "#365290",
          700: "#2d4275",
          800: "#293a62",
          900: "#131b33",
          950: "#0a0f1f",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
