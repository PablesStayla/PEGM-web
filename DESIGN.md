---
version: 1.0.0
name: PranaKaia Design Tokens
status: Active
last_updated: 2026-05-20
owner: Brand Experience & UI Engineering
tags: [design-system, tokens, stitch, tailwind, aesthetics]
tokens:
  colors:
    primitives:
      white: "#FFFFFF"
      black: "#000000"
      neutral:
        50: "#f8fafc"
        100: "#f1f5f9"
        200: "#e2e8f0"
        300: "#cbd5e1"
        400: "#94a3b8"
        500: "#64748b"
        600: "#475569"
        700: "#334155"
        800: "#1e293b"
        900: "#0f172a"
        950: "#020617"
    brand:
      mesh-forest:
        DEFAULT: "#0D1F1D"
        light: "#1A3C38"
        dark: "#050D0C"
      prana-gold:
        DEFAULT: "#E2C17D"
        soft: "#F3E5AB"
        metallic: "#D4AF37"
      prana-green:
        DEFAULT: "#2D5A27"
        vibrant: "#4ade80"
        muted: "#3A6351"
      prana-dark-green:
        DEFAULT: "#050D0C"
        obsidian: "#020606"
      prana-emerald:
        DEFAULT: "#10B981"
        glow: "#34D399"
    semantic:
      light:
        background: "hsl(0 0% 98%)"
        foreground: "hsl(0 0% 10%)"
        card: "hsl(0 0% 100%)"
        card-foreground: "hsl(0 0% 10%)"
        popover: "hsl(0 0% 100%)"
        popover-foreground: "hsl(0 0% 10%)"
        primary: "hsl(174 81% 40%)" # Luxury Teal/Glow: #14b8a6
        primary-foreground: "hsl(0 0% 100%)"
        secondary: "hsl(0 0% 92%)"
        secondary-foreground: "hsl(0 0% 10%)"
        muted: "hsl(0 0% 92%)"
        muted-foreground: "hsl(0 0% 45%)"
        accent: "hsl(174 81% 40%)"
        accent-foreground: "hsl(0 0% 100%)"
        destructive: "hsl(0 84% 60%)"
        destructive-foreground: "hsl(0 0% 98%)"
        border: "hsl(0 0% 92%)"
        input: "hsl(0 0% 92%)"
        ring: "hsl(174 81% 40%)"
      dark:
        background: "hsl(0 0% 2%)" # Deep Forest Obsidian Black
        foreground: "hsl(0 0% 96%)"
        card: "hsl(0 0% 4%)"
        card-foreground: "hsl(0 0% 96%)"
        popover: "hsl(0 0% 4%)"
        popover-foreground: "hsl(0 0% 96%)"
        primary: "hsl(174 81% 40%)"
        primary-foreground: "hsl(0 0% 2%)"
        secondary: "hsl(0 0% 10%)"
        secondary-foreground: "hsl(0 0% 96%)"
        muted: "hsl(0 0% 10%)"
        muted-foreground: "hsl(0 0% 64%)"
        accent: "hsl(174 81% 40%)"
        accent-foreground: "hsl(0 0% 2%)"
        destructive: "hsl(0 84% 60%)"
        destructive-foreground: "hsl(0 0% 98%)"
        border: "hsl(0 0% 10%)"
        input: "hsl(0 0% 10%)"
        ring: "hsl(174 81% 40%)"
  typography:
    families:
      sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
      display: "Outfit, Inter, sans-serif"
      mono: "Fira Code, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    sizes:
      xs: "0.75rem" # 12px
      sm: "0.875rem" # 14px
      base: "1rem" # 16px
      lg: "1.125rem" # 18px
      xl: "1.25rem" # 20px
      xxl: "1.5rem" # 24px
      xxxl: "1.875rem" # 30px
      display-sm: "2.25rem" # 36px
      display-md: "3rem" # 48px
      display-lg: "3.75rem" # 60px
    weights:
      light: 300
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
      black: 900
    line-heights:
      none: 1
      tight: 1.15
      snug: 1.3
      normal: 1.5
      relaxed: 1.625
      loose: 2
  spacing:
    none: "0px"
    4xs: "0.125rem" # 2px
    3xs: "0.25rem" # 4px
    xxs: "0.375rem" # 6px
    xs: "0.5rem" # 8px
    sm: "0.75rem" # 12px
    md: "1rem" # 16px
    lg: "1.25rem" # 20px
    xl: "1.5rem" # 24px
    xxl: "2rem" # 32px
    3xl: "2.5rem" # 40px
    4xl: "3rem" # 48px
    5xl: "4rem" # 64px
    6xl: "6rem" # 96px
  rounded:
    none: "0px"
    sm: "calc(var(--radius) - 4px)" # calc(16px - 4px) = 12px
    md: "calc(var(--radius) - 2px)" # calc(16px - 2px) = 14px
    lg: "var(--radius)" # 1rem = 16px
    xl: "1.5rem" # 24px
    full: "9999px"
  shadows:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    luxury-admin: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    glow-gold: "0 0 15px rgba(20, 184, 166, 0.1)"
  motion:
    transitions:
      fast: "150ms cubic-bezier(0.16, 1, 0.3, 1)"
      normal: "300ms cubic-bezier(0.16, 1, 0.3, 1)"
      slow: "500ms cubic-bezier(0.16, 1, 0.3, 1)"
      smooth-elastic: "400ms cubic-bezier(0.16, 1, 0.3, 1)"
    animations:
      float: "float 6s ease-in-out infinite"
      accordion-down: "accordion-down 0.2s ease-out"
      accordion-up: "accordion-up 0.2s ease-out"
---

# PranaKaia Design System (`DESIGN.md`)

> **SOTA Premium Visual System Spec for AI-Driven Component Assembly (Stitch)**
> 
> *Version 1.0.0 | Built for enterprise scale, Dropshipping excellence, and ultimate visual prestige.*

---

## 🎨 Visual Philosophy & Brand Identity

PranaKaia represents the synthesis of **zen harmony** and **cutting-edge luxury**. The interface is designed to feel alive, responsive, premium, and extremely reliable.

1. **Rich & Harmonious Contrast:** Dark Obsidian backgrounds (`{tokens.colors.semantic.dark.background}`) combined with high-contrast, premium accents like Luxury Teal (`{tokens.colors.semantic.dark.primary}`) and Prana Gold (`{tokens.colors.brand.prana-gold.DEFAULT}`).
2. **Dynamic Depth (Glassmorphism):** Elements leverage background-blur filters (`24px`), ultra-fine translucent borders (`rgba(255, 255, 255, 0.05)`), and dark multi-layered shadows to give an organic feeling of depth.
3. **Organic Movement:** Micro-animations like floating elements (`float 6s ease-in-out`), smooth interactive scaling transitions, and delicate text glows make components feel tactile and engaging.
4. **Absolute Consistency:** Placing this `DESIGN.md` in the workspace root ensures Stitch and other AI compilers strictly respect brand tokens, spacing intervals, and typography boundaries without resorting to generic colors or default shapes.

---

## 📐 Layout Boundaries & Grid System

When Stitch compiles components, it must comply with these exact responsive constraints:

| Breakpoint | Minimum Width | Grid Columns | Max-Width Container | Padding |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `320px` | 4 columns | `100%` | `{tokens.spacing.sm}` (`12px`) |
| **Tablet** | `768px` | 8 columns | `720px` | `{tokens.spacing.md}` (`16px`) |
| **Desktop** | `1024px` | 12 columns | `960px` | `{tokens.spacing.xl}` (`24px`) |
| **Widescreen** | `1280px` | 12 columns | `1200px` | `{tokens.spacing.xxl}` (`32px`) |
| **Ultra-Wide** | `1536px` | 12 columns | `1400px` | `{tokens.spacing.xxl}` (`32px`) |

### Flex & Grid Layout Rules
- **Grid Gap Standard:** Always use `{tokens.spacing.md}` (`16px`) or `{tokens.spacing.lg}` (`20px`) for grid layouts. Never use ad-hoc pixel values.
- **Section Spacing:** Separate major sections with `{tokens.spacing.xxl}` (`32px`) or `{tokens.spacing.3xl}` (`40px`).

---

## ⚡ Stitch-Compatible Style Utilities

AI models and compilers utilizing this spec should apply Tailwind utility equivalents or inline CSS matching these key premium visual effects:

### 1. Luxury Glassmorphism Container (`.glass-morphism-admin`)
Used for dashboards, modals, overlays, and key interface cards.
```css
.glass-morphism-admin {
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius); /* {tokens.rounded.lg} */
}
```

### 2. Luxury Dynamic Card (`.luxury-card-admin`)
Used for product grids, summary metrics, and vendor onboarding cards.
```css
.luxury-card-admin {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(8, 8, 8, 0.95));
  border: 1px solid rgba(20, 184, 166, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* {tokens.shadows.luxury-admin} */
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.luxury-card-admin:hover {
  border-color: rgba(20, 184, 166, 0.4);
  box-shadow: 
    0 35px 60px -15px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(20, 184, 166, 0.08); /* {tokens.shadows.glow-gold} */
  transform: translateY(-2px);
}
```

### 3. Tactile Texture Overlay (`.bg-noise`)
Used selectively in hero banners or large backgrounds to remove visual flatness.
```css
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3e%3cfilter id='noiseFilter'%3e%3cfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3e%3c/filter%3e%3crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3e%3c/svg%3e");
}
```

### 4. Interactive Accents & Glows (`.text-glow-gold`, `.border-glow-gold`)
Subtle highlights that draw attention to active components or CTAs.
```css
.text-glow-gold {
  text-shadow: 0 0 15px rgba(20, 184, 166, 0.3);
}
.border-glow-gold {
  box-shadow: 0 0 15px rgba(20, 184, 166, 0.1);
}
```

---

## 💅 Component-Specific Guidelines

### 1. Buttons (CTAs)
- **Primary:** Filled with `{tokens.colors.semantic.dark.primary}` (teal `#14b8a6`), text is `{tokens.colors.semantic.dark.primary-foreground}`. Smooth scaling hover effect (`scale(1.02)`), active state presses (`scale(0.98)`).
- **Secondary:** Outlined or subtle background `{tokens.colors.semantic.dark.secondary}`. Fine border.
- **Micro-interactions:** Hover transitions must be exactly `{tokens.motion.transitions.normal}`.

### 2. Form Inputs
- **Default State:** Background `{tokens.colors.semantic.dark.input}`, border `{tokens.colors.semantic.dark.border}`, border-radius `{tokens.rounded.md}` (14px).
- **Focus State:** Border shifts to primary teal with a glowing shadow: `box-shadow: 0 0 0 2px hsl(174 81% 40% / 20%)`. Outline is hidden.
- **Error State:** Border becomes destructive red (`{tokens.colors.semantic.dark.destructive}`).

### 3. Typography Hierarchy
All stitched views must strictly use:
- **`<h1>`**: Display font `{tokens.typography.families.display}`, size `{tokens.typography.sizes.display-sm}` (mobile) / `{tokens.typography.sizes.display-md}` (desktop), weight `{tokens.typography.weights.bold}`, line-height `{tokens.typography.line-heights.tight}`.
- **`<h2>`**: Sans/Display font, size `{tokens.typography.sizes.xxl}`, weight `{tokens.typography.weights.semibold}`.
- **`<h3>`**: Sans font, size `{tokens.typography.sizes.xl}`, weight `{tokens.typography.weights.medium}`.
- **Body (`<p>`)**: Sans font, size `{tokens.typography.sizes.base}`, weight `{tokens.typography.weights.regular}`, line-height `{tokens.typography.line-heights.relaxed}`, color `{tokens.colors.semantic.dark.foreground}`.

---

## 🦾 Stitch Integration Guide

### How Stitch Compiles from this File:
1. **Parser Execution:** The Stitch compiler parses the YAML frontmatter.
2. **Variable Injection:** Every instance of `{tokens.path.to.value}` in the CSS, components, or markdown blocks is compiled to its respective raw value.
3. **Tailwind Config Generation:** Running `pnpm build:tokens` (Coming Soon) will automatically synchronize this file into `packages/ui/tailwind.config.ts`.
4. **Figma Syncing:** Running `/figma sync` pulls modifications made to this file back to Figma’s design variables.

> [!IMPORTANT]
> Always verify that your components use exact HSL or hex codes derived from this design specification. Never add custom color declarations, hand-coded borders, or unstandardized margins.
