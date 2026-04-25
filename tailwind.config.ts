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
        background: "#FFFFFF",
        surface: "#F5F5F7",
        border: "#E5E5EA",
        foreground: "#1D1D1F",
        muted: "#6E6E73",
        accent: {
          DEFAULT: "#1B4332",
          hover: "#2D6A4F",
        },
        danger: "#FF3B30",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        modal: "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
