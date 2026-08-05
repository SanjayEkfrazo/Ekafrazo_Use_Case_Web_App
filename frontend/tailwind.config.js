/** Tailwind CSS configuration for the enterprise UI theme */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#F6F7F9",
        surface: "#FFFFFF",
        border: "#E4E7EC",
        ink: "#101828",
        muted: "#667085",
        primary: {
          DEFAULT: "#4338CA",
          hover: "#372FA0",
          light: "#EEF2FF",
        },
        sidebar: {
          DEFAULT: "#101828",
          text: "#94A3B8",
          active: "#FFFFFF",
          hover: "#1D2939",
        },
        success: { DEFAULT: "#12B76A", light: "#ECFDF3" },
        warning: { DEFAULT: "#F79009", light: "#FFFAEB" },
        danger: { DEFAULT: "#D92D20", light: "#FEF3F2" },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
};
