import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f7fb",
          100: "#e7edf6",
          200: "#c9d7e9",
          300: "#9fb5d3",
          400: "#6d8cb7",
          500: "#4a6c9d",
          600: "#395682",
          700: "#2f466a",
          800: "#1f2e46",
          900: "#131c2b",
          950: "#0a101a",
        },
        brand: {
          50: "#ecfdff",
          100: "#cff8fe",
          200: "#a5effc",
          300: "#67e1f9",
          400: "#22c9ee",
          500: "#06a9d4",
          600: "#0787b2",
          700: "#0d6b90",
          800: "#145775",
          900: "#154863",
          950: "#072f44",
        },
        accent: {
          400: "#ffc34d",
          500: "#ffae1a",
          600: "#e89100",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { content: "72rem" },
      borderRadius: { "4xl": "2rem" },
      boxShadow: {
        glow: "0 0 0 1px rgb(6 169 212 / 0.25), 0 18px 50px -18px rgb(6 169 212 / 0.45)",
        lift: "0 24px 60px -24px rgb(10 16 26 / 0.55)",
        card: "0 1px 2px rgb(10 16 26 / 0.06), 0 12px 32px -16px rgb(10 16 26 / 0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 18px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(26px,-18px,0) scale(1.06)" },
          "66%": { transform: "translate3d(-18px,14px,0) scale(0.96)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.55", transform: "scale(0.9)" },
          "70%": { opacity: "0", transform: "scale(1.35)" },
          "100%": { opacity: "0", transform: "scale(1.35)" },
        },
        "sheen": {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(220%) skewX(-18deg)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleY(0.08)" },
          "100%": { transform: "scaleY(1)" },
        },
        "dash": { "0%": { strokeDashoffset: "480" }, "100%": { strokeDashoffset: "0" } },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        "scale-in": "scale-in 0.6s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 7s ease-in-out infinite",
        drift: "drift 22s ease-in-out infinite",
        "gradient-pan": "gradient-pan 9s ease infinite",
        marquee: "marquee 38s linear infinite",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.24,0,0.38,1) infinite",
        sheen: "sheen 2.8s ease-in-out infinite",
        "bar-grow": "bar-grow 1.1s cubic-bezier(0.16,1,0.3,1) both",
        dash: "dash 2.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
