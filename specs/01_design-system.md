# 01 — Design System: "Aurora Glass" (use verbatim)

A dark, deep-space canvas with luminous gradients, frosted-glass surfaces, crisp type, and tasteful motion. Linear / Raycast / Arc polish, applied to commerce. Ship a light mode too.

## Brand
- **Name:** LUMORA · **Tagline:** *Shop the future. Beautifully.*
- **Logo:** minimal crescent **arc of light** that reads as an **L**, single luminous stroke curving up-right, gradient violet→cyan. Provide full lockup (mark + wordmark in Space Grotesk, slightly loose tracking) and a standalone mark for favicon/mobile. Generate as inline SVG; export favicon set (16/32/180/512 + maskable).

## Design tokens

`apps/web/tailwind.config.ts` → `theme.extend`:

```ts
colors: {
  // dark ("Aurora") — default
  bg:        "#070710",
  surface:   "#0d0d1a",
  "surface-2":"#13132400",
  border:    "rgba(255,255,255,0.08)",
  "border-strong":"rgba(255,255,255,0.14)",
  text:      "#F5F6FF",
  muted:     "#A0A3BD",
  // accent (aurora gradient stops)
  violet:    "#7C5CFF",
  cyan:      "#22D3EE",
  indigo:    "#5B7CFA",
  // semantic
  success:   "#34D399",
  warning:   "#FBBF24",
  danger:    "#F87171",
},
borderRadius: { xl: "1rem", "2xl": "1.25rem", "3xl": "1.75rem" },
boxShadow: {
  glow:      "0 0 0 1px rgba(124,92,255,0.25), 0 8px 40px -8px rgba(124,92,255,0.45)",
  "glow-cyan":"0 0 0 1px rgba(34,211,238,0.25), 0 8px 40px -8px rgba(34,211,238,0.40)",
  card:      "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 60px -20px rgba(0,0,0,0.7)",
},
backdropBlur: { glass: "14px" },
fontFamily: {
  display: ["var(--font-space-grotesk)", "sans-serif"],
  sans:    ["var(--font-inter)", "sans-serif"],
},
backgroundImage: {
  "aurora-text": "linear-gradient(92deg, #7C5CFF 0%, #5B7CFA 45%, #22D3EE 100%)",
  "aurora-line": "linear-gradient(92deg, #7C5CFF, #22D3EE)",
},
keyframes: {
  "aurora-drift": { "0%,100%": { transform: "translate3d(-2%,-1%,0) scale(1.05)" },
                    "50%":      { transform: "translate3d(2%,1%,0) scale(1.1)" } },
  shimmer: { "100%": { transform: "translateX(100%)" } },
  "fade-up": { from: { opacity: "0", transform: "translateY(12px)" },
               to:   { opacity: "1", transform: "translateY(0)" } },
},
animation: {
  "aurora-drift": "aurora-drift 18s ease-in-out infinite",
  shimmer: "shimmer 1.6s infinite",
  "fade-up": "fade-up .5s cubic-bezier(.16,1,.3,1) both",
},
```

`apps/web/app/globals.css` (key utilities — implement these):

```css
:root { color-scheme: dark; }
[data-theme="light"] {
  --bg:#F7F7FB; --surface:#FFFFFF; --border:rgba(10,10,30,.08);
  --text:#0B0B16; --muted:#5B5E78; color-scheme: light;
}

/* Frosted glass surface */
.glass {
  background: color-mix(in oklab, var(--surface, #0d0d1a) 70%, transparent);
  border: 1px solid var(--border, rgba(255,255,255,.08));
  backdrop-filter: blur(14px);
  border-radius: 1.25rem;
}
.glass:hover { border-color: rgba(255,255,255,.14); }

/* Gradient (aurora) text */
.text-aurora {
  background: linear-gradient(92deg,#7C5CFF,#5B7CFA,#22D3EE);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

/* Gradient hairline border (for badges/cards) */
.border-aurora {
  position: relative; border-radius: 1rem;
}
.border-aurora::before {
  content:""; position:absolute; inset:0; padding:1px; border-radius:inherit;
  background: linear-gradient(92deg,#7C5CFF,#22D3EE);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none;
}

/* Aurora mesh background — STATIC gradients + cheap transform drift only.
   Mount after first paint; disable under reduced-motion. */
.aurora-mesh {
  position:absolute; inset:-20%; z-index:-1; pointer-events:none;
  background:
    radial-gradient(40% 35% at 20% 20%, rgba(124,92,255,.22), transparent 60%),
    radial-gradient(35% 30% at 80% 30%, rgba(34,211,238,.16), transparent 60%),
    radial-gradient(40% 40% at 60% 80%, rgba(91,124,250,.16), transparent 60%);
  filter: blur(40px);
  will-change: transform;
}
@media (prefers-reduced-motion: no-preference) { .aurora-mesh { animation: aurora-drift 18s ease-in-out infinite; } }

/* Skeleton shimmer */
.skeleton { position:relative; overflow:hidden; background:rgba(255,255,255,.05); }
.skeleton::after { content:""; position:absolute; inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
  transform:translateX(-100%); animation:shimmer 1.6s infinite; }
```

## Typography
- Display/headings: **Space Grotesk** (`next/font/google` → `--font-space-grotesk`), tight tracking (`-0.02em`), weights 500/600/700.
- Body/UI: **Inter** (`--font-inter`), line-height 1.6 body / 1.2 headings.
- Scale (clamp for fluid): h1 `clamp(2.2rem,5vw,4rem)`, h2 `clamp(1.6rem,3vw,2.5rem)`, body `1rem`, small `0.875rem`.

## Motion (Framer Motion — restrained, GPU-only)
- **Page transitions:** fade + 8px slide, 300ms `easeOut`.
- **Scroll reveals:** `whileInView` stagger (children 60ms apart), once.
- **Product card:** hover lift `y:-6, scale:1.02`; optional 3D-tilt + spotlight on `(hover:hover)` only, lazy-mounted.
- **Buttons:** `whileTap scale .96`; primary has animated aurora-line underglow on hover.
- **Cart badge:** spring pop on add. **Prices/stock:** animated number tick. **Toasts:** slide+fade.
- Animate **transform/opacity only**. Honor `prefers-reduced-motion` (kill non-essential motion). See master §5 perf rules.

## Component rules
- **Buttons:** primary = aurora gradient fill, glow shadow; secondary = glass; ghost = text + hover bg; destructive = danger. All have hover/active/focus-visible/disabled/loading states.
- **Cards:** `.glass` + `.shadow-card`, 1px hairline, hover border-strong + subtle lift.
- **Inputs:** glass bg, aurora focus ring (`shadow-glow`), inline error text in `danger`, labels always present.
- **Badges:** "Bestseller" / "New" use `.border-aurora` gradient hairline.
- **Nav:** sticky glass header, aurora logo, ⌘K hint, cart + theme + account; mobile = animated full-screen glass menu.
- **AI dock:** bottom-right floating glass pill that expands to a glass chat panel.
- **Empty/loading/error:** every data view has all three. Skeletons use `.skeleton`.

## Signature touches (execute well, not gimmicky)
- ⌘K / Ctrl-K **command palette**: search products + jump to pages/sections (dynamic-import).
- **3D-tilt + spotlight** on featured cards (pointer-fine only).
- **Animated gradient badges** for bestsellers.
- Subtle **parallax** hero with the aurora mesh.
