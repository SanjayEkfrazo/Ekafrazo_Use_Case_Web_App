function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** Tailwind CSS configuration for the enterprise UI theme */
export default {
  darkMode: ["selector", "[data-theme=\"dark\"]"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: withOpacity("--color-app"),
        surface: withOpacity("--color-surface"),
        "surface-elevated": withOpacity("--color-surface-elevated"),
        border: withOpacity("--color-border"),
        "border-strong": withOpacity("--color-border-strong"),
        ink: withOpacity("--color-ink"),
        muted: withOpacity("--color-muted"),
        "muted-dim": withOpacity("--color-muted-dim"),
        overlay: withOpacity("--color-overlay"),
        on: {
          solid: withOpacity("--color-on-solid"),
        },
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          hover: withOpacity("--color-primary-hover"),
          light: withOpacity("--color-primary-subtle"),
          text: withOpacity("--color-primary-text"),
        },
        brand: {
          from: withOpacity("--color-gradient-from"),
          via: withOpacity("--color-gradient-via"),
          to: withOpacity("--color-gradient-to"),
        },
        sidebar: {
          DEFAULT: withOpacity("--color-sidebar-bg"),
          text: withOpacity("--color-sidebar-text"),
          hover: withOpacity("--color-sidebar-hover"),
          active: withOpacity("--color-sidebar-active-text"),
          "active-bg": withOpacity("--color-sidebar-active-bg"),
        },
        success: {
          DEFAULT: withOpacity("--color-success"),
          light: withOpacity("--color-success-subtle"),
          text: withOpacity("--color-success-text"),
        },
        warning: {
          DEFAULT: withOpacity("--color-warning"),
          light: withOpacity("--color-warning-subtle"),
          text: withOpacity("--color-warning-text"),
        },
        danger: {
          DEFAULT: withOpacity("--color-danger"),
          light: withOpacity("--color-danger-subtle"),
          text: withOpacity("--color-danger-text"),
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-brand": "var(--shadow-glow-brand)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, rgb(var(--color-gradient-from)) 0%, rgb(var(--color-gradient-via)) 50%, rgb(var(--color-gradient-to)) 100%)",
        "hero-glow": "var(--hero-glow)",
      },
    },
  },
  plugins: [],
};
