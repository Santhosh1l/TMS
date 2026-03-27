/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#12121a",
          800: "#1c1c28",
          700: "#26263a",
          600: "#32324a",
        },
        slate: {
          dim: "#8888aa",
          muted: "#6666880",
        },
        brand: {
          DEFAULT: "#6c63ff",
          light: "#8b85ff",
          dark: "#4d44dd",
          glow: "rgba(108,99,255,0.25)",
        },
        accent: {
          teal: "#00d4aa",
          amber: "#ffb347",
          rose: "#ff6b8a",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108,99,255,0.3)",
        "glow-sm": "0 0 10px rgba(108,99,255,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 10px rgba(108,99,255,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(108,99,255,0.5)" },
        },
      },
    },
  },
  plugins: [],
};
