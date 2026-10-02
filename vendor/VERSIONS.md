# Vendored dependencies

Everything the page loads at runtime lives in this repo. Pin versions here when adding or updating anything.

## Fonts (`/fonts`)

Fetched from the Fontsource npm packages via jsDelivr on 2026-10-01. Latin subset only. Licence texts are alongside the font files.

| Family | Package | Version | Files | Licence |
|---|---|---|---|---|
| Fraunces (variable: wght, opsz, SOFT, WONK) | `@fontsource-variable/fraunces` | 5.3.0 | `fraunces-latin-full-normal.woff2` | SIL OFL 1.1 (`OFL-fraunces.txt`) |
| EB Garamond Italic 500 | `@fontsource/eb-garamond` | 5.3.0 | `eb-garamond-latin-500-italic.woff2` | SIL OFL 1.1 (`OFL-eb-garamond.txt`) |
| Inter Tight (variable, wght 100–900) | `@fontsource-variable/inter-tight` | 5.3.0 | `inter-tight-latin-wght-normal.woff2` | SIL OFL 1.1 (`OFL-inter-tight.txt`) |
| Source Serif 4 (variable, wght 200–900) | `@fontsource-variable/source-serif-4` | 5.3.0 | `source-serif-4-latin-wght-normal.woff2`, `source-serif-4-latin-wght-italic.woff2` | SIL OFL 1.1 (`OFL-source-serif-4.txt`) |

## JavaScript (`/vendor`)

None yet. Planned for Phase 3 (pin versions when added): Scrollama, GSAP + ScrollTrigger, MapLibre GL JS. three.js only if the showpiece is approved (Phase 4).
