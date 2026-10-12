import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: "#FFF8F1",
        ink: "#1B1B1F",
        muted: "#5C5A57",
        card: "#F3E9DF",
        card2: "#FFFFFF",
        line: "#E3D6C8",
        amber: {
          300: "#9A5A00",
          400: "#B86A00",
          500: "#F29E0F",
          600: "#D97F0B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
