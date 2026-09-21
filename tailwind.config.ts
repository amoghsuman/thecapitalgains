import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F8F6F0",
          light: "#FAF9F5",
          dark: "#F0ECE1",
        },
        panel: "#FFFFFF",
        olive: {
          DEFAULT: "#1A281E",
          dark: "#121D15",
          light: "#2E4233",
          muted: "#4E6050",
          surface: "#EEF3EC",
          tint: "#6B7D68",
        },
        forest: {
          DEFAULT: "#1B3A2B",
          dark: "#132B20",
          light: "#28523E",
          tint: "#889B92",
          surface: "#EAF0EC",
        },
        gold: {
          DEFAULT: "#9B7728",
          dark: "#7D5E1B",
          text: "#7D5E1B",
          surface: "#F8F4EA",
          light: "#BA984A",
        },
        ink: {
          DEFAULT: "#171815",
          dim: "#484B44",
          muted: "#73766D",
        },
        hairline: "#E3DDD2",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-course-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-course-serif)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-course-mono)", "DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
