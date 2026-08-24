# Romer Design System Tokens (`DESIGN_TOKEN.md`)

> **Design System Strategy: The Command Interface ("Precision Operational Layer")**
> Extracted from Romer B2B SaaS UI — a dark-mode, ultra-minimal executive dashboard for business operations teams. Token system is based on Material 3 dark scheme + custom brand extensions.

---

## 1. Overview & Creative North Star

- **Concept**: *Precision Operational Layer* — a zero-distraction command interface where every element earns its place. Information density is controlled through tonal depth, not visual clutter.
- **Color Mode**: **Dark-first** (`#070708` true-black canvas). No light-mode variant in v1.
- **Surface Philosophy**: Near-zero border-radius (sharp, engineering-grade edges). Structural separation via surface brightness steps, not decorative borders.
- **Glassmorphism**: `glass-panel` used sparingly for floating overlays (`backdrop-filter: blur(20px)` on `rgba(16,17,18,0.8)`).
- **Typography Pair**: **Manrope** (tight-tracked display & hierarchy) + **Inter** (neutral legibility for body, data, labels).
- **Data Aesthetic**: Monospaced `Inter` for all numeric KPI readouts. Negative letter-spacing (`-0.05em`) on large figures.

---

## 2. Color Tokens

### 2.1 Primary Tokens — Electric Periwinkle

| Token Name | CSS Variable | Hex | Role |
|:---|:---|:---|:---|
| `primary` | `--color-primary` | `#bec2ff` | Brand accent, active nav indicators, primary text highlights |
| `on-primary` | `--color-on-primary` | `#000ba6` | Text/icons on primary background |
| `primary-container` | `--color-primary-container` | `#7a85ff` | Interactive accent containers, chart fill |
| `on-primary-container` | `--color-on-primary-container` | `#000992` | Text on primary container |
| `primary-fixed` | `--color-primary-fixed` | `#e0e0ff` | Lightest primary tint |
| `primary-fixed-dim` | `--color-primary-fixed-dim` | `#bec2ff` | Dim primary tint |
| `on-primary-fixed` | `--color-on-primary-fixed` | `#000469` | High-contrast text on primary-fixed |
| `on-primary-fixed-variant` | `--color-on-primary-fixed-variant` | `#1f2bc8` | Medium-contrast on fixed primary |
| `inverse-primary` | `--color-inverse-primary` | `#3d4ae0` | Inverted brand accent (light surfaces) |

### 2.2 Secondary Tokens — Cyan Teal

| Token Name | CSS Variable | Hex | Role |
|:---|:---|:---|:---|
| `secondary` | `--color-secondary` | `#50d8e9` | Signal status positive, live indicators, secondary accents |
| `on-secondary` | `--color-on-secondary` | `#00363c` | Text/icons on secondary |
| `secondary-container` | `--color-secondary-container` | `#00b1c2` | Active status containers |
| `on-secondary-container` | `--color-on-secondary-container` | `#003e44` | Text on secondary container |
| `secondary-fixed` | `--color-secondary-fixed` | `#92f1ff` | Lightest teal tint |
| `secondary-fixed-dim` | `--color-secondary-fixed-dim` | `#50d8e9` | Dim teal (= secondary) |
| `on-secondary-fixed` | `--color-on-secondary-fixed` | `#001f23` | High-contrast on fixed secondary |
| `on-secondary-fixed-variant` | `--color-on-secondary-fixed-variant` | `#004f57` | Medium-contrast on fixed secondary |

### 2.3 Tertiary Tokens — Warm Amber / Alert Orange

| Token Name | CSS Variable | Hex | Role |
|:---|:---|:---|:---|
| `tertiary` | `--color-tertiary` | `#ffb689` | Warning signals, pending approval indicators |
| `on-tertiary` | `--color-on-tertiary` | `#512300` | Text/icons on tertiary |
| `tertiary-container` | `--color-tertiary-container` | `#e0731d` | High-urgency alert containers |
| `on-tertiary-container` | `--color-on-tertiary-container` | `#471e00` | Text on tertiary container |
| `tertiary-fixed` | `--color-tertiary-fixed` | `#ffdbc8` | Lightest amber tint |
| `tertiary-fixed-dim` | `--color-tertiary-fixed-dim` | `#ffb689` | Dim amber (= tertiary) |
| `on-tertiary-fixed` | `--color-on-tertiary-fixed` | `#311300` | High-contrast on tertiary-fixed |
| `on-tertiary-fixed-variant` | `--color-on-tertiary-fixed-variant` | `#743500` | Medium-contrast on tertiary-fixed |

### 2.4 Surface Hierarchy (Dark Stack Architecture)

| Token Name | Hex | Depth Level & Role |
|:---|:---|:---|
| `surface` / `background` | `#131314` | Base canvas layer (Z-0) |
| `surface-dim` | `#131314` | Subdued background (= surface) |
| `surface-bright` | `#3a393a` | Brightest surface tone |
| `surface-container-lowest` | `#0e0e0f` | True-black trough, used for header chrome |
| `surface-container-low` | `#1c1b1d` | Secondary card containers |
| `surface-container` | `#201f21` | Default intermediate container |
| `surface-container-high` | `#2a2a2b` | Hover state, active row highlight |
| `surface-container-highest` | `#353436` | Topmost surface, chart tracks |
| `on-surface` / `on-background` | `#e5e2e3` | Primary readable text (warm off-white) |
| `on-surface-variant` | `#c6c5d8` | Secondary body text, descriptions, metadata |
| `inverse-surface` | `#e5e2e3` | Inverse light surface (tooltips, badges) |
| `inverse-on-surface` | `#313031` | Text on inverse surface |
| `surface-variant` | `#353436` | Chip/tag surfaces |
| `surface-tint` | `#bec2ff` | Tint overlay for elevated components |

### 2.5 Custom Brand Tokens (Romer Proprietary)

| Token Name | CSS Variable | Hex | Role |
|:---|:---|:---|:---|
| `custom-bg` | `--color-custom-bg` | `#070708` | True-black body background |
| `custom-divider` | `--color-custom-divider` | `#232426` | Standard rule & card border |
| `custom-divider-light` | `--color-custom-divider-light` | `#1B1C1E` | Subtle inner-card divider |
| `custom-card-bg` | `--color-custom-card-bg` | `#101112` | KPI card, panel backgrounds |
| `custom-sidebar` | `--color-custom-sidebar` | `#0d0e0f` | Left-side navigation background |
| `custom-panel` | `--color-custom-panel` | `#111214` | Intelligence/right panel background |
| `custom-text-muted` | `--color-custom-text-muted` | `#9A9DA3` | Placeholder text, timestamps, secondary labels |
| `custom-btn-primary` | `--color-custom-btn-primary` | `#5E6BFF` | CTA button fill (brighter than `primary`) |
| `custom-btn-text` | `--color-custom-btn-text` | `#F0F1F2` | Text on primary CTA button |

### 2.6 Outline & Semantic Tokens

| Token Name | Hex | Usage |
|:---|:---|:---|
| `outline` | `#8f8fa1` | Inactive nav icons, low-emphasis borders |
| `outline-variant` | `#454655` | Structural dividers, table rules |
| `error` | `#ffb4ab` | Error state indicators |
| `on-error` | `#690005` | Text on error |
| `error-container` | `#93000a` | Error notification card background |
| `on-error-container` | `#ffdad6` | Text on error container |

### 2.7 Signal Semantic Colors (Operational Status)

```css
/* Used directly as inline Tailwind classes in the codebase */
--color-signal-positive: #50d8e9;   /* Revenue up, sync success */
--color-signal-warning:  #ffb689;   /* Pending approval, attention */
--color-signal-accent:   #E5FD17;   /* On-track status, risk "low" */
--color-signal-active:   #22c55e;   /* System live dot */
--color-signal-critical: #ef4444;   /* Risk exposure dot */
--color-signal-brand:    #5E6BFF;   /* Brand CTA, decision queue links */
```

### 2.8 Glassmorphism & Effects

```css
/* Glass Panel Overlay */
.glass-panel {
  background: rgba(16, 17, 18, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid #1B1C1E;
}

/* Inner Top Highlight (card shimmer) */
.inner-glow {
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

/* Card Shimmer Top Edge */
.card-shimmer::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
}

/* KPI Focus Glow (input focus) */
.focus-glow:focus-within {
  border-color: #5E6BFF;
  box-shadow: 0 0 0 2px rgba(94, 107, 255, 0.2);
}
```

---

## 3. Typography Tokens

### 3.1 Font Families

| Role | Family | Fallback |
|:---|:---|:---|
| **Display & Heading** | `Manrope` | `sans-serif` |
| **Body, Labels, Data** | `Inter` | `sans-serif`, `monospace` |

### 3.2 Typographic Scale

| Token | Family | Size | Line Height | Letter Spacing | Weight | Usage |
|:---|:---|:---|:---|:---|:---|:---|
| `hero-headline` | Manrope | `76px` | `1.1` | `-0.055em` | `520` | Landing page hero ("The command dashboard...") |
| `h1` | Manrope | `48px` | `1.1` | `-0.05em` | `520` | Section hero titles, CTA headings |
| `h2` | Manrope | `32px` | `1.2` | `-0.05em` | `520` | Section headings, feature titles |
| `h3` | Manrope | `24px` | `1.2` | `-0.04em` | `520` | KPI large values, card headings |
| `h4` | Manrope | `18px` | `1.4` | `-0.02em` | `520` | Sub-section headings, sidebar labels |
| `body-lg` | Inter | `16px` | `1.6` | `0em` | `400` | Hero subtitles, descriptive prose |
| `body-md` | Inter | `14px` | `1.5` | `0em` | `400` | Default UI text, card content, nav links |
| `label-sm` | Inter | `12px` | `1.0` | `+0.02em` | `500` | Category eyebrows (uppercase), button text, badge text |
| `mono-data` | Inter | `13px` | `1.0` | `-0.01em` | `400` | Numeric KPI data, log output, telemetry values |

### 3.3 KPI Display Override

```css
/* Applied via custom class .kpi-text for large dashboard numerics */
.kpi-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 520;
  font-size: 32px;
  letter-spacing: -0.05em;
  line-height: 1.2;
}
```

---

## 4. Spacing Tokens

| Token | Value | Usage |
|:---|:---|:---|
| `xs` | `4px` | Micro gaps between inline elements (icon-to-text) |
| `sm` | `8px` | Compact item gaps, badge padding |
| `md` | `16px` | Standard padding (buttons, list items, card internal) |
| `lg` | `24px` | Card internal padding, section sub-spacing |
| `xl` | `40px` | Section bottom margin, hero padding |
| `gutter` | `20px` | Grid column gap |
| `margin-safe` | `32px` | Horizontal page gutter (left/right safe margin) |
| `section-lg` | `64px` | Top padding for major page sections |

---

## 5. Border Radius Tokens

| Token | Value | Rem | Usage |
|:---|:---|:---|:---|
| `DEFAULT` | `12px` | `0.75rem` | Default smooth rounding (cards, panels, inputs) |
| `sm` | `6px` | `0.375rem` | Micro tags, inline chips |
| `lg` | `12px` | `0.75rem` | Standard card corners |
| `xl` | `16px` | `1.0rem` | Larger containers, modals |
| `full` | `9999px` | `9999px` | Fully rounded pills |
| `button` | `12px` | `0.75rem` | CTA buttons, action buttons |
| `card` | `12px` | `0.75rem` | Data cards, panels |

> **Design Directive**: Card & container corners use smooth 12px radius (`0.75rem`) for a modern, refined operational interface.

---

## 6. Shadow, Elevation & Glassmorphism Tokens

| Token | CSS Value | Usage |
|:---|:---|:---|
| `glass-card` | `rgba(18, 19, 21, 0.65)` + `blur(16px)` + `1px solid rgba(255,255,255,0.07)` | Data cards, panels, modules |
| `glass-sidebar` | `rgba(13, 14, 15, 0.7)` + `blur(20px)` + `1px solid rgba(255,255,255,0.06)` | Fixed persistent navigation rails |
| `glass-header` | `rgba(10, 11, 12, 0.6)` + `blur(16px)` + `1px solid rgba(255,255,255,0.06)` | Top command bar |
| `glass-ai-panel` | `linear-gradient(135deg, rgba(30, 34, 60, 0.45), rgba(16, 17, 24, 0.65))` + `blur(20px)` | High-value AI recommendation widgets |
| `inner-glow` | `inset 0 1px 0 0 rgba(255,255,255,0.1)` | All `.card` surfaces — top-edge highlight |
| `shadow-glass` | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` | Floating glass depth on dark canvas |
| `focus-ring` | `0 0 0 2px rgba(94, 107, 255, 0.2)` | Input/field focus state with brand glow |
| `btn-shadow-glow` | `0 0 20px rgba(94, 107, 255, 0.35)` | Primary action CTA glowing depth |

---

## 7. Layout & Grid Tokens

- **Maximum Content Width**: `max-w-[1728px]` — ultra-wide desktop dashboard layout
- **Inner Content Rail**: `max-w-4xl` (hero copy), `max-w-2xl` (final CTA copy)
- **Horizontal Safe Margin**: `px-margin-safe` (`32px` each side)
- **Dashboard Layout**: Sidebar `w-64` + Center `flex-1` + Right Panel `w-80`
- **Page Sections**: Full `h-[900px]` / `h-[820px]` locked-height full-bleed sections
- **Grid Columns**: `grid-cols-12` for approval pipeline tables; `grid-cols-4/5/6` for feature grids
- **Header Height**: `h-20` (80px) fixed sticky top bar

---

## 8. Component Construction Rules

1. **Structural Borders Over Tonal Steps**: Unlike Zenith, Romer uses `border border-custom-divider` (`#232426`) as the primary card boundary — tonal separation alone is insufficient in true-dark palettes.
2. **Status Dots**: 6×6px circles (`rounded-full`). Green `#22c55e` = live/active; Red `#ef4444` = critical; Cyan `#50d8e9` = AI/intelligence indicator.
3. **Background Grid for Precision Surfaces**: Instrument/telemetry panels use `radial-gradient` or `linear-gradient` dot/line grids at `opacity: 0.03–0.05`.
4. **Signal Color Usage**: `#50d8e9` (positive), `#ffb689` (attention), `#E5FD17` (on-track), `#5E6BFF` (brand action).
5. **Typography Weight `520`**: Manrope supports variable weight. `520` is the Romer "medium-bold" — between semibold and bold for tight tracking display text.
6. **`inner-glow` on All Cards**: Every data card should have `inset 0 1px 0 0 rgba(255,255,255,0.1)` applied.

---

## 9. Exportable Tailwind Config

```javascript
// tailwind.config.js
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // M3 Dark Scheme
        "primary": "#bec2ff",
        "on-primary": "#000ba6",
        "primary-container": "#7a85ff",
        "on-primary-container": "#000992",
        "primary-fixed": "#e0e0ff",
        "primary-fixed-dim": "#bec2ff",
        "inverse-primary": "#3d4ae0",
        "secondary": "#50d8e9",
        "on-secondary": "#00363c",
        "secondary-container": "#00b1c2",
        "on-secondary-container": "#003e44",
        "tertiary": "#ffb689",
        "on-tertiary": "#512300",
        "tertiary-container": "#e0731d",
        "on-tertiary-container": "#471e00",
        "surface": "#131314",
        "on-surface": "#e5e2e3",
        "surface-dim": "#131314",
        "surface-bright": "#3a393a",
        "surface-container-lowest": "#0e0e0f",
        "surface-container-low": "#1c1b1d",
        "surface-container": "#201f21",
        "surface-container-high": "#2a2a2b",
        "surface-container-highest": "#353436",
        "on-surface-variant": "#c6c5d8",
        "background": "#131314",
        "on-background": "#e5e2e3",
        "outline": "#8f8fa1",
        "outline-variant": "#454655",
        "inverse-surface": "#e5e2e3",
        "inverse-on-surface": "#313031",
        "surface-tint": "#bec2ff",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        // Brand Custom Extensions
        "custom-bg": "#070708",
        "custom-divider": "#232426",
        "custom-divider-light": "#1B1C1E",
        "custom-card-bg": "#101112",
        "custom-card-bg-alt": "#151617",
        "custom-sidebar": "#0d0e0f",
        "custom-panel": "#111214",
        "custom-text-muted": "#9A9DA3",
        "custom-btn-primary": "#5E6BFF",
        "custom-btn-text": "#F0F1F2",
        "brand-primary": "#5E6BFF",
        "brand-primary-hover": "#4a55cc",
        "brand-primary-text": "#F0F1F2",
        "brand-secondary-text": "#9A9DA3",
        "brand-border": "#1B1C1E",
        "brand-border-strong": "#232426",
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "6px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
        button: "12px",
        card: "12px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        gutter: "20px",
        "margin-safe": "32px",
        "section-lg": "64px",
      },
      fontFamily: {
        h1: ["Manrope", "sans-serif"],
        h2: ["Manrope", "sans-serif"],
        h3: ["Manrope", "sans-serif"],
        h4: ["Manrope", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "mono-data": ["Inter", "monospace"],
      },
      fontSize: {
        "hero-headline": ["76px", { lineHeight: "1.1", letterSpacing: "-0.055em", fontWeight: "520" }],
        h1: ["48px", { lineHeight: "1.1", letterSpacing: "-0.05em", fontWeight: "520" }],
        h2: ["32px", { lineHeight: "1.2", letterSpacing: "-0.05em", fontWeight: "520" }],
        h3: ["24px", { lineHeight: "1.2", letterSpacing: "-0.04em", fontWeight: "520" }],
        h4: ["18px", { lineHeight: "1.4", letterSpacing: "-0.02em", fontWeight: "520" }],
        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "500" }],
        "mono-data": ["13px", { lineHeight: "1", letterSpacing: "-0.01em", fontWeight: "400" }],
      },
    },
  },
};
```

---

## 10. Machine-Readable JSON (`design-tokens.json`)

```json
{
  "$schema": "https://tr.designtokens.org/format/",
  "name": "Romer Design Tokens",
  "version": "1.1.0",
  "color": {
    "primary": { "$value": "#bec2ff", "$type": "color" },
    "primaryContainer": { "$value": "#7a85ff", "$type": "color" },
    "secondary": { "$value": "#50d8e9", "$type": "color" },
    "tertiary": { "$value": "#ffb689", "$type": "color" },
    "tertiaryContainer": { "$value": "#e0731d", "$type": "color" },
    "surface": { "$value": "#131314", "$type": "color" },
    "onSurface": { "$value": "#e5e2e3", "$type": "color" },
    "surfaceContainerLowest": { "$value": "#0e0e0f", "$type": "color" },
    "surfaceContainerLow": { "$value": "#1c1b1d", "$type": "color" },
    "surfaceContainer": { "$value": "#201f21", "$type": "color" },
    "surfaceContainerHigh": { "$value": "#2a2a2b", "$type": "color" },
    "surfaceContainerHighest": { "$value": "#353436", "$type": "color" },
    "onSurfaceVariant": { "$value": "#c6c5d8", "$type": "color" },
    "outline": { "$value": "#8f8fa1", "$type": "color" },
    "outlineVariant": { "$value": "#454655", "$type": "color" },
    "brandPrimary": { "$value": "#5E6BFF", "$type": "color" },
    "brandBg": { "$value": "#070708", "$type": "color" },
    "brandCard": { "$value": "#101112", "$type": "color" },
    "brandDivider": { "$value": "#232426", "$type": "color" },
    "brandTextMuted": { "$value": "#9A9DA3", "$type": "color" }
  },
  "typography": {
    "fontFamily": {
      "display": { "$value": "Manrope, sans-serif", "$type": "fontFamily" },
      "body": { "$value": "Inter, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "Inter, monospace", "$type": "fontFamily" }
    },
    "fontSize": {
      "heroHeadline": { "$value": "76px", "$type": "dimension" },
      "h1": { "$value": "48px", "$type": "dimension" },
      "h2": { "$value": "32px", "$type": "dimension" },
      "h3": { "$value": "24px", "$type": "dimension" },
      "bodyMd": { "$value": "14px", "$type": "dimension" },
      "labelSm": { "$value": "12px", "$type": "dimension" },
      "monoData": { "$value": "13px", "$type": "dimension" }
    }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" },
    "xl": { "$value": "40px", "$type": "dimension" },
    "gutter": { "$value": "20px", "$type": "dimension" },
    "marginSafe": { "$value": "32px", "$type": "dimension" }
  },
  "borderRadius": {
    "default": { "$value": "12px", "$type": "dimension" },
    "sm": { "$value": "6px", "$type": "dimension" },
    "lg": { "$value": "12px", "$type": "dimension" },
    "xl": { "$value": "16px", "$type": "dimension" },
    "full": { "$value": "9999px", "$type": "dimension" },
    "card": { "$value": "12px", "$type": "dimension" },
    "button": { "$value": "12px", "$type": "dimension" }
  }
}
```
