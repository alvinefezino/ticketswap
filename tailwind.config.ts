import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  extend: {
  colors: {
  tsTeal: "#00C2A8",
  tsTealDark: "#00A88F",
  tsBlack: "#0A0E14",
  tsGray: "#F5F7F9",
  tsBorder: "#E5E7EB",
  },
  fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  },
  borderRadius: {
  "2xl": "16px",
  "3xl": "20px",
  },
  },
  },
  plugins: [],
};
export default config;
