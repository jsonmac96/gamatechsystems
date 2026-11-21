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
      /**
       * Brand palette, taken from the supplied logo artwork.
       *
       *   brand  — GaMatech navy, #0A1A3E, sampled from the mark
       *   accent — GaMatech orange, #E7580A, the dot in the mark
       *   ink    — neutral greys tuned to sit beside the navy
       *
       * The ramps around each anchor were generated to keep contrast
       * predictable: 600+ on white and 300- on navy both clear WCAG AA.
       */
      colors: {
        ink: {
          50: "#f4f5f9",
          100: "#e7eaf1",
          200: "#ccd2e0",
          300: "#a6b0c8",
          400: "#7987a8",
          500: "#5a6b8c",
          600: "#475571",
          700: "#39445a",
          800: "#242d41",
          900: "#141b2c",
          950: "#0a1020",
        },
        brand: {
          50: "#f1f4fb",
          100: "#dfe6f5",
          200: "#c2d0ec",
          300: "#95aedd",
          400: "#6286ca",
          500: "#3f66b3",
          600: "#2f4e97",
          700: "#283f7a",
          800: "#1b2c57",
          900: "#0a1a3e",
          950: "#06112a",
        },
        accent: {
          50: "#fff5ed",
          100: "#ffe8d4",
          200: "#ffcda8",
          300: "#ffa970",
          400: "#fd7b36",
          500: "#e7580a",
          600: "#d84c07",
          700: "#b43808",
          800: "#8f2e0f",
          900: "#74290f",
          950: "#3f1105",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { content: "72rem" },
      borderRadius: { "4xl": "2rem" },
      boxShadow: {
        glow: "0 0 0 1px rgb(231 88 10 / 0.28), 0 18px 50px -18px rgb(231 88 10 / 0.45)",
        "glow-navy": "0 0 0 1px rgb(10 26 62 / 0.18), 0 18px 50px -18px rgb(10 26 62 / 0.5)",
        lift: "0 24px 60px -24px rgb(10 16 32 / 0.55)",
        card: "0 1px 2px rgb(10 16 32 / 0.06), 0 12px 32px -16px rgb(10 16 32 / 0.18)",
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
