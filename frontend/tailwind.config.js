/** Tailwind CSS configuration for the enterprise UI theme */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#F5F5F5",
        surface: "#FFFFFF",
        border: "#D7DEE6",
        ink: "#0F1C2B",
        muted: "#50595F",
        primary: {
          DEFAULT: "#0066CC",
          hover: "#004E9E",
          light: "#EAF4FF",
        },
        sidebar: {
          DEFAULT: "#0E1927",
          text: "#AAB5C2",
          active: "#FFFFFF",
          hover: "#18263A",
        },
        success: { DEFAULT: "#12B76A", light: "#ECFDF3" },
        warning: { DEFAULT: "#F79009", light: "#FFFAEB" },
        danger: { DEFAULT: "#D92D20", light: "#FEF3F2" },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 18px rgba(15, 28, 43, 0.08)",
      },
    },
  },
  plugins: [],
};
