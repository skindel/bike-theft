# CycleGuard — AI Brand Color Specification

> Use this file as the canonical color and visual-style reference for all AI-generated UI, frontend code, design systems, components, maps, dashboards, and marketing assets for CycleGuard.

## 1. Brand Direction

CycleGuard is a premium mobility-tech startup focused on bicycle theft intelligence, risk visualization, and safer urban cycling.

The visual identity must feel:

- premium
- precise
- modern
- urban
- data-driven
- trustworthy
- minimal
- dark-first
- high-end European tech
- polished enough to look like it was created by a top-tier design agency

Avoid:

- generic SaaS gradients everywhere
- playful startup colors
- excessive glassmorphism
- neon cyberpunk aesthetics
- overly saturated backgrounds
- cartoonish iconography
- cheap-looking shadows
- excessive rounded corners
- visual clutter
- gradients on every component
- using brand red as a warning color everywhere

---

## 2. Core Brand Colors

### Primary Background
`#04070E`

Usage:
- main app background
- website background
- map-side panels
- dashboards
- navigation shells
- full-screen dark sections

This is the primary brand background and should be preferred over pure black.

### Elevated Background
`#0B111B`

Usage:
- navbars
- elevated panels
- modals
- floating controls
- secondary app surfaces

### Primary Brand Coral
`#FC5145`

Usage:
- main CTA
- selected states
- active navigation
- important brand moments
- map markers where branding is needed
- logo applications

Do not overuse this color.

### Brand Hover
`#FF675B`

Usage:
- hover state of primary buttons
- subtle interactive highlight

### Brand Pressed
`#E93F36`

Usage:
- active or pressed CTA state
- strong interaction feedback

---

## 3. Logo Gradient

The logo may use this gradient:

- Start: `#FD694C`
- Mid: `#FC5145`
- End: `#FD3B3D`

CSS:

```css
linear-gradient(
  180deg,
  #FD694C 0%,
  #FC5145 48%,
  #FD3B3D 100%
)
```

Use this gradient mainly for:
- logo
- hero branding
- selected premium accents
- loading animation
- splash screens
- limited branded highlights

Do not use this gradient across standard buttons, cards, or large interface sections.

---

## 4. Neutral Color Scale

### Neutral 50
`#F8FAFC`

Use for:
- primary text
- icons on dark surfaces
- high-emphasis labels

### Neutral 100
`#F1F5F9`

### Neutral 200
`#E2E8F0`

### Neutral 300
`#CBD5E1`

Use for:
- secondary text
- inactive labels
- less important UI text

### Neutral 400
`#94A3B8`

Use for:
- muted text
- metadata
- placeholders
- secondary icons

### Neutral 500
`#64748B`

Use for:
- disabled text
- disabled icons

### Neutral 600
`#475569`

### Neutral 700
`#334155`

Use for:
- strong borders
- separators

### Neutral 800
`#1E293B`

### Neutral 850
`#151C27`

### Neutral 900
`#0B111B`

### Neutral 950
`#04070E`

---

## 5. UI Surface Tokens

Use these exact values unless there is a strong visual reason not to.

```css
--cg-bg: #04070E;
--cg-bg-elevated: #0B111B;
--cg-surface: #111823;
--cg-surface-hover: #182231;
--cg-surface-selected: #202C3D;
--cg-border-subtle: #1D2939;
--cg-border-strong: #334155;
```

### Surface Usage

#### Main page
`#04070E`

#### Header / navigation
`#0B111B`

#### Standard card
`#111823`

#### Hovered card
`#182231`

#### Selected card / active filter
`#202C3D`

#### Subtle borders
`#1D2939`

#### Strong borders
`#334155`

Avoid pure white card backgrounds in the primary dark product experience.

---

## 6. Text Hierarchy

### Primary Text
`#F8FAFC`

Use for:
- page titles
- important values
- CTA labels
- main body text with high emphasis

### Secondary Text
`#CBD5E1`

Use for:
- descriptions
- secondary information
- supporting copy

### Muted Text
`#94A3B8`

Use for:
- timestamps
- metadata
- table sublabels
- placeholders
- legends

### Disabled Text
`#64748B`

Use only for genuinely disabled UI.

Do not use pure white `#FFFFFF` for all text. Prefer `#F8FAFC`.

---

## 7. Semantic Colors

### Success
`#22C55E`

Use for:
- safe state
- successful actions
- completed checks
- confirmed data

### Warning
`#F59E0B`

Use for:
- caution
- incomplete data
- moderate alerts

### Danger
`#EF4444`

Use for:
- errors
- critical theft-risk state
- destructive actions

### Info
`#38BDF8`

Use for:
- neutral information
- system information
- informational map state

Important:
Do not use the CycleGuard brand coral `#FC5145` as the universal danger/error color.
Brand and semantic meaning should remain separate.

---

## 8. Theft Risk Heatmap Scale

Use this exact scale for all map visualizations unless the data model explicitly requires a different number of bins.

### Very Low Risk
`#2DD4BF`

### Low Risk
`#38BDF8`

### Medium Risk
`#FACC15`

### High Risk
`#FB923C`

### Critical Risk
`#EF4444`

Recommended order:

```text
Very Low   #2DD4BF
Low        #38BDF8
Medium     #FACC15
High       #FB923C
Critical   #EF4444
```

### Heatmap Rules

- Use heatmap colors only for data meaning.
- Do not use them as general decorative UI colors.
- Keep the scale consistent across map, legend, cards, charts, and reports.
- Critical risk must visually remain distinct from the brand coral.
- Use opacity and blur for the heatmap layer itself, but keep legend swatches fully opaque.

---

## 9. Primary Interaction States

### Primary Button
Background:
`#FC5145`

Text:
`#F8FAFC`

### Hover
`#FF675B`

### Pressed
`#E93F36`

### Focus Ring
`#FF8E84`

Recommended focus treatment:

```css
box-shadow: 0 0 0 3px rgba(255, 142, 132, 0.28);
```

Avoid large glowing red shadows.

---

## 10. Recommended Contrast Pairings

Use:

```text
#F8FAFC on #04070E
#CBD5E1 on #04070E
#F8FAFC on #111823
#CBD5E1 on #111823
#F8FAFC on #FC5145
```

Avoid:

```text
#94A3B8 on #334155
#FC5145 as small body text on dark backgrounds
yellow body text
red body text
low-contrast gray-on-gray combinations
```

---

## 11. Brand Usage Ratio

As a visual rule of thumb:

- 70–80% dark neutrals
- 15–20% light neutrals / text
- 5–10% brand coral
- semantic colors only when data or status requires them

The coral should feel scarce and intentional.

If the page looks red, the color system is being used incorrectly.

---

## 12. Component Guidance

### Navigation
Use:
- background `#0B111B`
- active icon/text `#F8FAFC`
- inactive icon/text `#94A3B8`
- active accent `#FC5145`

### Cards
Use:
- background `#111823`
- hover `#182231`
- border `#1D2939`
- heading `#F8FAFC`
- supporting text `#94A3B8`

Avoid:
- heavy drop shadows
- thick outlines
- glowing borders

### Buttons
Primary:
- `#FC5145`

Secondary:
- background `#111823`
- border `#334155`
- text `#F8FAFC`

Ghost:
- transparent
- hover `#182231`
- text `#CBD5E1`

### Inputs
Background:
`#0B111B`

Border:
`#334155`

Placeholder:
`#64748B`

Text:
`#F8FAFC`

Focus border:
`#FC5145`

### Map Controls
Background:
`#0B111B`

Border:
`#1D2939`

Icon:
`#CBD5E1`

Active:
`#FC5145`

---

## 13. Map-Specific Design Rules

The map is a core part of the product and should visually dominate the experience.

Rules:

- keep base map relatively desaturated
- reduce competing map colors
- let the theft-risk heatmap become the main visual layer
- use dark map styling where possible
- keep labels readable but subdued
- use white/neutral map controls
- use brand coral for branded location markers only
- use semantic red for critical theft risk
- avoid colorful POI clutter

The map should feel analytical, not recreational.

---

## 14. Charts and Data Visualization

Default chart colors:

Primary series:
`#FC5145`

Secondary series:
`#38BDF8`

Positive:
`#22C55E`

Warning:
`#F59E0B`

Negative:
`#EF4444`

Grid:
`#1D2939`

Axis labels:
`#94A3B8`

Headline values:
`#F8FAFC`

Do not use many random chart colors.
Prefer one primary series with subdued secondary series.

---

## 15. Logo Usage

Logo background preference:

1. `#04070E`
2. `#0B111B`
3. transparent on dark background

Use the coral logo mark with high contrast.

Do not:
- add drop shadows
- add glow
- add borders
- add 3D effects
- stretch or skew the logo
- place the logo on a visually noisy background
- recolor the logo into multiple unrelated colors

The logo should remain flat, crisp, minimal, and premium.

---

## 16. AI Implementation Instructions

When generating UI or frontend code for CycleGuard:

1. Use this document as the source of truth for color decisions.
2. Default to dark mode.
3. Never invent random colors if an existing token fits.
4. Prefer semantic tokens over raw hex values in components.
5. Keep the brand coral restrained.
6. Keep spacing and hierarchy more important than decoration.
7. Use subtle borders instead of large shadows.
8. Use minimal gradients.
9. Use semantic colors only for semantic meaning.
10. Keep heatmap colors distinct from brand colors.
11. Aim for a premium European mobility-tech aesthetic.
12. Do not make the UI look like a generic AI-generated SaaS dashboard.
13. Avoid excessive pills and rounded rectangles.
14. Use 8–12 px corner radius for most cards and controls.
15. Use larger radii only for specific floating controls.
16. Keep iconography thin, geometric, and consistent.
17. Maintain strong visual hierarchy.
18. Use generous whitespace.
19. Prefer restrained animation.
20. Prioritize clarity and trust over visual gimmicks.

---

## 17. CSS Tokens

```css
:root {
  --cg-coral-50: #FFF4F2;
  --cg-coral-100: #FFE4DF;
  --cg-coral-200: #FFC9C1;
  --cg-coral-300: #FFA59A;
  --cg-coral-400: #FF786A;
  --cg-coral-500: #FC5145;
  --cg-coral-600: #E93F36;
  --cg-coral-700: #C8322C;
  --cg-coral-800: #A52B27;
  --cg-coral-900: #892925;
  --cg-coral-950: #4B1210;

  --cg-brand-gradient-start: #FD694C;
  --cg-brand-gradient-mid: #FC5145;
  --cg-brand-gradient-end: #FD3B3D;

  --cg-neutral-50: #F8FAFC;
  --cg-neutral-100: #F1F5F9;
  --cg-neutral-200: #E2E8F0;
  --cg-neutral-300: #CBD5E1;
  --cg-neutral-400: #94A3B8;
  --cg-neutral-500: #64748B;
  --cg-neutral-600: #475569;
  --cg-neutral-700: #334155;
  --cg-neutral-800: #1E293B;
  --cg-neutral-850: #151C27;
  --cg-neutral-900: #0B111B;
  --cg-neutral-950: #04070E;

  --cg-bg: #04070E;
  --cg-bg-elevated: #0B111B;
  --cg-surface: #111823;
  --cg-surface-hover: #182231;
  --cg-surface-selected: #202C3D;

  --cg-border-subtle: #1D2939;
  --cg-border-strong: #334155;

  --cg-text-primary: #F8FAFC;
  --cg-text-secondary: #CBD5E1;
  --cg-text-muted: #94A3B8;
  --cg-text-disabled: #64748B;

  --cg-primary: #FC5145;
  --cg-primary-hover: #FF675B;
  --cg-primary-pressed: #E93F36;
  --cg-focus-ring: #FF8E84;

  --cg-success: #22C55E;
  --cg-warning: #F59E0B;
  --cg-danger: #EF4444;
  --cg-info: #38BDF8;

  --cg-risk-very-low: #2DD4BF;
  --cg-risk-low: #38BDF8;
  --cg-risk-medium: #FACC15;
  --cg-risk-high: #FB923C;
  --cg-risk-critical: #EF4444;

  --cg-overlay: rgba(4, 7, 14, 0.72);
}
```

---

## 18. Short AI Prompt

When an AI system needs only a compact visual brief, use:

> Design CycleGuard as a premium, dark-first European mobility-tech brand. Use near-black `#04070E` as the primary background, `#0B111B` and `#111823` for elevated surfaces, off-white `#F8FAFC` for primary text, and coral `#FC5145` as the restrained brand accent. Use subtle borders, minimal shadows, restrained gradients, clean geometric icons, generous spacing, and a precise data-driven aesthetic. For theft-risk heatmaps use `#2DD4BF → #38BDF8 → #FACC15 → #FB923C → #EF4444`. Do not use coral as the universal danger color. Avoid generic AI-SaaS visuals, excessive glow, excessive rounded pills, and decorative gradients.

---

## 19. Canonical Brand Principle

CycleGuard should feel like:

**urban mobility intelligence + safety infrastructure + premium consumer tech**

It should not feel like:

**a generic dashboard, a gaming app, a cheap security product, or an AI-template startup.**
