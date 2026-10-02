# The Twin Cities' Hidden Waterfall: project brief

A self-hosted scrollytelling feature about Ivy Falls, published on GitHub Pages. The author (Gus) supplies the text and media. You design and build the page.

## 1. Goals

1. Present a ~600-word reported story as a polished multimedia feature, on par with NYT / LA Times interactives and ArcGIS StoryMaps.
2. Everything lives in this repo: no accounts, API keys, tile services, or CDNs needed at runtime. The page should still work in ten years.
3. The design supports the text. The story is short and quiet, so the page must be too. No effect may exist only to show off.
4. Work in two gated phases: outline and pitch first, build only after the author approves.

## 2. Ground rules

- **Do not rewrite the story.** `content/story.md` is the source of truth. Put suggested copy edits in a separate list for approval (see 9).
- **Stop at the gates.** After Phase 1, wait for explicit approval before writing any page code.
- **No build step.** Plain HTML, CSS, and ES modules. It must run from `python -m http.server` and from GitHub Pages unchanged.
- **Vendor every dependency** into `/vendor` at a pinned version, with a `VERSIONS.md`. Self-host fonts as WOFF2 in `/fonts`.
- **Never invent facts, quotes, captions, or coordinates.** If something is missing, use a clearly labeled placeholder and add it to the open-questions list.
- Commit after each phase with a descriptive message.

## 3. The story's shape (what the design must serve)

The arc is: a place that is on no map → found by *reading* a map → reached on foot → found in old newspapers → hidden again behind private homes. The emotional beats are curiosity, a small "aha", a muddy walk, a quiet payoff, then a wistful ending.

The narrator is casual and self-deprecating ("If you're like me, which you probably aren't"). The design should feel precise and archival, but never pompous.

## 4. Design concept

> **Revised by the author, 2026-10-01. This overrides the original concept below wherever they conflict.**
> - Sleek, professional and modern, in the spirit of **Vox Atlas** videos: satellite imagery, bold grotesque labels in solid colour boxes, clean motion. The vibe of old maps comes through the map content itself, not the page chrome.
> - **Sleek, minimal retro-futurism:** a light film grain and faint wear (kept low), and story text on off-white sheets that overlap slightly like stacked pages. Most sheets, cards and clippings carry a little damage at random: a torn corner, a folded-over corner, a split running in from an edge, or small nicks. White boxes over photos and maps carry a subtle drop shadow. Captions and controls always sit on clear space. Real aged paper is reserved for the newspaper clippings and the old topo sheet overlaid on the satellite map. "Happy Hollow Falls" is highlighted with a slightly angled blue marker stroke; the opening two paragraphs are framed by four blue corner marks, and the story opens with a decorated initial T (serif, on a small tile of faint blue contour lines inside a fine double rule).
> - **Brand colour is the label blue from the author's overview map: `#4CBBEC`.** White text on it fails contrast (2.2:1), so text on blue uses dark navy `#0D1B24`. Blue text and links on white use `#16739F`.
> - Type: Archivo (title at 900, slightly condensed; dek at semibold; labels), Inter Tight (byline, UI, captions), Source Serif 4 (body). Placeholder captions are plain red text, not tags.
> - Cover: the title sits in the left third, left-aligned on three lines ("The" / "Twin Cities’" / "Hidden Waterfall"), with a thick white rule beneath, then two stacked label boxes: the dek ("You won’t find it on any maps.", Inter Tight semibold) in white on the deep question-mark blue `#306F8C`, and the byline ("By Gustav DeMars", Archivo extra-bold, sentence case) in the light question-mark blue `#4CBBEC` on a dark tag (light blue on white is unreadable) tucked under the dek box’s bottom-right corner at a slight angle. Blue question marks of varied sizes fall from the top of the frame onto the "h" of "The" and cascade down the stepped lines like water over rock ledges, bobbing and slowly turning on the x axis as they go (each mark is a short stack of layers so its thickness shows as it turns; the page drops to flat marks and a lighter stream if the device can't keep up), pour off the end of "Waterfall" (which erodes faintly there), land on the bottom of the cover and flow off to the right, shrinking as they get further from the foot of the falls. Where they land, a faint, wispy whitewater mist swirls up and drifts toward the right third, dissipating within a couple of seconds. In the right third, toward the bottom, a large folded map (two folds, three panels) unfolds by itself about three seconds after the page opens (sooner on hover or tap), settles at a slight angle and stays open. It is white paper with line art in the page's dark colour: a river through the centre and question marks scattered on both banks. The closing map answers the question marks with a blue "Ivy Falls" label.
> - Text can be wider (~44rem), but never at the expense of photo and video size. Media runs wide or full bleed.
> - Photos from the walk are a five-polaroid carousel (square photo, caption on the bottom) fanned like a hand of cards: each blue arrow sends the cards the opposite way to the arrow, cards arc to their new places, and the middle polaroid is raised and tilted as if being chosen.
> - The neatline frame, tick rail, benchmark glyphs and map-collar credits from the original concept are dropped.
>
> The original concept follows for reference.

### Original concept: "The survey sheet"

Treat the page as an old topographic quadrangle that is missing one feature, and let the story ink it in.

**Look.** Mid-century USGS survey sheet, not treasure map. Precision and restraint: fine linework, generous paper margins, small cartographic labels. Avoid kitsch (burnt edges, coffee stains, compass-rose clip art, sepia photo filters).

**Palette (starting values, tune for contrast):**

| Role | Hex | Use |
|---|---|---|
| Paper | `#F2EAD8` | Page background |
| Ink | `#2A2520` | Body text, linework |
| Contour brown | `#A5683A` | Contours, rules, accents |
| Water blue | `#3D6E8A` | River, creek, water labels, links |
| Woodland green | `#C8D4AE` | Map fills only |
| Overprint red | `#B23F2C` | The one highlight colour: route, survey marks, key annotations |

Photos and video stay in natural colour. Give dark, full-bleed sections (`#1E1B17`) to the video and the showpiece so they read as a change of register.

**Type.** Three roles, all open-licensed and self-hosted:
- Display: an old-style serif with character (e.g. Libre Caslon Display or IM Fell).
- Body: a comfortable reading serif (e.g. Source Serif 4), 19–21px, ~62ch measure.
- Labels, captions, coordinates: a condensed sans in letterspaced caps (e.g. Barlow Condensed). Follow map convention: water features in blue italic.

**Signature details.**
- A neatline frame with lat/long tick marks along the page margin; the ticks double as the scroll-progress indicator.
- Section markers styled as survey benchmarks, not numbered chapters.
- Credits and sources laid out like a map collar (scale bar, north arrow, "surveyed by", data sources, date).
- A very light paper grain (one small tiled texture or SVG noise). No heavy overlays.

**Layout patterns (borrowed from the references in 5).**
- Narrow single text column for reading passages.
- "Sidecar" sections: sticky map or graphic with text cards scrolling past it. On mobile, the graphic pins to the top and cards scroll over the lower half.
- Full-bleed photo and video moments with small caption and credit.
- Inline figures that break slightly wider than the text column.

## 5. Research notes: what to borrow

Before pitching, spend time on current examples (search for recent work from NYT, LA Times, Washington Post, Reuters Graphics, The Pudding, South China Morning Post, National Geographic, and the ArcGIS StoryMaps gallery). Look at both ends of the range and report 5–8 references in the outline with one line each on what you'd borrow.

Known reference points:
- **NYT "Snow Fall" (2012):** the template for the genre. Full-bleed media, a terrain flyover, long quiet stretches of plain text between effects.
- **The Pudding:** sticky graphic plus scrolling steps, and their published notes on responsive scrollytelling (simplify on mobile rather than shrink).
- **LA Times Gale Crater / National Geographic "Rewind the Red Planet":** scroll-driven three.js terrain from real elevation data, with GSAP driving camera moves. Both have public write-ups.
- **Reuters Graphics / SCMP:** hand-drawn explanatory diagrams that build one step at a time.
- **ArcGIS StoryMaps:** sidecar blocks, guided map choreography, clean cover and credits blocks.
- **Standard NYT feature pages:** the sleek baseline. Type, spacing, and photo treatment do the work.

## 6. Interaction pitches

Present these (and any better ideas from your research) in the Phase 1 pitch with effort, risk, and a fallback for each. The author wants **subtle accents plus at most one showpiece, and only if it truly fits.**

**Showpiece candidate: the contour reveal (three.js).** At the line "A quick look at a topographical map showed there was something there." A flat paper topo sheet of the bluff sits pinned. As the reader scrolls, the sheet tilts and the contour lines lift into real 3D terrain, exposing the ravine cut into the bluff where the map shows nothing. Build from a real DEM as a heightmap displacing a plane, textured with the same contour drawing so it still looks like paper. Camera scrubbed by scroll, no free orbit. Fallback: a static hillshade image with an annotation.

**Subtle accents:**
1. **Jointing diagram.** SVG cross-section of the gorge beside the Feinberg quote. Scroll scrubs the river cutting down through the rock while one fracture line persists on both banks, ending with a waterfall on each side.
2. **Bank to bank.** A sticky map that hops across the river between marked waterfalls and the points opposite, mirroring the narrator's search, and lands on a blank spot with a red survey mark and a question mark.
3. **Inked route.** The hike drawn as a line that inks itself in with scroll, with stops for the trailhead, the plank crossing, the tracks, the creek crossings, and the falls. Optional small elevation profile.
4. **Clippings.** The 1917 and 1937 scans shown as paper clippings, slightly rotated, with the key sentence underlined in red as it enters view. Full transcription in the alt text or a details element.
5. **The payoff.** Full-bleed video of the falls on a dark section. Muted autoplay loop, visible sound toggle, poster image.
6. **Closing gesture.** The final map pulls back to show the cul-de-sacs around the ravine, and the label *Ivy Falls* is written onto the map in blue italic. The story opens on "it isn't found on any maps"; it ends by putting it on this one.

## 7. Technical plan

**Stack (all vendored):**
- Scrollama for step triggers.
- GSAP + ScrollTrigger for scrubbed animation.
- MapLibre GL JS for maps, with a hand-written minimal style and **local data only** (GeoJSON layers plus a raster hillshade image). No external tiles.
- three.js only if the showpiece is approved; lazy-load it when its section approaches.

**Map data (author can prepare in QGIS, or script with GDAL/Python):**
- DEM for the bluff area from Minnesota lidar (Minnesota Geospatial Commons) or USGS 3DEP via The National Map. Clip tightly, export a 16-bit or RGB-encoded heightmap PNG and a hillshade.
- Contours generated from that DEM, simplified, as GeoJSON.
- River, creek, rail line, trail, roads, and building footprints for the area from OpenStreetMap or state/county open data, as GeoJSON. Record attribution.
- Optional: a public-domain historical USGS topo sheet for the area from USGS topoView, as a georeferenced raster for the archival layer.
- Record every source and licence in `data/SOURCES.md` and in the page credits.

**Repo layout:**
```
index.html
css/        js/        vendor/        fonts/
content/story.md
assets/photos/   assets/video/   assets/clippings/
data/            (geojson, heightmap, hillshade, SOURCES.md)
OUTLINE.md       (Phase 1 deliverable)
```

**Media handling:**
- Images: export responsive sizes (e.g. 800 / 1600 / 2400px), WebP with JPEG fallback, `loading="lazy"`, explicit width and height.
- Video: H.264 MP4, 1080p or lower, target under ~20 MB, `playsinline muted loop`, with poster. Keep every file well under GitHub's 100 MB limit.
- Until real files arrive, use labeled placeholder boxes showing slot ID, aspect ratio, and intended content.

**Quality bar:**
- No scroll hijacking. Native scroll only; animation responds to it.
- `prefers-reduced-motion`: replace scrubbed and 3D sequences with static end states.
- WebGL unavailable or low-power device: static fallbacks.
- Works at 360px wide. Test at 360, 768, 1280, 1920.
- Semantic HTML, real alt text, keyboard reachable controls, AA contrast.
- First load under ~2 MB before lazy assets; no layout shift.
- Open Graph tags and a social image.

## 8. Workflow

**Phase 0: setup.** Read this file and `content/story.md`. List the assets present. Do the research in 5.

**Phase 1: outline and pitch, then STOP.** Write `OUTLINE.md` containing:
- A section-by-section table: section, opening words of the text, layout pattern, media slot ID, slot type (photo / map / video / diagram / clipping), what it should show, asset status (have / need / placeholder), interaction.
- At least one video slot, the map slots, and every photo slot, each with suggested aspect ratio.
- The interaction pitches with effort, risk, and fallback, and a recommendation on whether the showpiece earns its place.
- The research references.
- A shot list: media the author should supply or reshoot.
- Suggested copy edits and open questions (see 9).

Wait for approval.

**Phase 2: skeleton.** Full page with real text, final typography and palette, placeholders in every slot. Review on desktop and mobile widths; share screenshots.

**Phase 3: maps and accents.** Data layers, sidecar maps, route, diagram, clippings.

**Phase 4: showpiece** (only if approved), with fallbacks.

**Phase 5: polish and ship.** Real media, accessibility and performance pass, credits collar, then deploy to GitHub Pages and confirm the live URL works.

## 9. Known text issues and open questions

Raise these in `OUTLINE.md`; do not silently fix them.

- The pasted text has formatting debris: a stray "Happy Hollow Falls" line (probably a subhead), and link brackets that start one word early (`[ according to...`, `[ Minnesota's...`).
- Likely copy edits: "South banks" → "south bank"; "Lilydale Regional park" → "Park"; "I and a friend" → "a friend and I"; "million-dollar house laden cul-de-sacs"; "the park was under consideration to become a state park" (the falls or the land?).
- The reporting dates to spring 2023 (the snowmelt reference). Should the page carry a dateline or an "originally reported" note?
- Byline, photo and video credits, and whether Josh Feinberg is pictured.
- **Location precision.** The falls sit beside private homes and the route follows a rail line. Decide with the author how exact the route map should be and whether to add an access or safety note.
- Reuse rights for the newspaper scans, especially the 1937 clipping.
- Which two "opposite" waterfalls to show in the bank-to-bank map.

## 10. Avoid

- Generic template looks: gradient heroes, card grids, glassmorphism, emoji, stock icons.
- Animating every paragraph. Most of the text should simply sit still and read well.
- Parallax for its own sake, autoplaying sound, free-orbit 3D controls that trap scroll.
- Any runtime dependency on a third-party server.
