---
description: Frontend design skill — guidelines for creating distinctive, premium UI
---

# Frontend Design Skill

## Design Thinking

Before writing any UI code, **think through context first**:

1. **Purpose** — What problem does this interface solve? Who uses it?
2. **Tone** — Choose a clear aesthetic direction. For this project: modern, nature-inspired, professional with green village warmth. Other projects may vary — always commit to a BOLD direction.
3. **Constraints** — Framework (React + Tailwind), performance, accessibility, dark/light mode support.
4. **Differentiation** — What makes this UNFORGETTABLE? What's the one detail someone will remember?

> **CRITICAL:** Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is **intentionality**, not intensity.

Then implement working code that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

---

## Typography

- Choose fonts that are **beautiful, unique, and interesting**
- AVOID generic defaults: Arial, system-ui, sans-serif
- PREFER distinctive choices that elevate the design — characterful display fonts paired with refined body fonts
- Use variable font weights for nuance (300, 400, 500, 600, 700, 800)
- Establish a clear typographic hierarchy: display → heading → subheading → body → caption
- Use `letter-spacing` and `line-height` intentionally — tight tracking for headlines, generous leading for body

### Project-Specific Fonts
- This project uses **Inter** (Google Fonts) with weights 300–800
- For new projects, consider: **Outfit**, **DM Sans**, **Satoshi**, **General Sans**, **Cabinet Grotesk**, **Clash Display**

---

## Color & Theme

- Commit to a **cohesive palette** — not random colors
- Use CSS variables or Tailwind config for consistency
- **Dominant colors with sharp accents** outperform timid, evenly-distributed palettes
- Every color must serve a purpose: primary action, secondary info, success, warning, error, neutral
- Dark mode is NOT just "invert colors" — it requires careful attention to contrast, elevation, and surface hierarchy

### Project-Specific Palette (Green Village)
**Light Mode:**
- Primary: Forest green `#2D5016`
- Secondary: Sage `#8B9A6B`
- Accent: Moss `#4A6741`
- Background: Cream `#FDFCF8`
- Card: White `#FFFFFF`
- Text: Earth brown `#3D3B35`
- Border: Soft green `#C5D4BC`

**Dark Mode:**
- Primary: Light forest `#4A7C2D`
- Secondary: Muted sage `#A8B89B`
- Accent: Bright moss `#6B8E5F`
- Background: Dark earth `#1A1E18`
- Card: Darker earth `#252B23`
- Text: Light cream `#E8E6DD`
- Border: Dim green `#3D4A3D`

---

## Motion & Animation

- Use animations for **high-impact moments**, not everywhere
- One well-orchestrated page load with **staggered reveals** (`animation-delay`) creates more delight than scattered micro-interactions
- Prioritize CSS-only animations when possible (better performance)
- Key moments to animate:
  - Page/section entrance (fade-in, slide-up)
  - Button hover states (scale, shadow lift)
  - Card hover (subtle lift + shadow expansion)
  - Loading states (skeleton shimmer, spinner)
  - Toast notifications (slide-in from edge)
  - Theme toggle (smooth color transition)
- Use `transition-all duration-200` or `duration-300` as baseline
- Add `active:scale-[0.98]` on clickable elements for tactile feedback
- NEVER use jarring or distracting animations

---

## Spatial Composition & Layout

- Use **generous negative space** — don't cram elements together
- Establish consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64px)
- Cards and containers should have comfortable padding (`p-6` minimum)
- Group related elements with tight spacing; separate groups with more space
- Consider asymmetric layouts for visual interest on desktop
- Mobile-first: single column stacked cards → tablet: centered wider → desktop: multi-column
- Use `max-w-2xl` or `max-w-7xl` containers to prevent content from stretching too wide

---

## Backgrounds & Visual Details

- Create **atmosphere and depth** rather than flat solid colors
- Techniques to use:
  - **Glassmorphism**: `bg-white/60 backdrop-blur-xl border border-white/30` for cards
  - **Subtle shadows**: `shadow-lg shadow-black/5` (light), `shadow-black/20` (dark)
  - **Gradient overlays**: for hero sections or accent areas
  - **Border opacity**: `border-white/30` instead of solid borders for elegance
  - **Background blur**: `backdrop-blur-sm` on overlays and modals
- NEVER use flat, unadorned containers with hard borders

---

## Component Standards

### Buttons
- Minimum touch target: `44px` height (`min-h-[44px]`)
- Clear visual hierarchy: primary (filled) → secondary (outlined/glass) → text (minimal)
- Hover: shadow lift + color shift
- Active: slight scale down `active:scale-[0.98]`
- Disabled: `opacity-50 cursor-not-allowed`
- Always include loading states with spinner

### Inputs
- Generous padding: `px-4 py-3`
- Rounded corners: `rounded-xl`
- Glass background: `bg-white/50 backdrop-blur-sm`
- Clear focus ring: `focus:ring-2 focus:ring-primary/50`
- Text size `16px` minimum (prevents iOS zoom)

### Cards
- Glass effect: `bg-white/70 backdrop-blur-xl`
- Soft border: `border border-white/30`
- Generous padding: `p-6`
- Rounded: `rounded-2xl`
- Subtle shadow: `shadow-lg shadow-black/5`

### Select / Dropdowns
- Match input styling
- Dark mode: explicitly set `option` background/color for native dropdowns
- Add `color-scheme: dark` in dark mode

---

## Anti-Patterns to AVOID

❌ Generic "AI slop" aesthetics:
- Overused fonts (Inter on everything, Roboto, Arial)
- Purple gradients on white backgrounds
- Cookie-cutter card layouts with no personality
- Flat gray borders with no depth
- Default browser form styling
- Walls of text with no breathing room

❌ Technical mistakes:
- Forgetting dark mode variants
- Hard-coded colors instead of theme tokens
- Non-responsive layouts
- Missing hover/focus/active states
- Missing loading and error states
- Inaccessible color contrast

---

## Checklist Before Shipping UI

- [ ] Clear visual hierarchy (headings, body, captions)
- [ ] Consistent color palette from theme tokens
- [ ] Dark mode fully working (text, backgrounds, borders, inputs, selects)
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1920px)
- [ ] All interactive elements have hover + active states
- [ ] Loading states for async operations
- [ ] Error states with user-friendly messages
- [ ] Minimum 44px touch targets on mobile
- [ ] Smooth transitions on state changes
- [ ] No horizontal scroll on any viewport
- [ ] Glassmorphism/depth on cards and overlays
