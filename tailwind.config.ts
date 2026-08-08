import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F2A2E",
        teal: {
          50: "#EEF6F5",
          100: "#D7E9E6",
          200: "#B0D3CE",
          300: "#82B7B0",
          400: "#4F9089",
          500: "#2E6E67",
          600: "#1F544F",
          700: "#173F3C",
          800: "#102B29",
          900: "#0B1F1D",
        },
        coral: {
          50: "#FFF1EC",
          100: "#FFDFD3",
          200: "#FFBBA3",
          300: "#FF9270",
          400: "#F86F49",
          500: "#E85A34",
          600: "#C64624",
          700: "#9E3620",
        },
        sand: {
          50: "#FBF8F3",
          100: "#F5EFE4",
          200: "#EDE3D0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,42,46,0.04), 0 8px 24px -8px rgba(15,42,46,0.12)",
        soft: "0 1px 3px rgba(15,42,46,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
