# Vendored dependencies

Everything the page loads at runtime lives in this repo. Pin versions here when adding or updating anything.

## Fonts (`/fonts`)

Fetched from the Fontsource npm packages via jsDelivr on 2026-10-01. Latin subset only. Licence texts are alongside the font files.

| Family | Package | Version | Files | Licence |
|---|---|---|---|---|
| Archivo (variable: wght 100–900, wdth 62–125) | `@fontsource-variable/archivo` | 5.3.0 | `archivo-latin-standard-normal.woff2` | SIL OFL 1.1 (`OFL-archivo.txt`) |
| Libre Caslon Text 400, 400 italic | `@fontsource/libre-caslon-text` | 5.3.0 | `libre-caslon-text-latin-400-normal.woff2`, `libre-caslon-text-latin-400-italic.woff2` | SIL OFL 1.1 (`OFL-libre-caslon-text.txt`) |
| Inter Tight (variable, wght 100–900) | `@fontsource-variable/inter-tight` | 5.3.0 | `inter-tight-latin-wght-normal.woff2` | SIL OFL 1.1 (`OFL-inter-tight.txt`) |
| Source Serif 4 (variable, wght 200–900) | `@fontsource-variable/source-serif-4` | 5.3.0 | `source-serif-4-latin-wght-normal.woff2`, `source-serif-4-latin-wght-italic.woff2` | SIL OFL 1.1 (`OFL-source-serif-4.txt`) |

## JavaScript (`/vendor`)

None yet. Planned for Phase 3 (pin versions when added): Scrollama, GSAP + ScrollTrigger, MapLibre GL JS. three.js only if the showpiece is approved (Phase 4).
