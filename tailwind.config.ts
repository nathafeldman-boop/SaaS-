import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#effef4",
          100: "#d9fbe5",
          200: "#b5f5cc",
          300: "#7ceba8",
          400: "#3cd87c",
          500: "#14bf5b",
          600: "#099e48",
          700: "#0a7c3c",
          800: "#0d6233",
          900: "#0c512c",
          950: "#032d16",
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
