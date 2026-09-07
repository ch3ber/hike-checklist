## Project Overview

`hike-checklist` is a personal, Spanish-language hiking packing checklist. The same owner uses it for mostly repeatable outings, so the normal flow must remain immediate: do not add onboarding questions, trip setup wizards, or automatic questionnaires. Most outings only require adjusting water and a few specific items.

The product name and visual identity are `TREK//SYS`: a dark, compact, sci-fi field interface. Preserve that identity and the Spanish UI.

## Product Priorities

- Mobile is the primary experience. Design and verify changes at 320 px, 360 px, and 390 px widths.
- Do not add desktop-specific enhancements unless the user explicitly requests them. A desktop status panel currently exists, but mobile behavior and performance take precedence.
- Use **“empacados”** consistently for checked/packed items. Do not introduce alternatives such as “listos”, “cargados”, or “marcados” in UI copy. Item names such as “Agua cargada” are content and should not be renamed for this rule.
- The checklist must work quickly with one hand. Keep tap targets comfortable and retain both swipe-to-discard and the visible `Quitar` action.
- State is personal and local to the device. Changes are saved automatically; do not require an account or remote persistence unless explicitly requested.

## Business Rules

### Weight

- Store every weight internally in kilograms.
- Display weights from 0 through 0.999 kg as whole grams using the `G` unit.
- Display weights greater than 0.999 kg in kilograms using the `KG` unit. In practice, 999 g remains `999 G`, while 1 kg becomes `1.000 KG` in editable fields.
- Quantity-based items use total weight: unit weight multiplied by the selected quantity. The same grams/kilograms display threshold applies after calculating that total.
- Keep the conversion logic centralized in `src/components/trek/trek-utils.ts`; do not duplicate thresholds in components.

### Checklist state

- `chk`: empacados.
- `off`: descartados. Discarded items do not count toward totals and are removed from `chk` when discarded.
- `qty`: quantity overrides.
- `wov`: per-item weight overrides, stored as unit weights in kilograms.
- `prof`: optional profiles; currently only `frio`.
- `open`: expanded checklist sections. `personales` is open for a new user.
- `extra`: user-created items shown in the custom `Extras` section.

Resetting the checklist clears only `chk`. Discards, quantities, weight overrides, profiles, expanded sections, and extras are preserved.

## Mobile Performance Invariants

- The page must never scroll horizontally. At every supported mobile width, `document.documentElement.scrollWidth` must not exceed the viewport width and `scrollX` must remain zero.
- The fixed bottom action dock must remain fully visible while scrolling and during animations.
- Keep `overflow-x: clip` on the document and clipping on full-width animated containers such as the HUD and dock.
- Do not animate a full-width pseudo-element beyond its container unless that container clips paint. A previous HUD sweep translated a viewport-wide pseudo-element to the right and temporarily doubled the document width.
- On mobile, avoid continuously animating viewport-sized backgrounds, `mix-blend-mode`, sticky `backdrop-filter`, large shadows, or per-section shadows/colors. These caused severe scroll jank.
- Prefer contained `transform` and `opacity` animations on small elements. Preserve `prefers-reduced-motion` behavior.
- Never leave `will-change` on every checklist row. It is enabled only while a row is actively swiped and must return to `auto` afterward.
- Do not run the filter-result animation during initial mount in addition to the page-entry animation.

The last verified stress case used IFAK open or 89 visible pending rows at 390 px: no horizontal overflow, no persistent row layers, and eight lightweight continuous animations.

## Architecture

- Astro page entry: `src/pages/index.astro`.
- Interactive React island: `src/components/trek/TrekSystem.tsx`, hydrated with `client:load`.
- Checklist data: `src/DB/data.json`, imported through the `@DB` alias configured in `astro.config.mjs`.
- Shared domain types: `src/types/trek.ts`.
- State persistence: `src/components/trek/useTrekState.ts` using localStorage key `treksys_v2`.
- Calculations, unit formatting, totals, and shared manifest formatting: `src/components/trek/trek-utils.ts`.
- UI components: `src/components/trek/`.
- Styles are split into `trek-base.css`, `trek-checklist.css`, and `trek-manifest.css`, composed by `trek-sys.css`.
- Deployment uses the Vercel adapter with static output.

Search is accent-insensitive. Filters are `Todos`, `Pendientes`, `Empacados`, and `Descartados`; active search/filter results force matching sections open.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Use pnpm for project commands:

```
pnpm build
pnpm format:check
```

Before completing UI changes:

1. Run `pnpm build`.
2. Run Prettier against modified TypeScript/TSX/CSS files and run `git diff --check`.
3. Verify the production build in a mobile viewport, not only the responsive desktop emulator view.
4. Test the narrowest 320 px layout, a quantity item such as water, a long section such as IFAK, filters, swipe discard, and the fixed bottom dock.
5. For animation or layout changes, sample `scrollWidth` across a complete animation cycle rather than checking it only once.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
