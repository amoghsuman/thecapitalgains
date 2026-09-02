import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Everything is Inter. The `mono` utility is intentionally mapped to
        // Inter too so `font-mono` classes across the app render Inter, not a
        // system monospace fallback.
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // "Ivory Ledger" palette — the single source of truth for brand
        // color. Every color in the app should trace back to one of these
        // seven tokens (or a documented tint of one) rather than a
        // hardcoded hex value.
        ivory: "#F7F4EC",
        panel: "#FFFFFF",
        forest: {
          DEFAULT: "#1B3A2B",
          dark: "#173224",   // ~15% toward black — hover/active states
          tint: "#98A6A0",   // ~55% toward white — light differentiator (e.g. PathNavigator step 3)
          surface: "#EDEFEE", // ~8% toward white — pale badge/card fill
        },
        gold: {
          DEFAULT: "#A9822F",
          dark: "#8A6825",   // ~20% toward black — hover states
          text: "#6E5620",   // ~25% toward black — body text on light-gold fills (AA contrast)
          surface: "#F6F3EA", // ~10% toward white — pale badge/card fill
        },
        ink: {
          DEFAULT: "#1A1A18",
          dim: "#6E6A5F",
        },
        hairline: "#DFD9C8",
      },
    },
  },
  plugins: [],
};
export default config;
