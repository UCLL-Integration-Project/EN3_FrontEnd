/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "440px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        // Primary — #2A6F30 green (60%)
        brand: {
          50: "#ebf6ec",
          100: "#cfe8d2",
          200: "#9bd0a0",
          300: "#6cba74",
          400: "#4aa055",
          500: "#2a6f30",
          600: "#245a28",
          700: "#1d4a22",
          800: "#16391b",
          900: "#102814",
        },
        // Secondary — #D97C12 orange (30%)
        secondary: {
          50: "#fdf3e6",
          100: "#fbe2c2",
          200: "#f6c485",
          300: "#eea554",
          400: "#e69032",
          500: "#d97c12",
          600: "#b86310",
          700: "#92500e",
          800: "#6d3c0b",
          900: "#4a2807",
        },
        // Accent — #087F8C teal (10%) — links, micro-interactions
        accent: {
          50: "#e0f0f2",
          100: "#bcdfe3",
          200: "#86c4cc",
          300: "#4ea7b3",
          400: "#208e9a",
          500: "#087f8c",
          600: "#066b77",
          700: "#055661",
          800: "#04434b",
          900: "#022d33",
        },
        ink: {
          900: "#0b1220",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
      },
      fontFamily: {
        // UI / body — system stack (mobile-native feel)
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Display — Georgia serif for h1–h3
        display: [
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
      },
      borderRadius: {
        app: "1.75rem",
        sheet: "1.5rem",
        pill: "999px",
      },
      boxShadow: {
        app: "0 30px 60px -20px rgba(15, 23, 42, 0.45), 0 12px 24px -10px rgba(15, 23, 42, 0.25)",
        card: "0 10px 30px -12px rgba(15, 23, 42, 0.18)",
        pop: "0 12px 28px -10px rgba(42, 111, 48, 0.45)",
      },
      spacing: {
        "safe-t": "env(safe-area-inset-top)",
        "safe-b": "env(safe-area-inset-bottom)",
        "safe-l": "env(safe-area-inset-left)",
        "safe-r": "env(safe-area-inset-right)",
        "tap": "44px",
        "app-bar": "56px",
        "app-tab": "64px",
        "field": "48px",
      },
      maxWidth: {
        app: "440px",
      },
      minHeight: {
        tap: "44px",
        svh: "100svh",
      },
      height: {
        svh: "100svh",
        dvh: "100dvh",
      },
      keyframes: {
        "rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-in": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "wave": {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(-8px) translateY(-4px)" },
        },
      },
      animation: {
        rise: "rise 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "sheet-in": "sheet-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "sheet-up": "sheet-up 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "fade-in": "fade-in 200ms ease-out both",
        wave: "wave 8s ease-in-out infinite",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #2a6f30 0%, #245a28 60%, #1d4a22 100%)",
        "brand-soft":
          "linear-gradient(180deg, #ebf6ec 0%, #ffffff 55%, #ffffff 100%)",
        "ink-gradient":
          "radial-gradient(120% 80% at 50% 0%, #1f2937 0%, #0b1220 60%)",
      },
    },
  },
  plugins: [],
};
