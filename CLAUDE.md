# The Twin Cities' Hidden Waterfall: project brief

A self-hosted scrollytelling feature about Ivy Falls, published on GitHub Pages. The author (Gus) supplies the text and media. You design and build the page.

## 0. Current status (read this first)

*Last updated 2026-10-02.*

- **Phase:** Phase 1 (outline) approved. Phase 2 (skeleton) is in progress: the full page exists with real text and placeholders, and the design has been iterated round by round with the author. **The cover / title screen is approved. Treat it as locked: don't change it unless the author asks.** Its exact spec is in §4.
- **Section 4 is the current design.** Where it conflicts with anything older in this file (the original "survey sheet" concept, palette table, type list, layout patterns), §4's top block wins.
- **Next up:** review the story body below the cover in the same round-by-round way, then Phase 3 (real maps, route, diagram, clippings) once the author is ready.
- **Media (started 2026-10-09):** the author drops originals into `incoming/` (git-ignored) named by slot; web copies go in `assets/`. **V1 is in:** the author's 64 s edited montage (`incoming/IvyFallscut1.mp4`, 131 MB) is kept whole, compressed to `assets/video/ivy-falls.mp4` (720p, two-pass 2.2 Mb/s, light hqdn3d denoise, AAC 96k, faststart; 18.5 MB, since a CRF 26 1080p encode came out at 77 MB) with `ivy-falls-poster.jpg` (first frame). ffmpeg is installed via winget; in the agent shell call it by full path (`$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*/bin/ffmpeg.exe`). `tools/serve.ps1` now answers byte-range requests, so video plays in the preview. **Second batch (2026-10-09):** the author's own maps are in: `Overviewmap.png` → M4 (static for now, `assets/maps/overview-*.jpg`), `Ivyfallsredarrow.png` (lidar-style hillshade, red "Ivy Falls" arrow) → M3, fading in over the still-placeholder M2 when the "aha" card is a third of the way up (`.stage.is-revealed`), `Ivyfallsclosemap.png` (satellite, blue label among the cul-de-sacs) → M5, first a closing map at the very end, then (author request, 2026-10-09) moved into the Stage 2 sticky frame and rebuilt as one "camera" (round 2, 2026-10-09, author asked for a seamless, natural zoom): `.zoom > .zoom__world` holds the overview, `assets/maps/zoom-detail.jpg` (full-res overview tile, x 48.8–92.6%, y 48.7–97.3%, with the overview's Ivy Falls pin and label removed: pin filled from the aligned close-up, label filled by cloning real imagery from upstream along the river and blending, duplicate bridge inpainted) and the close-up, each placed over its own ground. The close-up's footprint on the overview (left 65.456%, top 72.516%, w 7.922%, h 7.998%) was measured by a scale search with template matching (close-up = 0.336 × overview px per close-up px at 1400 wide, no rotation); its dot lands exactly on the overview pin's tip. Round 4 (author request, 2026-10-09): **back to one zoom.** The "Reaching Ivy Falls takes about 45 minutes…" paragraph moved out of the stage into a plain `.sheet` between the topo stage and the route stage, so the two maps no longer run back to back. The route stage now has two cards: "The first leg…" (`data-zoom="0"`, overview) and "The next stretch…" (`.card--zoom`, `data-zoom="1"`), which zooms straight to the close-up in one 2.6 s move about a fixed screen point (falls glide steadily to their final spot), with the earlier timings (detail tile 0–12%, close-up 30–62%, blur 28–55%, colours ease back 50–100%). The stop logic below still supports any data-zoom values. (Superseded) Round 3 (same day, author request): **two-step zoom**. Each route card carries `data-zoom` (0 overview, 0.36 partway, 1 close-up); on every scroll the camera goes to the value of the last card whose top is above 67% of the viewport (position-based, not IntersectionObserver, so jumps can't strand it). `e` is the camera position on a log-zoom scale (z = k^e); each move eases (cubic in-out) from wherever the camera is, over 0.9 s + 2 s × distance. The partway stop is 0.36, not 0.5: at true log-halfway the overview export is visibly blocky and the patched label area shows at rest; at 0.36 the author's own overview, label and pin are still crisp (the label is about 190 px wide on desktop). A proper mid-zoom export from the same satellite source would allow a true halfway stop. The camera tracks the falls: during the first move (0→0.36) the falls pan to their final screen position (smoothstep), and the second move pushes straight in on them; on tall screens the falls end at 36% from the top (the close-up is fitted 1.2× its full height), clear of the text cards. Opacities: the label-free detail tile fades in over 46–58% (only during the second move), the close-up over 60–88%, tinted to match the overview (brightness 0.68, saturate 1.5) and easing to its own colours by the end; a ~4px on-screen blur on the overview from 56–80% acts as depth of field and hides its pixels; 10% feathered edges on the tile and close-up. End framing centres the falls (desktop: close-up fills the frame; tall screens: fit its full height). `?zoomAt=0.5` freezes the zoom for checking. Reduced motion: quick fade swap. Scripts used to build the tile live only in the session scratchpad; the tile is a derived image and should be rebuilt if the source maps change. The story now ends on the closing paragraph, then the credits. The 1937 South St. Paul Reporter scan (author's yellow highlights baked in) → C2, with a verbatim transcription (original typos kept). Four photos fill the carousel, now 4 cards in walk order: flooded road signs (P2), flooded pool & yacht club (P3), a person walking up the ravine (P4), the falls through branches (`THisone.jpg`, P5), and (added later the same day, at the author's request as the 5th card) the railroad tracks beside the flooded flats (`IMG_3258.JPG`, P6, `assets/photos/tracks.jpg`, caption "Tracks above the flooded flats."). Polaroid captions are Claude's drafts awaiting approval. Maps and scan come in 1200/2400 px JPEGs (`srcset`), photos as 800 px square crops; all lazy. **M2 (latest, 2026-10-09, second map):** the author's satellite screenshot of the river valley where the Minnesota River meets the Mississippi, river running left to right (`incoming/river-search2.png`, 56 px UI tab cropped off the left, 2820×1190; `assets/maps/river-search2-1400/2400.jpg`; the first river screenshot was retired). Now (author request) a white 3D mouse pointer instead of the red dot, no tail (classic arrow, tip at the old dot position, ×1.5: drop shadow, grey extruded side, white-to-pale face gradient, fine dark edge), and much faster: 48 px/s downstream, 110 px/s up and down at an 800 px frame (same path logic otherwise), bouncing between two walls `WALLS` ([x, top, bottom] fractions): the edges of the wooded river corridor, hand-placed on the image where woods meet the roads and houses on the bluffs (checked against overlays; nudged away from the apartments by the bridge and out to the Minnesota River's far bank). So it crosses the rivers and roams the woods, as the author asked. It no longer wraps: near the right end it heads straight in (last 260 image px, at 60% speed) and stops on `TARGET` (2192, 938 image px), the spot the author marked with a blue X on a copy of the map (woods among the houses south of the river; measured from the X, the marked copy aligns pixel for pixel with the cropped map); a soft white ring opens from the tip every 2.2 s while it rests; it starts over each time the section comes back into view. The image is now kept flush right (`view.x = W − w`) so that spot is always on screen. Wide screens: image covers the frame. Tall screens: image fills the top 58% (cards cover the rest). `?vizAt=40` fast-forwards for checking. Reduced motion: still dot mid-corridor. M3 still fades in over it at the "aha" card. Still placeholders: P1 (Feinberg 2020), D1 diagram, C1 (1917 clipping).
- **Waiting on the author:** portfolio URL for the byline link (it points to `#credits` for now); P1 photo and the 1917 clipping; approval of the polaroid captions; who is pictured in P4; sources and credits for the map imagery, elevation data and the 1937 scan; V1 video credit (if any beyond the caption); final captions and credits; original reporting date. Deliberately on hold at the author's request: copy edits, location-precision and rail-line decisions, which "opposite" waterfalls to show.
- **Files:** `index.html` (page), `css/main.css`, `js/main.js` (cover question-mark cascade, byline flip, weathered paper edges, photo deck, progress bar), `fonts/` (pinned in `vendor/VERSIONS.md`), `assets/maps/stpaul-west-1951-bluffs.jpg` (crop of the public-domain 1951 USGS St. Paul West quadrangle), `OUTLINE.md` (slot table, pitches, open questions, dek options, change log), `content/story.md` (source text; changes so far, all at the author's request: "Waterfall" capitalised in the title; "which you probably aren’t," cut from "If you’re like me…" on 2026-10-09).
- **Live site:** https://gustavjdemars-rgb.github.io/Ivy-Falls/ (repo `gustavjdemars-rgb/Ivy-Falls`, Pages from `main` root). Push only when the author says so.

### How to work on this project

- **Previewing:** run `powershell -File tools/serve.ps1 -Root .` (serves on http://localhost:8417/; run it in the background. Port 8000 is used by another project, sata-scout).
- **Debugging the question marks:** open `http://localhost:8417/?debug` to see the simulation drawn over the cover (lines, each mark's hitbox; red = jittering, orange = stuck, pink = inside the letters) with live counts. `powershell -Command "& tools/probe.ps1 -Width 1280 -Height 800 -Wait 40000"` runs it headless (debug runs are seeded, so repeatable) and prints the totals; aim for 0 stuck and 0 in text, worst jitter under ~4/s, and jolts only from gentle bumps.
- **Screenshots:** `powershell -Command "& tools/shoot.ps1 -Out review/<round> -Shots '.cover__title,.lede' -Widths 360,768,1280,1920"` (use `-Command`, not `-File`: with `-File` a list of widths arrives as one string and the tool fails with "Invalid parameters") (headless Chrome). `-Wait` lets the cover animation fill in; `-Eval` runs JS first (e.g. to flip the byline). `review/` is git-ignored.
- **Each round of feedback:** make the changes, check them in screenshots at phone and desktop widths, fix what looks off, commit with a descriptive message, then update §0 and §4 here so a fresh session can pick up. Report back in plain language and ask before pushing.
- **The author's taste, learned so far:** sleek, modern and fairly minimal, with a vintage/archival flavour and Vox Atlas energy; subtle over flashy; dislikes heavy texture and anything that looks like a template. Prefers seeing options pitched (about 5) before a big new element is built. Check contrast for any new text colour (the light blue `#4CBBEC` can't carry white text, or be text on white).
- **Performance guard:** the 3D question marks fall back to flat marks automatically if frames drop. Keep first load under ~2 MB (currently ~660 KB).

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

The narrator is casual and self-deprecating ("If you're like me, sometimes you procrastinate by looking at maps"). The design should feel precise and archival, but never pompous.

## 4. Design concept

> **Current design, revised with the author 2026-10-01 to 2026-10-02. This overrides the original concept below wherever they conflict. The cover (the "Cover" and byline bullets) is approved and locked.**
> - Sleek, professional and modern, in the spirit of **Vox Atlas** videos: satellite imagery, bold grotesque labels in solid colour boxes, clean motion. The vibe of old maps comes through the map content itself, not the page chrome.
> - **Sleek, minimal retro-futurism:** a light film grain and faint wear (kept low), and story text on straight off-white sheets that overlap slightly like stacked pages. A few sheets, cards and clippings (about a third) carry a little damage at random: a torn corner, a folded-over corner, a split, or small nicks. Kept simple and modern. White boxes over photos and maps carry a subtle drop shadow. Captions and controls always sit on clear space. Real aged paper is reserved for the newspaper clippings and the old topo sheet overlaid on the satellite map. "Happy Hollow Falls" is highlighted with a slightly angled blue marker stroke; the opening two paragraphs are framed by four blue corner marks. The story opens with a plain T (the blue boxed initial was removed at the author's request, 2026-10-09).
> - **Brand colour is the label blue from the author's overview map: `#4CBBEC`.** White text on it fails contrast (2.2:1), so text on blue uses dark navy `#0D1B24`. Blue text and links on white use `#16739F`.
> - Type: Alfa Slab One (title: a bold vintage slab serif), Archivo (byline, labels, question marks), Inter Tight (dek, UI, captions), Source Serif 4 (body), Special Elite (Polaroid captions only). Placeholder captions are plain red text, not tags.
> - Cover: the title sits in the left third, left-aligned on three lines ("The" / "Twin Cities’" / "Hidden Waterfall"), with a thick white rule beneath (running the full width of "Hidden Waterfall", spaced equally between the letters and the dek box), then two stacked label boxes: the dek ("You won’t find it on any maps.", Inter Tight semibold) in white on the deep question-mark blue `#306F8C`, and the byline ("By Gustav DeMars", Archivo extra-bold, sentence case) in the light question-mark blue `#4CBBEC` on a dark tag tucked under the dek box’s bottom-right corner at a slight angle. A sparse stream of clearly visible blue question marks (mostly the bright blue, mid-size to large) falls from the top of the frame onto the "h" of "The" and cascade down the stepped lines like water over rock ledges, rocking gently and slowly turning on both the x and y axes as they go. The marks move like something thick and soft (syrup or jello), not hard pieces: a live simulation in `js/main.js` where every contact is a damped soft cushion, so marks bump gently, squish very slightly and ease apart, never pass through each other, never snap or shake, sink through "thick air" at an unhurried speed, bob on a slow wave along each line, can never drift backwards or spill off the left of the title, and never sink into the letters. Hitboxes are a little inside the glyph outline. The author rejected hard-body physics (it shook); keep any change smooth and viscous, all of them passing behind the title text, never in front of it (author request 2026-10-09; before that about a quarter went behind; `spawn()` still makes the same random draw so the seeded cascade is unchanged) (each mark is a tight stack of 11 layers so its edge reads solid as it turns; the page drops to flat marks and a lighter stream if the device can't keep up), pour off the end of "Waterfall" and fall straight down out of the cover (no floor). Marks were made about 25% bigger on 2026-10-02. The right third holds the redacted map: a fragment of the real 1951 USGS St. Paul West sheet (public domain) around Lilydale and the south bluffs, tilted and filling the right third, with seven black redaction bars of varied length and angle across it (illustrative, pinning nothing down). On hover the bars shift a little and snap back. A small credit sits well below it. On tablets and phones it stacks under the title. The route map's zoom ends on the close-up with the blue "Ivy Falls" label, answering the question marks.
> - The falls video (V1) runs full bleed at 16:9 on every width (the planned 4:5 phone crop is not done: the montage's shots aren't centred). It has no download until it nears view (`preload="none"`), plays muted on a loop while 40% visible, pauses when scrolled away, and stays paused if the reader pauses it; with reduced motion it waits for play. Controls are two large round light-blue buttons (play/pause, sound) side by side, centred along the bottom of the video (author request 2026-10-09), matching the deck arrows; the caption reads "Voice of: Josh Feinberg" (author's wording), made larger at the author's request (`.film__voice`: about 1.2–1.55rem, near-white, the name bold in light blue, a short light-blue rule in front); without JS it falls back to native controls.
> - Text can be wider (~44rem), but never at the expense of photo and video size. Media runs wide or full bleed.
> - Cover share (author request 2026-10-09, a deliberate change to the locked cover): a small square tag (`.cover__share`, 2.4em, same dark `#121B22` tag, faint blue edge and −1.5° tilt as the byline) just right of the byline in `.cover__byrow`, holding a light-blue share icon; hover turns it light blue with a navy icon, like the byline's back. Same share code as the end button (`[data-share]`): native share sheet, else copies the link and the icon becomes a tick for 2.5 s.
> - The byline tag is a link to the author's portfolio (URL to come). Each hover turns it over on its x axis: to a light-blue "See my work →" side, then back to the byline on the next hover.
> - Body order: lede → Stage 1 sticky map (M2→M3) → "Reaching Ivy Falls…" sheet → Stage 2 route map (M4, zooming into the close-up M5 at its last card) → photo carousel (moved below the route map at the author's request, 2026-10-09) → the dark video section → the tiered-waterfall paragraph (set larger, with generous space above and below) → Happy Hollow Falls sheet and clippings → C3, a full St. Paul Pioneer Press Rotogravure page, Dec. 27, 1942, "Happy Hollow" (author's PDF `incoming/appyhollowfullpage.pdf`, rendered with PyMuPDF at 200 dpi → `assets/clippings/pioneer-press-1942-12-27-1000/1800.jpg`), added 2026-10-09 after the 1937 clipping. The caption panel is too small to read, so four light-blue corner marks (`.loupe`, positioned from the PDF text layer: x 67.9%, y 41%, w 28.7%, h 14.1%) sit over it; hover, keyboard focus or a tap opens `.loupe__card`, a crisp off-white sheet with a light-blue top rule that grows out of the panel, holding the caption verbatim (headline in Archivo condensed, body in Source Serif, credit "Pioneer Press photos by E. L. Martin"); tap again, Escape or a tap elsewhere closes it. → backyard photo (P7) → closing paragraph (`.sheet--last`, fitted snugly to its text at the author's request; note the JS-added folded corner comes after the paragraph, so `.sheet > :last-child` misses it there) → end mark (`.endmark`, added 2026-10-09: now (third version, author asked for simpler, mid-century modern): a small 12-ray starburst in deep blue `#306F8C`, a dot each side and a short ink rule beyond, about 12rem wide, inline SVG → "Share this story" button (light-blue label box, navy text; native share sheet via `navigator.share`, else copies the canonical URL and says "Link copied") → credits. A canonical link and og:url point at the live site; the og:image (`assets/og.jpg`) is still not made, so shared links have no preview image yet.
> - Photos from the walk are a five-polaroid carousel (square photo, caption on the bottom) fanned like a hand of cards: each blue arrow sends the cards the opposite way to the arrow, cards arc to their new places, and the middle polaroid is raised and tilted as if being chosen. Made bigger at the author's request on 2026-10-09 (cards about 30vw, max 24rem; 64vw on phones; fan spread 19% of the hand). Cards are real Polaroid proportions: warm off-white frame `#F5F2EA`, border 5.5% of the card width at top and sides, deep bottom border, captions typewritten in Special Elite (vendored, Apache 2.0; replaced a handwritten Caveat try the same day) in dark ink `#2B2A28`, tilted about −0.6°. The carousel sits on a full-width band of fine linen (`.deck::before`: `#DCD7CC`, faint 3–4px weave lines, the page grain and wear, soft inset shading top and bottom), flush between the route map and the video; kept quiet so it doesn't pull focus.
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
