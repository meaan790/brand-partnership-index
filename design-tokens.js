// Brand Partnership Index — Design System Tokens
// Single source of truth for Tailwind config. Loaded by every page.
// Reference: DESIGN.md (Stitch prompts) + visual design system spec.

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Core palette ──
        "primary":           "#0F1B2E",   // deep navy — headlines, nav, buttons
        "on-primary":        "#ffffff",
        "primary-container": "#0F1B2E",
        "on-primary-container": "#78849c",

        "accent":            "#D4A24C",   // warm amber — CTAs, badges, highlights
        "on-accent":         "#1a1200",
        "accent-muted":      "#D4A24C26", // 15% opacity for subtle backgrounds

        "secondary":         "#7e5700",
        "on-secondary":      "#ffffff",
        "secondary-container": "#ffc96f",
        "on-secondary-container": "#785300",

        "tertiary":          "#281702",   // dark warm brown
        "on-tertiary":       "#ffffff",
        "tertiary-container": "#291802",
        "on-tertiary-container": "#9b7f5f",

        // ── Surfaces ──
        "background":        "#fbf8fa",
        "background-paper":  "#FAFAF7",
        "on-background":     "#1b1b1d",
        "surface":           "#fbf8fa",
        "surface-bright":    "#fbf8fa",
        "surface-dim":       "#dcd9db",
        "surface-card":      "#FFFFFF",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#f5f3f5",
        "surface-container":         "#f0edef",
        "surface-container-high":    "#eae7e9",
        "surface-container-highest": "#e4e2e4",
        "surface-variant":   "#e4e2e4",
        "surface-tint":      "#535f75",
        "on-surface":        "#1b1b1d",
        "on-surface-variant": "#45474c",
        "inverse-surface":   "#303032",
        "inverse-on-surface": "#f3f0f2",
        "inverse-primary":   "#bbc7e0",

        // ── Text ──
        "text-main":    "#181A1F",
        "text-caption": "#6E7480",

        // ── Borders ──
        "border-hairline": "#E4E2DA",
        "outline":         "#75777d",
        "outline-variant": "#c5c6cd",

        // ── Score tiers (3-tier: high / mid / low) ──
        "score-high": "#3F7556",
        "score-mid":  "#C8A53D",
        "score-low":  "#A24E3C",

        // ── Functional ──
        "error":              "#ba1a1a",
        "on-error":           "#ffffff",
        "error-container":    "#ffdad6",
        "on-error-container": "#93000a",
        "link-endvr":         "#7C4DFF",

        // ── Fixed tones (Material 3 compat) ──
        "primary-fixed":     "#d7e3fd",
        "primary-fixed-dim": "#bbc7e0",
        "on-primary-fixed":  "#101c2f",
        "on-primary-fixed-variant": "#3c475c",
        "secondary-fixed":     "#ffdeac",
        "secondary-fixed-dim": "#f3be65",
        "on-secondary-fixed":  "#281900",
        "on-secondary-fixed-variant": "#604100",
        "tertiary-fixed":     "#ffddb8",
        "tertiary-fixed-dim": "#e2c19d",
        "on-tertiary-fixed":  "#291802",
        "on-tertiary-fixed-variant": "#594327"
      },

      // ── Border radius ──
      borderRadius: {
        "sm":      "0.125rem",
        "DEFAULT": "0.375rem",
        "md":      "0.5rem",
        "lg":      "0.75rem",
        "xl":      "1rem",
        "2xl":     "1.25rem",
        "full":    "9999px"
      },

      // ── Spacing tokens ──
      spacing: {
        "unit":           "4px",
        "gutter":         "24px",
        "margin-mobile":  "16px",
        "margin-desktop": "40px",
        "section-gap":    "80px",
        "card-padding":   "24px"
      },

      // ── Typography – font families ──
      fontFamily: {
        "serif":       ["'Source Serif 4'", "Georgia", "serif"],
        "sans":        ["'Inter'", "system-ui", "sans-serif"],
        "display-lg":  ["'Source Serif 4'", "Georgia", "serif"],
        "headline-lg": ["'Source Serif 4'", "Georgia", "serif"],
        "headline-md": ["'Source Serif 4'", "Georgia", "serif"],
        "headline-sm": ["'Source Serif 4'", "Georgia", "serif"],
        "body-lg":     ["'Inter'", "system-ui", "sans-serif"],
        "body-md":     ["'Inter'", "system-ui", "sans-serif"],
        "data-tabular": ["'Inter'", "system-ui", "sans-serif"],
        "caption":     ["'Inter'", "system-ui", "sans-serif"],
        "label-caps":  ["'Inter'", "system-ui", "sans-serif"]
      },

      // ── Typography – sizes ──
      fontSize: {
        "display-lg":  ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg":     ["18px", { lineHeight: "1.7", fontWeight: "400" }],
        "body-md":     ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "data-tabular": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
        "caption":     ["13px", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "400" }],
        "label-caps":  ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }]
      },

      // ── Box shadow ──
      boxShadow: {
        "card-hover": "0 2px 12px rgba(15, 27, 46, 0.08)",
        "nav":        "0 1px 3px rgba(15, 27, 46, 0.06)"
      }
    }
  }
};
