import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        accent: "#F5A623",
        "accent-dark": "#D4891A",
        "accent-light": "#F7B84E",
        "gold-border": "rgba(245, 166, 35, 0.25)",
        "gold-border-hover": "rgba(245, 166, 35, 0.6)",
        "surface": "#111111",
        "surface-2": "#1A1A1A",
        "muted": "rgba(255,255,255,0.5)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "typing": "typing 0.05s steps(1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 166, 35, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(245, 166, 35, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5A623 0%, #F7B84E 50%, #D4891A 100%)",
        "dark-gradient": "linear-gradient(180deg, #080808 0%, #0f0f0f 100%)",
        "hero-gradient": "radial-gradient(ellipse at top, #1a1200 0%, #080808 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
