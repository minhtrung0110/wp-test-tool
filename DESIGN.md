# Design System Specification: The Precision Layer

## 1. Overview & Creative North Star

**The Creative North Star: "The Architectural Console"**

This design system transcends the typical "SaaS dashboard" aesthetic by treating the Electron environment as a high-performance architectural tool. We are moving away from the "web page" feel and toward a "precision instrument" experience.

To break the template look, we utilize **Intentional Asymmetry** and **Tonal Depth**. Instead of boxing everything in, we use a three-pane layout where the Sidebar and Utility panels act as "grounded" anchors, while the Main Preview Area feels like a "floating lens." We prioritize editorial-grade typography scales to ensure that even in dense data environments, the user’s eye is led by hierarchy, not by clutter.

---

## 2. Colors & Surface Philosophy

The palette is rooted in a professional "Deep Indigo" core, supported by a sophisticated range of neutral surfaces that define space through tone rather than lines.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to section off major UI areas.
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#f3f4f6) navigation rail should sit directly against a `surface` (#f8f9fb) workspace. The eye perceives the transition of color as a structural change, creating a cleaner, more high-end feel.

### Surface Hierarchy & Nesting

Treat the UI as physical layers of stacked material.

- **Base:** `surface` (#f8f9fb)
- **Secondary Anchors (Sidebar):** `surface-container-low` (#f3f4f6)
- **Elevated Content (Cards):** `surface-container-lowest` (#ffffff)
- **Interactive Overlays:** `surface-bright` (#f8f9fb)

### The Glass & Gradient Rule

For floating elements (like utility tooltips or screenshot previews), use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-blur: 12px`. For Primary CTAs, use a subtle linear gradient from `primary` (#004ac6) to `primary-container` (#2563eb) at a 135-degree angle to provide a "soulful" depth that flat hex codes lack.

---

## 3. Typography

We use a dual-font strategy to balance editorial authority with technical precision.

- **Display & Headlines (Manrope):** Chosen for its unique geometric character. Use `display-md` and `headline-sm` for dashboard summaries and section headers. The wider tracking in Manrope conveys a sense of "premium space."
- **Body & Labels (Inter):** The workhorse. Inter is used for all data-dense areas, logs, and input fields. Its high x-height ensures readability at `body-sm` (0.75rem) for technical metadata.

**Hierarchy Tip:** Use `on-surface-variant` (#434655) for "label-md" text to create a clear visual distinction between descriptive metadata and the "on-surface" (#191c1e) primary data.

---

## 4. Elevation & Depth

In this system, depth is earned through **Tonal Layering**, not structural shadows.

- **The Layering Principle:** To lift a card, do not reach for a shadow. Place a `surface-container-lowest` (pure white) card on top of a `surface-container` (#edeef0) background. The contrast provides the lift.
- **Ambient Shadows:** If a component must float (e.g., a context menu), use an ultra-diffused shadow: `box-shadow: 0 12px 32px rgba(0, 74, 198, 0.05)`. Notice the shadow is tinted with the Primary Indigo, making it feel like part of the environment’s lighting.
- **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#c3c6d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Inputs

- **Primary Button:** Pill-shaped (`rounded-full`). Gradient background (Primary to Primary-Container). No border.
- **Secondary/Ghost Button:** No background. Use `label-md` in `primary` color. On hover, apply a `surface-container-high` background.
- **Input Fields:** Use `surface-container-lowest` backgrounds. Instead of a 4-sided border, use a 2px bottom-accent of `outline-variant` that transitions to `primary` on focus.

### Chips & Badges (Status Indicators)

- **Success Badge:** Pill-shaped. `tertiary-container` (#007d55) background with `on-tertiary-fixed` (#002113) text.
- **Error/404 Badge:** `error-container` (#ffdad6) background with `on-error-container` (#93000a) text.
- **The "Pill" Aesthetic:** All badges must use the `9999px` radius scale to contrast against the `0.75rem` (md) radius of the main application cards.

### Cards & Lists

- **Forbid Dividers:** Never use a horizontal line to separate list items. Use **Vertical White Space** (16px/24px) or a subtle hover state shift to `surface-container-highest` to indicate individual rows.

### The Utility Panel (Specialty Component)

For the bottom screenshot/notes panel, use a **Blurred Surface**. This panel should feel like a "tray" that has been slid over the main preview, utilizing a `surface-container-low` color at 80% opacity with a heavy backdrop blur.

---

## 6. Do’s and Don’ts

### Do:

- **Do** use "Manrope" for numbers in dashboard widgets; its geometry makes data look like a premium asset.
- **Do** utilize the "Three-Pane" layout to group logic. Left: Intent (Nav), Center: Action (Preview), Bottom: Result (Logs/Screenshots).
- **Do** use `primary-fixed-dim` for inactive toggle states to maintain a "high-end tool" vibe.

### Don’t:

- **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1e) to keep the contrast high but the "glare" low.
- **Don't** use standard "Drop Shadows." If it doesn't look like ambient light, it doesn't belong in the system.
- **Don't** use sharp 90-degree corners. Even the most "tool-like" element should have at least a `sm` (0.25rem) radius to feel modern and polished.
