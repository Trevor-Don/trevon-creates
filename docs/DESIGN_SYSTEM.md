# Trevon Creates Design System

> Retrieved directly from Google Stitch (`projects/10987540357240467999`).

---

## 1. Design DNA & Philosophy

The Trevon Creates design system is built for **cyber-modernism**, **high-density technical instruments**, and **developer-first clarity**.

- **Atmosphere**: Stark, deep-black canvas punctuated by electric neon green and clementine orange signals.
- **Visual Accents**: Monogrammatic bracket motifs `{ }`, terminal syntax styling, 1px technical outlines, and subtle neon emissions.
- **Tone**: Confident, architectural, precise, razor-sharp.

---

## 2. Color Tokens

### Primary Palette
- **Primary / Electric Neon (`#00FF00`)**: System heartbeat. Used for active indicators, primary CTAs, live state tags, focus rings, and code syntax highlights.
- **Secondary / Clementine Orange (`#FFAE00`)**: High-temperature accent. Used for secondary callouts, warnings, metric spikes, and priority tags.
- **Tertiary / Pure White (`#FFFFFF`)**: High-contrast typographic clarity, readouts, and bright structural accents.
- **Neutral Base / Jet Black (`#000000`)**: The infinite contrast backdrop.

### Dark Surface Tiers
- **Canvas Base**: `#000000`
- **Surface Container (Lowest)**: `#080B09`
- **Surface Container (Low)**: `#0B0E0C`
- **Surface Container (Mid)**: `#121714`
- **Surface Container (High)**: `#1A211D`
- **Surface Overlay / Popover**: `#161B18`

### Technical Borders & Glows
- **Default Structural Outline**: `rgba(255, 255, 255, 0.08)` or `1px solid #1A211D`
- **Subtle Tech Border**: `rgba(0, 255, 0, 0.2)`
- **Signal Glow (Primary)**: `0 0 0 1px #00FF00, 0 0 16px -2px rgba(0, 255, 0, 0.3)`
- **Signal Glow (Warning/Alert)**: `0 0 0 1px #FFAE00, 0 0 16px -2px rgba(255, 174, 0, 0.25)`

---

## 3. Typography Hierarchy

### Fonts
- **Headlines & Technical Display**: `Space Grotesk` (Geometric, angular, modern mechanical)
- **Body & Data Prose**: `Fira Sans` (Humanist legibility, robust code & technical readability)
- **Labels & HUD Indicators**: `Space Grotesk` (Uppercase, expanded letter spacing `0.08em` - `0.1em`)

### Scale
- **Display Lg**: `56px` / Line Height `64px` / Weight `700` / Tracking `-0.03em`
- **Headline XL**: `40px` / Line Height `48px` / Weight `600` / Tracking `-0.02em`
- **Headline Lg**: `32px` / Line Height `40px` / Weight `600` / Tracking `-0.01em`
- **Headline Md**: `24px` / Line Height `32px` / Weight `500` / Tracking `0em`
- **Headline Sm**: `20px` / Line Height `28px` / Weight `500` / Tracking `0em`
- **Body Lg**: `18px` / Line Height `28px` / Weight `400`
- **Body Md**: `15px` / Line Height `24px` / Weight `400`
- **Body Sm**: `13px` / Line Height `20px` / Weight `400`
- **Label Lg**: `14px` / Line Height `20px` / Weight `600` / Tracking `0.05em`
- **Label Md**: `12px` / Line Height `16px` / Weight `600` / Tracking `0.08em`
- **Label Sm**: `10px` / Line Height `14px` / Weight `600` / Tracking `0.1em`

---

## 4. Layout & Spacing Scale (8px Grid)

- **Desktop (1200px+)**: 12 columns, 24px (`1.5rem`) gutters, 48px (`3rem`) canvas margins. Max inner container: `1360px`.
- **Tablet (768px - 1199px)**: 8 columns, 20px gutters, 32px canvas margins.
- **Mobile (320px - 767px)**: 4 columns, 16px (`1rem`) gutters, 20px (`1.25rem`) margins.

### Spacing Constants
- `space-xs`: `0.25rem` (4px)
- `space-sm`: `0.5rem` (8px)
- `space-md`: `1.0rem` (16px)
- `space-lg`: `1.5rem` (24px)
- `space-xl`: `2.5rem` (40px)

---

## 5. Shape System

- **Base Elements (Buttons, Inputs, Badges)**: `4px` (`0.25rem`)
- **Cards & Modals**: `8px` (`0.5rem`)
- **Hero & Command Panels**: `12px` (`0.75rem`)
- **Brackets**: Interior angles remain sharp and square to echo `{ }`.

---

## 6. Component Specs

### Buttons
- **Primary**: Solid Neon Green (`#00FF00`) fill, Jet Black (`#000000`) bold `Space Grotesk` text. Hover shifts to white with `0 0 20px rgba(0,255,0,0.4)` emission.
- **Secondary / Ghost**: Transparent fill, 1px solid border (`rgba(255,255,255,0.2)`), White or Neon Green text. Hover introduces `rgba(0,255,0,0.08)` fill and `#00FF00` border.
- **Accent / Alert**: Clementine Orange (`#FFAE00`) fill/border with black text.

### Inputs
- Obsidian container (`#0B0E0C`) with 1px border (`#1A211D`).
- Typography in `Fira Sans` (15px), placeholder in muted steel (`#6E7671`).
- Focus state triggers 1px border transition to `#00FF00` with electric glow.

### Cards & Panels
- Fill: `#080B09`, framed by 1px border (`rgba(255,255,255,0.08)`).
- Headers feature uppercase `Space Grotesk` labels alongside bracketed telemetry tags (e.g. `[SYS_OK]`, `{01}`).

### Status Badges / Chips
- Height: 24px, uppercase 10px label.
- Features a glowing 6px status dot (`#00FF00` = live/complete, `#FFAE00` = in-progress/review).
