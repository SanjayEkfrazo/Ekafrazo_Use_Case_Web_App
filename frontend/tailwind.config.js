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
        "surface-overlay": withOpacity("--color-surface-overlay"),
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
        secondary: {
          DEFAULT: withOpacity("--color-secondary"),
          hover: withOpacity("--color-secondary-hover"),
          light: withOpacity("--color-secondary-subtle"),
          text: withOpacity("--color-secondary-text"),
        },
        neutral: {
          50: withOpacity("--color-neutral-50"),
          100: withOpacity("--color-neutral-100"),
          200: withOpacity("--color-neutral-200"),
          300: withOpacity("--color-neutral-300"),
          400: withOpacity("--color-neutral-400"),
          500: withOpacity("--color-neutral-500"),
          600: withOpacity("--color-neutral-600"),
          700: withOpacity("--color-neutral-700"),
          800: withOpacity("--color-neutral-800"),
          900: withOpacity("--color-neutral-900"),
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
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.3125rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.625rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      spacing: {
        4.5: "1.125rem",
        18: "4.5rem",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        "elevation-1": "var(--shadow-elevation-1)",
        "elevation-2": "var(--shadow-elevation-2)",
        "elevation-3": "var(--shadow-elevation-3)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-brand": "var(--shadow-glow-brand)",
      },
      transitionDuration: {
        120: "120ms",
        180: "180ms",
        240: "240ms",
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
